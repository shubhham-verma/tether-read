'use client';

import ePub from "epubjs";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import Skeleton from "@/components/Skeleton";
import { FaArrowRight, FaArrowLeft, FaListUl, FaExpand, FaCompress, FaPlus, FaMinus } from "react-icons/fa6";
import { FaHome } from "react-icons/fa";
import { Spinner } from "flowbite-react";

// Debounce utility function
const useDebounce = (callback, delay) => {
  const debounceRef = useRef(null);

  return useCallback((...args) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

export default function ReaderPage() {
  const { bookid } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();

  // State management
  const [toc, setToc] = useState([]);
  const [rawToc, setRawToc] = useState([]); // Store raw TOC for lazy flattening
  const [showTOC, setShowTOC] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(-1);
  const [totalPages, setTotalPages] = useState(-1);
  const [activeChapterHref, setActiveChapterHref] = useState(null);
  const [currentChapterName, setCurrentChapterName] = useState("Loading...");
  const [signedUrl, setSignedUrl] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(100); // Percentage
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Refs
  const viewerRef = useRef(null);
  const renditionRef = useRef(null);
  const bookRef = useRef(null);
  const tocRef = useRef([]);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // Flatten TOC utility (lazy)
  const flattenTOC = useCallback((items, depth = 0) => {
    return items.flatMap((item) => [
      { label: `${"— ".repeat(depth)}${item.label}`, href: item.href },
      ...(item.subitems ? flattenTOC(item.subitems, depth + 1) : []),
    ]);
  }, []);

  // Debounced functions
  const debouncedProgressSave = useDebounce(async (cfi, progressPercent) => {
    if (!user || !bookid) return;

    try {
      const token = await user.getIdToken();
      await fetch(`/api/book/${bookid}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          cfi: cfi,
          // currentPage: pageNum,
          percentage: progressPercent,
          lastRead: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to save progress to server:', error);
      // Fallback to localStorage
      localStorage.setItem(`book_${bookid}_cfi`, cfi);
      localStorage.setItem(`book_${bookid}_progress`, progressPercent.toString());
    }
  }, 1000);

  // Load font size from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('reader_font_size');
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }
  }, []);

  // Save font size to localStorage when changed
  useEffect(() => {
    localStorage.setItem('reader_font_size', fontSize.toString());
  }, [fontSize]);

  // Fetch book URL
  useEffect(() => {
    if (!bookid || !user || signedUrl) return;

    const fetchBook = async () => {
      try {
        const token = await user.getIdToken();
        const result = await fetch(`/api/book/${bookid}/url`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });

        if (!result.ok) {
          throw new Error(`Failed to fetch book: ${result.statusText}`);
        }

        const data = await result.json();
        setSignedUrl(data.url);
      } catch (error) {
        console.error("Failed to generate url", error);
        setError("Failed to load book. Please try again.");
      }
    };

    fetchBook();
  }, [bookid, user, signedUrl]);

  // Touch gesture handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current || !touchStartY.current || !renditionRef.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;

    // Only trigger if horizontal swipe is more significant than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        renditionRef.current.next();
      } else {
        renditionRef.current.prev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Click navigation handler
  const handleReaderClick = (e) => {
    if (!renditionRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // Divide into three zones: left (30%), middle (40%), right (30%)
    if (clickX < width * 0.3) {
      renditionRef.current.prev();
    } else if (clickX > width * 0.7) {
      renditionRef.current.next();
    }
    // Middle zone does nothing (allows text selection)
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!renditionRef.current) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      renditionRef.current.next();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      renditionRef.current.prev();
    }

    // Chapter navigation with Ctrl
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateToNextChapter();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateToPrevChapter();
      }
    }

    // Fullscreen toggle
    if (e.key === "F11" || (e.key === "f" && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      setIsFullscreen(prev => !prev);
    }

    // Font size controls
    if ((e.ctrlKey || e.metaKey) && e.key === "=") {
      e.preventDefault();
      setFontSize(prev => Math.min(prev + 10, 200));
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "-") {
      e.preventDefault();
      setFontSize(prev => Math.max(prev - 10, 50));
    }
  }, []);

  // Chapter navigation functions
  const navigateToNextChapter = () => {
    const currentIndex = tocRef.current.findIndex(item => item.href === activeChapterHref);
    if (currentIndex < tocRef.current.length - 1) {
      const nextChapter = tocRef.current[currentIndex + 1];
      renditionRef.current.display(nextChapter.href);
    }
  };

  const navigateToPrevChapter = () => {
    const currentIndex = tocRef.current.findIndex(item => item.href === activeChapterHref);
    if (currentIndex > 0) {
      const prevChapter = tocRef.current[currentIndex - 1];
      renditionRef.current.display(prevChapter.href);
    }
  };

  // Apply font size to rendition
  useEffect(() => {
    if (renditionRef.current) {
      try {
        renditionRef.current.themes.fontSize(`${fontSize}%`);
      } catch (error) {
        console.error('Failed to apply font size:', error);
      }
    }
  }, [fontSize]);

  // Main EPUB initialization effect
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }

    if (viewerRef.current && signedUrl) {
      setIsLoading(true);
      setError(null);

      try {
        const book = ePub(signedUrl);
        const rendition = book.renderTo(viewerRef.current, {
          width: "100%",
          height: "100%",
          spread: "both",
        });

        renditionRef.current = rendition;
        bookRef.current = book;

        // Apply font size
        rendition.themes.fontSize(`${fontSize}%`);

        // Setup locations + load saved position
        book.ready.then(async () => {
          try {
            await book.locations.generate(5000);
            setTotalPages(book.locations.length());

            // Try to load saved progress from server first
            let savedCfi = null;
            try {
              const token = await user.getIdToken();
              const response = await fetch(`/api/book/${bookid}/progress`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                }
              });
              if (response.ok) {
                const progressData = await response.json();
                savedCfi = progressData.currentCfi;
              }
            } catch (error) {
              console.error('Failed to load progress from server:', error);
            }

            // Fallback to localStorage
            if (!savedCfi) {
              savedCfi = localStorage.getItem(`book_${bookid}_cfi`);
            }

            if (savedCfi) {
              await rendition.display(savedCfi);
            } else {
              await rendition.display();
            }

            setIsLoading(false);
          } catch (error) {
            console.error('Failed to setup book locations:', error);
            setError('Failed to initialize book. Please try refreshing.');
            setIsLoading(false);
          }
        }).catch(error => {
          console.error('Book ready failed:', error);
          setError('Failed to load book content.');
          setIsLoading(false);
        });

        // Load TOC (store raw for lazy flattening)
        book.loaded.navigation.then((nav) => {
          setRawToc(nav.toc);
          tocRef.current = flattenTOC(nav.toc);
        }).catch(error => {
          console.error('Failed to load TOC:', error);
        });

        // Handle page relocations
        rendition.on("relocated", (location) => {
          try {
            const percentage = book.locations.percentageFromCfi(location.start.cfi);
            const progressPercent = Number((percentage * 100).toFixed(2));
            const pageNum = book.locations.locationFromCfi(location.start.cfi);

            setProgress(progressPercent);
            setCurrentPage(pageNum);

            // Debounced save to server/localStorage
            debouncedProgressSave(location.start.cfi, pageNum, progressPercent);

            // Update active chapter
            const currentHref = location.start.href;
            const activeChapter = tocRef.current.find((item) =>
              currentHref.includes(item.href)
            );
            if (activeChapter) {
              setActiveChapterHref(activeChapter.href);
              setCurrentChapterName(activeChapter.label.replace(/^— /, ''));
            }
          } catch (error) {
            console.error('Error handling relocation:', error);
          }
        });

        // Add touch and click listeners
        rendition.on("rendered", () => {
          rendition.getContents().forEach((content) => {
            const doc = content.document;
            doc.addEventListener("keydown", handleKeyDown);
            doc.addEventListener("touchstart", handleTouchStart, { passive: true });
            doc.addEventListener("touchend", handleTouchEnd, { passive: true });
          });
        });

        // Global event listeners
        document.addEventListener("keydown", handleKeyDown);

        return () => {
          try {
            if (rendition) {
              rendition.destroy();
            }
            document.removeEventListener("keydown", handleKeyDown);
          } catch (error) {
            console.error('Error during cleanup:', error);
          }
        };

      } catch (error) {
        console.error('Failed to initialize EPUB:', error);
        setError('Failed to load book. Please check if the file is a valid EPUB.');
        setIsLoading(false);
      }
    }
  }, [signedUrl, user, loading, router, fontSize, bookid]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending debounced saves
      if (debouncedProgressSave.cancel) {
        debouncedProgressSave.cancel();
      }
      // Clean up localStorage if needed
      // Note: We keep the progress data, but could clear temporary data here
    };
  }, [debouncedProgressSave]);

  // Lazy load flattened TOC when TOC drawer opens
  useEffect(() => {
    if (showTOC && toc.length === 0 && rawToc.length > 0) {
      const flattened = flattenTOC(rawToc);
      setToc(flattened);
    }
  }, [showTOC, toc.length, rawToc, flattenTOC]);

  // Font size handlers
  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 10, 200));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 10, 50));

  if (loading) return <Skeleton page='shelf' />;
  if (!user) return null;

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-yellow-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-100">
      {/* Header with breadcrumb navigation - hidden in fullscreen */}
      {!isFullscreen && (
        <div className="bg-black text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push('/shelf')}
              className="text-green-500 hover:text-green-400"
            >
              <FaHome />
            </button>
            <span className="text-gray-300">│</span>
            <span className="text-sm text-gray-300 truncate max-w-xs">
              {currentChapterName}
            </span>
          </div>

          {/* Font size controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={decreaseFontSize}
              className="text-white hover:text-green-400 p-1"
              title="Decrease font size (Ctrl+-)"
            >
              <FaMinus size={14} />
            </button>
            <span className="text-sm text-gray-300 min-w-[3rem] text-center">
              {fontSize}%
            </span>
            <button
              onClick={increaseFontSize}
              className="text-white hover:text-green-400 p-1"
              title="Increase font size (Ctrl+=)"
            >
              <FaPlus size={14} />
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white hover:text-green-400 ml-4 p-1"
              title="Toggle fullscreen (F11)"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        </div>
      )}

      {/* Main reader component */}
      <div
        ref={viewerRef}
        className={`relative w-full lg:w-13/14 bg-yellow-100 cursor-pointer overflow-hidden ${isFullscreen ? 'h-screen' : 'h-[85vh]'
          }`}
        onClick={handleReaderClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Spinner color="success" size="xl" />
              <p className="mt-4 text-gray-600">Loading book...</p>
            </div>
          </div>
        )}
      </div>

      {/* Opacity overlay */}
      <div
        className={`fixed inset-0 bg-black z-10 transition-opacity duration-500 ${showTOC ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setShowTOC(false)}
      />

      {/* TOC Drawer */}
      <div
        className={`fixed bottom-0 w-full top-92 md:right-0 md:top-93 md:w-fit max-h-[50vh] bg-green-800 shadow-xl transform transition-transform duration-300 ease-in-out z-10 overflow-y-auto ${showTOC ? "translate-y-0" : "translate-y-full"
          }`}
      >
        <div className="p-4 border-b border-green-400 flex justify-between items-center">
          <span className="text-green-100 font-semibold text-lg">Chapters</span>
          <button
            className="text-green-100 font-bold hover:text-green-300"
            onClick={() => setShowTOC(false)}
          >
            ✕
          </button>
        </div>
        <ul className="p-4 space-y-2 text-green-100">
          {toc.map((item, index) => (
            <li
              key={index}
              className={`cursor-pointer hover:text-green-300 transition-colors ${item.href === activeChapterHref
                ? 'bg-green-700 text-white font-semibold px-2 py-1 rounded border-l-4 border-green-400'
                : 'hover:bg-green-700 px-2 py-1 rounded'
                }`}
              onClick={() => {
                if (renditionRef.current) {
                  renditionRef.current.display(item.href);
                  setShowTOC(false);
                }
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Navigation Bar - hidden in fullscreen */}
      {!isFullscreen && (
        <div className="fixed bottom-0 w-full bg-black flex flex-col z-20">
          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-300 relative">
            <div
              className="h-full bg-green-600 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Navigation controls */}
          <div className="flex justify-between items-center py-2 px-4">
            {/* Page number section */}
            {!(currentPage === -1 || totalPages === -1) ? (
              <div className="text-green-500 font-semibold">
                {currentPage + "/" + totalPages}
              </div>
            ) : (
              <Spinner color="success" aria-label="Loading pages" />
            )}

            {/* Navigation buttons */}
            <div className="flex justify-center gap-4 w-full">
              <button
                className="px-4 py-2 text-white rounded cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => renditionRef.current?.prev()}
                title="Previous page (←)"
              >
                <FaArrowLeft />
              </button>
              <button
                className="px-4 py-2 text-white rounded cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => renditionRef.current?.next()}
                title="Next page (→)"
              >
                <FaArrowRight />
              </button>
            </div>

            {/* TOC button */}
            <button
              className="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer transition-colors"
              onClick={() => setShowTOC((prev) => !prev)}
              title="Table of Contents"
            >
              <FaListUl />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}