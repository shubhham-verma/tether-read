'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import { Button, FileInput, Label } from 'flowbite-react';
import Skeleton from '@/components/Skeleton';


function UploadPage() {

  const { user, loading } = useAuth();
  const router = useRouter();

  const [dummyBook, setDummyBook] = useState({
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: "https://covers.openlibrary.org/b/id/7222246-L.jpg"
  });



  useEffect(() => {
    if (!loading && !user)
      router.replace('/login');
  }, [user, loading, router]);

  if (loading)
    return <Skeleton page='shelf' />;
  else if (!user)
    return null;
  else {
    return (
      <>
        <div className="min-h-screen bg-green-900 text-white  flex flex-col pt-10 items-center align-middle">
          <h1 className="text-3xl font-bold mb-6 ">Upload EPUB</h1>

          <form className="space-y-6  md:w-2/5">
            <div>
              <Label htmlFor="file" value="Select EPUB file" />
              <FileInput id="file" disabled />
            </div>

            <div className="border border-red-700 p-4 rounded-lg md:flex md:justify-evenly">
              <div>
                <p className="text-lg font-semibold">Preview</p>
                <img src={dummyBook.cover} alt="Book cover" className="w-32 h-auto mt-2 rounded" />
              </div>
              <div className="md:flex md:flex-col md:justify-end">
                <p className="mt-2"> <span className="font-medium">Title:</span> {dummyBook.title}</p>
                  <p className="my-3 "> <span className="font-medium ">Author:</span> {dummyBook.author}</p>
              </div>
            </div>

            <Button type="submit" disabled>Upload</Button>
          </form>
        </div>
      </>
    );
  }
}

export default UploadPage