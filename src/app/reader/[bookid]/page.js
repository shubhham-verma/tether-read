'use client';

import ePub from "epubjs";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Skeleton from "@/components/Skeleton";
import { FaArrowRight, FaArrowLeft, FaListUl } from "react-icons/fa6";
import { Spinner } from "flowbite-react";

export default function ReaderPage() {

  const { bookid } = useParams();

  const { user, loading } = useAuth();
  const router = useRouter();
  const [toc, setToc] = useState([]);
  const [showTOC, setShowTOC] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(-1);
  const [totalPages, setTotalPages] = useState(-1);
  const [activeChapterHref, setActiveChapterHref] = useState(null);
  const [signedUrl, setSignedUrl] = useState("");


  const viewerRef = useRef(null);
  const renditionRef = useRef(null);
  const bookRef = useRef(null);
  const tocRef = useRef([]);


  const flattenTOC = (items, depth = 0) => {
    return items.flatMap((item) => [
      { label: `${"— ".repeat(depth)}${item.label}`, href: item.href },
      ...(item.subitems ? flattenTOC(item.subitems, depth + 1) : []),
    ]);
  };

  useEffect(() => {
    if (!bookid || !user) return;

    const fetchBook = async () => {
      const token = await user.getIdToken();

      try {
        const result = await fetch(`/api/readBook/${bookid}/url`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });

        const data = await result.json();
        setSignedUrl(data.url);
        // console.log("Fetched URL:", data.url);  
      } catch (error) {
        console.error("Failed to generate url", error);
      }
    };

    fetchBook();
  }, [bookid, user]);


  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }

    if (viewerRef.current && signedUrl) {
      const book = ePub(signedUrl);
      const rendition = book.renderTo(viewerRef.current, {
        width: "100%",
        height: "100%",
        spread: "both",
      });

      renditionRef.current = rendition;
      bookRef.current = book;

      const handleKeyDown = (e) => {
        if (!renditionRef.current) return;
        if (e.key === "ArrowRight") renditionRef.current.next();
        if (e.key === "ArrowLeft") renditionRef.current.prev();
      };

      // Setup locations + ToC
      book.ready.then(() => {
        return book.locations.generate(5000).then(() => {
          setTotalPages(book.locations.length());

          const savedCfi = localStorage.getItem("lastReadCfi");
          if (savedCfi) {
            rendition.display(savedCfi);
          } else {
            rendition.display();
          }
        });
      });

      book.loaded.navigation.then((nav) => {
        const flat = flattenTOC(nav.toc);
        tocRef.current = flat;
        setToc(flat);
      });

      rendition.on("relocated", (location) => {
        const percentage = book.locations.percentageFromCfi(location.start.cfi);
        setProgress(Number((percentage * 100).toFixed(2)));
        setCurrentPage(book.locations.locationFromCfi(location.start.cfi));

        localStorage.setItem("lastReadCfi", location.start.cfi);

        const currentHref = location.start.href;
        const activeChapter = tocRef.current.find((item) =>
          currentHref.includes(item.href)
        );
        if (activeChapter) {
          setActiveChapterHref(activeChapter.href);
        }
      });

      rendition.on("rendered", () => {
        rendition.getContents().forEach((content) => {
          content.document.addEventListener("keydown", handleKeyDown);
        });
      });

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        rendition.destroy();
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [signedUrl, user, loading, router]);




  if (loading)
    return <Skeleton page='shelf' />;
  if (!user)
    return null;

  return (


    <div className="bg-yellow-100">
      <>
        {/* main reader component */}
        {/* <div className="w-full lg:w-13/14 lg:mx-auto h-[85vh] bg-yellow-100" ref={viewerRef}></div> */}
        <div ref={viewerRef} className="w-full h-[85vh] bg-yellow-100"></div>

        {/* opacity overlay */}
        <div
          className={`fixed inset-0 bg-black z-10 transition-opacity duration-500 ${showTOC ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          onClick={() => setShowTOC(false)}
        ></div>

        {/* TOC Drawer */}
        <div
          className={`fixed bottom-0 w-full top-92 md:right-0 md:top-93 md:w-fit max-h-[50vh] bg-green-800 shadow-xl transform transition-transform duration-300 ease-in-out z-10 overflow-y-auto ${showTOC ? "translate-y-0" : "translate-y-full"
            }`}
        >
          <div className="p-4 border-b border-green-400 flex justify-between items-center">
            <span className="text-green-100 font-semibold text-lg">Chapters</span>
            <button
              className="text-green-100 font-bold"
              onClick={() => setShowTOC(false)}
            >
              ✕
            </button>
          </div>
          <ul className="p-4 space-y-2 text-green-100">
            {toc.map((item, index) => (
              <li
                key={index}
                className={`cursor-pointer hover:text-green-400 ${item.href === activeChapterHref && 'underline text-black'}`}
                onClick={() => {
                  renditionRef.current.display(item.href);
                  setShowTOC(false);
                }}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 w-full bg-black flex flex-col z-20">
          {/* Progress bar */}
          <div
            className="w-full h-2 bg-gray-300 relative "
          >
            <div
              className="h-full bg-green-600 transition-all duration-200"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Top row: page number, prev/next, toc button */}
          <div className="flex justify-between items-center py-2 px-4">

            {/* page number section */}
            {!(currentPage === -1 || totalPages === -1) &&
              <div className="text-green-500 font-semibold">
                {currentPage + "/" + totalPages}
              </div>}

            {(currentPage === -1 || totalPages === -1) &&
              // <div role="status" className="max-w-sm animate-pulse">
              //   <div className="h-2.5 bg-gray-200 rounded-full dark:bg-green-600 w-14 my-4"></div>
              // </div>
              <Spinner color="success" aria-label="Success spinner example" />
            }

            {/* navigation buttons */}
            <div className="flex justify-center gap-4 w-full">
              <button
                className="px-4 py-2 text-white rounded cursor-pointer"
                onClick={() => {
                  if (renditionRef.current) {
                    renditionRef.current.prev();
                  }
                }}
              >
                <FaArrowLeft />
              </button>
              <button
                className="px-4 py-2 text-white rounded cursor-pointer"
                onClick={() => {
                  if (renditionRef.current) {
                    renditionRef.current.next();
                  }
                }}
              >
                <FaArrowRight />
              </button>
            </div>

            {/* TOC button */}
            <button
              className="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
              onClick={() => setShowTOC((prev) => !prev)}
            >
              <FaListUl />
            </button>
          </div>


        </div>

      </>
    </div>


  );
}
