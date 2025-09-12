import React, { useState } from 'react';
import { FaExternalLinkAlt, FaTimes, FaLightbulb } from 'react-icons/fa';

// Mock data for demonstration
// const mockRecommendations = {
//     "recommendations": [
//         {
//             "title": "The Shining",
//             "author": "Stephen King",
//             "goodreads_link": "https://www.goodreads.com/book/show/31809267-the-shining"
//         },
//         {
//             "title": "Malgudi Days",
//             "author": "R.K. Narayan",
//             "goodreads_link": "https://www.goodreads.com/book/show/65118.Malgudi_Days"
//         },
//         {
//             "title": "The Fall of the House of Usher",
//             "author": "Edgar Allan Poe",
//             "goodreads_link": "https://www.goodreads.com/book/show/2573.The_Fall_of_the_House_of_Usher"
//         },
//         {
//             "title": "A Darker Shade of Magic",
//             "author": "V.E. Schwab",
//             "goodreads_link": "https://www.goodreads.com/book/show/17937241-a-darker-shade-of-magic"
//         },
//         {
//             "title": "The Vegetarian",
//             "author": "Han Kang",
//             "goodreads_link": "https://www.goodreads.com/book/show/12988330-the-vegetarian"
//         }
//     ]
// };

const RecommendationsModal = ({ isOpen, onClose, recommendations }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleGoodreadsClick = (link) => {
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                            <FaLightbulb className="text-green-600 w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">AI Recommendations</h2>
                            <p className="text-sm text-gray-600">Books curated just for you</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                        aria-label="Close modal"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                    <div className="space-y-4">
                        {recommendations.map((book, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
                                onClick={() =>
                                    window.open(
                                        `https://www.google.com/search?q=${encodeURIComponent(book.title + " " + book.author)}`,
                                        "_blank" 
                                    )
                                }
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 truncate">
                                        {book.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 truncate">
                                        by {book.author}
                                    </p>
                                </div>


                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-xs text-gray-500 text-center">
                        Recommendations are based on your current library and reading preferences
                    </p>
                </div>
            </div>
        </div>
    );
};

// Demo component to show the modal in action
const Demo = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [books] = useState([
        { title: "Book 1" },
        { title: "Book 2" },
        { title: "Book 3" }
    ]);

    const handleAiRecommends = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    return (
        <div className="p-8 bg-yellow-100 min-h-screen">
            {/* Header with Discover More button */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">My Shelf</h1>
                    <p className="text-gray-600">
                        {books.length} book{books.length !== 1 ? 's' : ''} in your collection
                    </p>
                </div>

                <div className="ml-8">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center gap-2 border border-green-500"
                        onClick={handleAiRecommends}
                    >
                        <FaLightbulb className="w-5 h-5" />
                        Discover More
                    </button>
                </div>
            </div>

            {/* Mock shelf content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {books.map((book, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="h-32 bg-gray-200 rounded mb-4"></div>
                        <h3 className="font-semibold text-gray-800">{book.title}</h3>
                        <p className="text-gray-600 text-sm">Sample Author</p>
                    </div>
                ))}
            </div>

            {/* Recommendations Modal */}
            <RecommendationsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default RecommendationsModal;