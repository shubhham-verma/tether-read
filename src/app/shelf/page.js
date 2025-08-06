'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Skeleton from '@/components/Skeleton';

function shelf() {

    const { user, loading } = useAuth();
    const router = useRouter();

    const fakeBooks = [
        { title: "The Great Gatsby", author: "F. Scott Fitzgerald", id: "1" },
        { title: "Sapiens", author: "Yuval Noah Harari", id: "2" },
    ];

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
                <div className="p-4">
                    <h1 className="text-2xl font-bold">Your Shelf</h1>
                    <p className="text-gray-600 mt-2">All your uploaded books will appear here.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 m-4">
                    {fakeBooks.map((book) => (
                        <div key={book.id} className="border p-4 rounded shadow hover:shadow-lg">
                            <h2 className="font-semibold text-lg">{book.title}</h2>
                            <p className="text-sm text-gray-500">{book.author}</p>
                        </div>
                    ))}
                </div>
            </>
        );
    };


}

export default shelf