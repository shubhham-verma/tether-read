'use client';

import ePub from "epubjs";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import Skeleton from "@/components/Skeleton";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa6";

function ReaderPage({ params }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const viewerRef = useRef(null);       // ✅ for the DOM element
  const renditionRef = useRef(null);    // ✅ for the ePub rendition object

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    } else if (viewerRef.current) {
      const book = ePub("/sample.epub");
      const rendition = book.renderTo(viewerRef.current, {
        width: "100%",
        height: "100%",
      });

      rendition.display();
      renditionRef.current = rendition;

      return () => {
        rendition.destroy();
      };
    }
  }, [user, loading, router]);

  if (loading)
    return <Skeleton page='shelf' />;
  if (!user)
    return null;

  return (
    <>
      <div className="w-full h-[85vh] bg-yellow-100" ref={viewerRef}></div>

      <div className="flex justify-center gap-4 mt-3 md:mt-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            if (renditionRef.current) {
              renditionRef.current.prev();
            }
          }}
        >
          <FaArrowLeft />
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            if (renditionRef.current) {
              renditionRef.current.next();
            }
          }}
        >
          <FaArrowRight />
        </button>
      </div>
    </>
  );
}

export default ReaderPage;
