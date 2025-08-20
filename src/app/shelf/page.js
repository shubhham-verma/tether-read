'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    FaBook, FaSearch, FaFilter, FaSort,
    FaChevronLeft, FaChevronRight, FaPlus, FaEdit, FaCheck, FaTimes
} from 'react-icons/fa';
import { RiDeleteBin6Fill } from "react-icons/ri";
import toast from 'react-hot-toast';
import Skeleton from '@/components/Skeleton';

function Shelf() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Page variables
    const [books, setBooks] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [width, setWidth] = useState(0);
    const maxVisiblePages = width < 768 ? 3 : 15;

    // FIltering variables
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterBy, setFilterBy] = useState('all');
    const [tempSearch, setTempSearch] = useState("");

    // Pagination variables
    const [currentPage, setCurrentPage] = useState(1);
    const [pageInfo, setPageInfo] = useState({});

    // Editing variables
    const [editingBookId, setEditingBookId] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        author: '',
        file: null
    });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!loading && !user)
            router.replace('/login');
    }, [user, loading, router]);

    useEffect(() => {
        if (user) fetchBooks();
    }, [user, currentPage, sortBy, sortOrder, filterBy, searchTerm]);

    useEffect(() => {
        setWidth(window.innerWidth);
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const visiblePages = useMemo(() => {
        if (pageInfo.totalPages <= maxVisiblePages) {
            return Array.from({ length: pageInfo.totalPages }, (_, i) => i + 1);
        }

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pageInfo.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

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
        // Only navigate if not editing
        if (editingBookId !== bookId) {
            console.log(`${bookId} clicked by ${userId}`);
        }
    };

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
            });

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

            const normalizedBooks = data.books.map(book => {
                if (book.progress && book.progress.includes("/")) {
                    const [currentPage, totalPages] = book.progress.split("/").map(Number);
                    const percentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
                    return { ...book, progress: percentage };
                }
                return { ...book, progress: 0 };
            });

            setBooks(normalizedBooks);
            setPageInfo(data.info);
        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setPageLoading(false);
        }
    };

    const handleEditClick = (e, book) => {
        e.stopPropagation();
        setEditingBookId(book._id);
        setEditForm({
            title: book.title,
            author: book.author,
            file: null
        });
    };

    const handleCancelEdit = (e) => {
        e.stopPropagation();
        setEditingBookId(null);
        setEditForm({
            title: '',
            author: '',
            file: null
        });
    };

    const handleUpdateBook = async (e) => {
        e.stopPropagation();

        if (!editForm.title.trim() || !editForm.author.trim()) {
            toast.error('Title and author are required');
            return;
        }

        setIsUpdating(true);

        try {
            const token = await user.getIdToken();
            const formData = {
                bookId: editingBookId,
                title: editForm.title.trim(),
                author: editForm.author.trim()
            };

            const res = await fetch('/api/books', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const updatedBook = await res.json();

                // Update the book in the local state
                setBooks(prevBooks =>
                    prevBooks.map(book =>
                        book._id === editingBookId
                            ? { ...book, title: editForm.title, author: editForm.author }
                            : book
                    )
                );

                toast.success('Book updated successfully');
                setEditingBookId(null);
                setEditForm({ title: '', author: '', file: null });
            } else {
                const errorData = await res.json();
                console.error(errorData.message);
                toast.error('Failed to update book');
            }
        } catch (error) {
            console.error('Error updating book:', error);
            toast.error('An error occurred while updating the book');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleBookDelete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();

        const confirmed = await confirmDeletion();
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
            } else {
                setBooks(previousBooks);
                toast.error('An error occurred while deleting the file.');
                console.error("Delete failed: ", await res.json());
            }
        } catch (error) {
            setBooks(previousBooks);
            console.error("error in deleting books: ", error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchTerm(tempSearch);
    }

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

    const confirmDeletion = () => {
        return new Promise((resolve) => {
            toast.custom((t) => (
                <div className="bg-white shadow-md p-4 rounded-2xl flex flex-col gap-2">
                    <span className="text-gray-700">Are you sure you want to delete this book?</span>
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1 bg-red-500 text-white rounded-2xl cursor-pointer"
                            onClick={() => {
                                toast.dismiss(t.id);
                                resolve(true);
                            }}
                        >
                            Yes
                        </button>
                        <button
                            className="px-3 py-1 bg-gray-300 rounded-2xl text-gray-700 cursor-pointer"
                            onClick={() => {
                                toast.dismiss(t.id);
                                resolve(false);
                            }}
                        >
                            No
                        </button>
                    </div>
                </div>
            ));
        });
    };


    if (loading || pageLoading)
        return <Skeleton page='shelf' />;
    else if (!user)
        return null;
    else {
        return (
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
                            <div className="relative">
                                <form onSubmit={handleSearch}>
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search books..."
                                        value={tempSearch}
                                        onChange={(e) => setTempSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-600"
                                    />
                                </form>
                            </div>

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
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none text-gray-600"
                                >
                                    <option value="all">All Books</option>
                                    <option value="unread">Unread</option>
                                    <option value="reading">Currently Reading</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            {/* Add Book Button */}
                            <Link href="/upload" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2">
                                <FaPlus className="w-4 h-4" />
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
                                    {/* Action buttons */}
                                    {editingBookId !== book._id && (
                                        <>
                                            <RiDeleteBin6Fill
                                                className="text-red-600 absolute top-2 right-2 text-2xl md:text-lg md:opacity-0 md:group-hover:opacity-100 md:transition cursor-pointer z-10"
                                                onClick={(e) => handleBookDelete(e, book._id)}
                                            />
                                            <FaEdit
                                                className="text-blue-600 absolute top-2 right-10 text-xl md:text-lg md:opacity-0 md:group-hover:opacity-100 md:transition cursor-pointer z-10"
                                                onClick={(e) => handleEditClick(e, book)}
                                            />
                                        </>
                                    )}

                                    {/* Book Card or Edit Form */}
                                    <div
                                        onClick={() => handleBookClick(book._id, book.userId)}
                                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 cursor-pointer border border-gray-200 hover:border-green-300"
                                    >
                                        {editingBookId === book._id ? (
                                            /* Edit Form */
                                            <div onClick={(e) => e.stopPropagation()}>
                                                {/* Book Icon */}
                                                <div className="bg-green-100 w-16 h-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                                    <FaBook className="w-8 h-8 text-green-600" />
                                                </div>

                                                {/* Edit Form */}
                                                <div className="text-center space-y-3">
                                                    {/* Title Input */}
                                                    <input
                                                        type="text"
                                                        value={editForm.title}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                        className="w-full text-center font-semibold text-gray-800 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none min-h-[3rem] flex items-center"
                                                        placeholder="Book title"
                                                    />

                                                    {/* Author Input */}
                                                    <input
                                                        type="text"
                                                        value={editForm.author}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, author: e.target.value }))}
                                                        className="w-full text-center text-gray-600 text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                                        placeholder="Author name"
                                                    />

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

                                                    {/* Date Added  */}
                                                    <p className="text-xs text-gray-500">
                                                        Added {formatDate(book.createdAt)}
                                                    </p>

                                                    {/* Save/Cancel Buttons */}
                                                    <div className="flex gap-2 mt-4">
                                                        <button
                                                            onClick={handleUpdateBook}
                                                            disabled={isUpdating}
                                                            className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1 ${isUpdating
                                                                ? 'bg-gray-400 cursor-not-allowed'
                                                                : 'bg-green-600 hover:bg-green-700'
                                                                } text-white`}
                                                        >
                                                            <FaCheck className="w-3 h-3" />
                                                            {isUpdating ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            disabled={isUpdating}
                                                            className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1 disabled:opacity-50"
                                                        >
                                                            <FaTimes className="w-3 h-3" />
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Normal Book Card */
                                            <>
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
                                            </>
                                        )}
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
                                    }`}
                            >
                                <FaChevronLeft className="w-4 h-4 text-black md:text-white" />
                            </button>

                            <div className="flex items-center gap-2">
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
                                <FaChevronRight className="w-4 h-4 text-black md:text-white" />
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
        );
    }
}

export default Shelf;