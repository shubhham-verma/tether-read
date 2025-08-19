'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Skeleton from '@/components/Skeleton';
import Link from "next/link";


import {
    FaBook, FaSearch, FaFilter, FaSort,
    FaChevronLeft, FaChevronRight, FaPlus
} from 'react-icons/fa';
import { RiDeleteBin6Fill } from "react-icons/ri";
import toast from 'react-hot-toast'


function shelf() {

    const { user, loading } = useAuth();
    const router = useRouter();

    const [books, setBooks] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterBy, setFilterBy] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageInfo, setPageInfo] = useState({});
    const [width, setWidth] = useState(0);
    const maxVisiblePages = width < 768 ? 3 : 15;
    const [tempSearch, setTempSearch] = useState("");


    useEffect(() => {
        if (!loading && !user)
            router.replace('/login');
    }, [user, loading, router]);

    const fetchBooks = async () => {
        try {
            setPageLoading(true);

            if (!user) return;

            const token = await user.getIdToken();

            const params = new URLSearchParams({
                page: currentPage,
                sort: sortBy,
                order: sortOrder,
                search: searchTerm,
                status: filterBy
            })

            const res = await fetch(
                `/api/books?${params.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to fetch books");
            }

            const data = await res.json();

            // your API already returns { info, books, total }

            const normalizedBooks = data.books.map(book => {
                if (book.progress && book.progress.includes("/")) {
                    const [currentPage, totalPages] = book.progress.split("/").map(Number);
                    const percentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
                    return { ...book, progress: percentage };
                }
                return { ...book, progress: 0 }; // fallback if no progress
            });

            setBooks(normalizedBooks);
            setPageInfo(data.info);
        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setPageLoading(false);
        }
    };

    // Refetch book list on searching and filtering
    useEffect(() => {
        if (user) fetchBooks();
    }, [user, currentPage, sortBy, sortOrder, filterBy, searchTerm]);


    // Get the screen size of the device
    useEffect(() => {
        setWidth(window.innerWidth);
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const visiblePages = useMemo(() => {
        // If there are fewer total pages than the max we want to show, display all of them
        if (pageInfo.totalPages <= maxVisiblePages) {
            return Array.from({ length: pageInfo.totalPages }, (_, i) => i + 1);
        }

        // Determine the start and end of the "sliding window" of pages
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pageInfo.totalPages, startPage + maxVisiblePages - 1);

        // If the window is near the end, adjust the start page
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Add ellipses and first/last pages where needed
        const hasLeftEllipsis = startPage > 1;
        const hasRightEllipsis = endPage < pageInfo.totalPages;

        if (hasLeftEllipsis) {
            pages.unshift('...');
            pages.unshift(1);
        }

        if (hasRightEllipsis) {
            pages.push('...');
            pages.push(pageInfo.totalPages);
        }

        return pages;

    }, [currentPage, pageInfo.totalPages, maxVisiblePages]);

    const handleBookClick = (bookId, userId) => {
        console.log(`${bookId} clicked by ${userId}`);
    };

    const handleBookDelete = async (e, id) => {
        e.preventDefault();
        const confirmed = window.confirm("Are you sure you want to delete this book?");
        if (!confirmed) return;

        const previousBooks = [...books];
        setBooks((prev) => prev.filter((book) => book._id !== id));


        try {
            const token = await user.getIdToken();
            const res = await fetch("/api/books", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ bookId: id })
            });

            if (res.ok) {
                toast.success("Book deleted successfully");
            }
            else {
                setBooks(previousBooks);
                toast.error('An error occured while deleting the file.');
                console.error("Delete failed: ", await res.json());
            }

        } catch (error) {
            setBooks(previousBooks);
            console.error("error in deleting books: ", error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getProgressColor = (progress) => {
        if (progress === 0) return 'bg-gray-400';
        if (progress === 100) return 'bg-red-600';
        return 'bg-green-500';
    };

    if (loading || pageLoading)
        return <Skeleton page='shelf' />;
    else if (!user)
        return null;
    else {
        return (
            <>

                <div className="min-h-screen bg-gray-200">
                    <div className="max-w-7xl mx-auto p-6">
                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Shelf</h1>
                            <p className="text-gray-600">
                                {books.length} book{books.length !== 1 ? 's' : ''} in your collection
                            </p>
                        </div>

                        {/* Search, Sort, Filter Controls */}
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                            <div className="grid md:grid-cols-4 gap-4">
                                {/* Search */}
                                <form className="relative" action={undefined} onSubmit={(e) => {
                                    e.preventDefault();
                                    setSearchTerm(tempSearch);
                                    fetchBooks();
                                }} >
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" type="button" />
                                    <input
                                        type="text"
                                        placeholder="Search books..."
                                        value={tempSearch}
                                        onChange={(e) => setTempSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-600 "
                                    />
                                </form>

                                {/* Sort */}
                                <div className="relative">
                                    <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={`${sortBy}-${sortOrder}`}
                                        onChange={(e) => {
                                            const [field, order] = e.target.value.split('-');
                                            setSortBy(field);
                                            setSortOrder(order);
                                        }}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none text-gray-600"
                                    >
                                        <option value="createdAt-desc">Newest First</option>
                                        <option value="createdAt-asc">Oldest First</option>
                                        <option value="title-asc">Title A-Z</option>
                                        <option value="title-desc">Title Z-A</option>
                                        <option value="author-asc">Author A-Z</option>
                                        <option value="author-desc">Author Z-A</option>
                                    </select>
                                </div>

                                {/* Filter */}
                                <div className="relative">
                                    <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={filterBy}
                                        onChange={(e) => setFilterBy(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none text-gray-600 "
                                    >
                                        <option value="all">All Books</option>
                                        <option value="unread">Unread</option>
                                        <option value="reading">Currently Reading</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>

                                {/* Add Book Button */}
                                <Link href="/upload" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"

                                >
                                    <FaPlus className="w-4 h-4"
                                    // onClick={setPageLoading(true)}
                                    />
                                    Add Book
                                </Link>
                            </div>
                        </div>

                        {/* Books Grid */}
                        {books.length === 0 ? (
                            <div className="text-center py-16">
                                <FaBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                    {searchTerm || filterBy !== 'all' ? 'No books found' : 'No books in your library'}
                                </h3>
                                <p className="text-gray-500">
                                    {searchTerm || filterBy !== 'all'
                                        ? 'Try adjusting your search or filter criteria.'
                                        : 'Upload your first EPUB to get started reading!'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                {books.map((book, index) => (

                                    <div key={index} className="relative group border rounded-lg shadow hover:shadow-md">
                                        {/* Delete button */}
                                        <RiDeleteBin6Fill className=" text-gray-700 absolute top-2 right-2 text-2xl md:text-lg md:opacity-0 md:group-hover:opacity-100 md:transition" onClick={(e) => handleBookDelete(e, book._id)} />

                                        {/* Book tile */}
                                        <div
                                            key={book._id}
                                            onClick={() => handleBookClick(book._id, book.userId)}
                                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 cursor-pointer border border-gray-200 hover:border-green-300"
                                        >
                                            {/* Book Icon */}
                                            <div className="bg-green-100 w-16 h-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                                <FaBook className="w-8 h-8 text-green-600" />
                                            </div>

                                            {/* Book Info */}
                                            <div className="text-center">
                                                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">
                                                    {book.title}
                                                </h3>
                                                <p className="text-gray-600 mb-3 text-sm">
                                                    by {book.author}
                                                </p>

                                                {/* Progress Bar */}
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                        <span>Progress</span>
                                                        <span>{book.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(book.progress)}`}
                                                            style={{ width: `${book.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Date Added */}
                                                <p className="text-xs text-gray-500">
                                                    Added {formatDate(book.createdAt)}
                                                </p>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="mt-4 flex justify-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${book.progress === 0 ? 'bg-gray-100 text-gray-600' :
                                                    book.progress === 100 ? 'bg-green-100 text-green-600' :
                                                        'bg-green-50 text-green-700'
                                                    }`}>
                                                    {book.progress === 0 ? 'Unread' :
                                                        book.progress === 100 ? 'Completed' :
                                                            'Reading'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                ))}
                            </div>


                        )}

                        {/* Pagination */}
                        {pageInfo.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={!pageInfo.hasPrev}
                                    className={`flex items-center gap-2 px-1 md:px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:cursor-pointer ${pageInfo.hasPrev
                                        ? 'md:bg-green-600 md:hover:bg-green-700 md:text-white'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        } `}
                                >
                                    <FaChevronLeft className="w-4 h-4 text-black md:text-white" />

                                </button>

                                <div className={`flex items-center gap-2 `}>
                                    {/* Updated map function to render the calculated visible pages */}
                                    {visiblePages.map((page, index) =>
                                        typeof page === 'number' ? (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-colors duration-200 hover:cursor-pointer ${page === currentPage
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ) : (
                                            // Render a non-clickable span for ellipses
                                            <span key={`ellipsis-${index}`} className="w-1 md:w-10 h-10 flex items-center justify-center text-gray-500">
                                                {page}
                                            </span>
                                        )
                                    )}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageInfo.totalPages))}
                                    disabled={!pageInfo.hasNext}
                                    className={`flex items-center gap-2 px-1 md:px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:cursor-pointer ${pageInfo.hasNext
                                        ? 'md:bg-green-600 md:hover:bg-green-700 md:text-white'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >

                                    <FaChevronRight className="w-4 h-4 text-black md:text-white " />
                                </button>
                            </div>
                        )}

                        {/* Statistics Bar */}
                        <div className="mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
                            <h3 className="text-xl font-semibold mb-4">Reading Statistics</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold">{books.length}</div>
                                    <div className="text-green-100 text-sm">Total Books</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">
                                        {books.filter(book => book.progress > 0 && book.progress < 100).length}
                                    </div>
                                    <div className="text-green-100 text-sm">Currently Reading</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">
                                        {books.filter(book => book.progress === 100).length}
                                    </div>
                                    <div className="text-green-100 text-sm">Completed</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">
                                        {Math.round(books.reduce((acc, book) => acc + book.progress, 0) / books.length) || 0}%
                                    </div>
                                    <div className="text-green-100 text-sm">Avg Progress</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </>
        );
    };


}

export default shelf