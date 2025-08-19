

function Skeleton({ page }) {

    switch (page) {
        case 'navbar':
            return (<>
                <div role="status" className=" animate-pulse px-8 ">
                    <div className="flex justify-between w-full py-4">
                        <div className="h-2.5 w-1/3 bg-green-200 dark:bg-green-700 rounded-full"></div>
                        <div className="h-2.5 w-1/4 bg-green-200 dark:bg-green-700 rounded-full"></div>
                    </div>

                    <div className="flex justify-between w-full">
                        <div className="h-2.5 w-1/4 bg-green-200 dark:bg-green-700 rounded-full"></div>
                        <div className="h-2.5 w-1/3 bg-green-200 dark:bg-green-700 rounded-full"></div>
                    </div>
                </div>
            </>);
            break;



        case 'shelf':
            return (<>
                <div role="status" className=" w-2xs h-[500px] md:w-2xl mx-auto my-30 max-w-md p-4 space-y-4 border border-green-200 divide-y divide-green-200 rounded-sm shadow-sm animate-pulse dark:divide-green-700 md:p-6 dark:border-green-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="h-2.5 bg-green-300 rounded-full dark:bg-green-600 w-24 mb-2.5"></div>
                            <div className="w-32 h-2 bg-green-200 rounded-full dark:bg-green-700"></div>
                        </div>
                        <div className="h-2.5 bg-green-300 rounded-full dark:bg-green-700 w-12"></div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                        <div>
                            <div className="h-2.5 bg-green-300 rounded-full dark:bg-green-600 w-24 mb-2.5"></div>
                            <div className="w-32 h-2 bg-green-200 rounded-full dark:bg-green-700"></div>
                        </div>
                        <div className="h-2.5 bg-green-300 rounded-full dark:bg-green-700 w-12"></div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                        <div>
                            <div className="h-2.5 bg-green-300 rounded-full dark:bg-green-600 w-24 mb-2.5"></div>
                            <div className="w-32 h-2 bg-green-200 rounded-full dark:bg-green-700"></div>
                        </div>
                        <div className="h-2.5 bg-green-300 rounded-full dark:bg-green-700 w-12"></div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                        <div>
                            <div className="h-2.5 bg-green-300 rounded-full dark:bg-green-600 w-24 mb-2.5"></div>
                            <div className="w-32 h-2 bg-green-200 rounded-full dark:bg-green-700"></div>
                        </div>
                        <div className="h-2.5 bg-green-300 rounded-full dark:bg-green-700 w-12"></div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                        <div>
                            <div className="h-2.5 bg-green-300 rounded-full dark:bg-green-600 w-24 mb-2.5"></div>
                            <div className="w-32 h-2 bg-green-200 rounded-full dark:bg-green-700"></div>
                        </div>
                        <div className="h-2.5 bg-green-300 rounded-full dark:bg-green-700 w-12"></div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                        <div>
                            <div className="h-2.5 bg-green-300 rounded-full dark:bg-green-600 w-24 mb-2.5"></div>
                            <div className="w-32 h-2 bg-green-200 rounded-full dark:bg-green-700"></div>
                        </div>
                        <div className="h-2.5 bg-green-300 rounded-full dark:bg-green-700 w-12"></div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                        <div>
                            <div className="h-2.5 bg-green-300 rounded-full dark:bg-green-600 w-24 mb-2.5"></div>
                            <div className="w-32 h-2 bg-green-200 rounded-full dark:bg-green-700"></div>
                        </div>
                        <div className="h-2.5 bg-green-300 rounded-full dark:bg-green-700 w-12"></div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                        <div>
                            <div className="h-2.5 bg-green-300 rounded-full dark:bg-green-600 w-24 mb-2.5"></div>
                            <div className="w-32 h-2 bg-green-200 rounded-full dark:bg-green-700"></div>
                        </div>
                        <div className="h-2.5 bg-green-300 rounded-full dark:bg-green-700 w-12"></div>
                    </div>
                    <span className="sr-only">Loading...</span>
                </div>

            </>);
            break;

        case 'upload':
            return (
                <>
                    <div className="min-h-screen bg-black py-8">
                        <div className="max-w-4xl mx-auto p-6">
                            {/* Page Header Skeleton */}
                            <div className="text-center mb-12">
                                <div className="h-8 bg-gray-600 rounded w-64 mx-auto mb-2 animate-pulse"></div>
                                <div className="h-4 bg-gray-600 rounded w-80 mx-auto animate-pulse"></div>
                            </div>

                            {/* Main Upload Section Skeleton */}
                            <div className="bg-gray-700 rounded-lg p-8 mb-8">
                                <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
                                    {/* Upload Icon Skeleton */}
                                    <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-6 animate-pulse"></div>

                                    {/* Upload Text Skeleton */}
                                    <div className="h-6 bg-gray-600 rounded w-48 mx-auto mb-2 animate-pulse"></div>
                                    <div className="h-4 bg-gray-600 rounded w-72 mx-auto mb-6 animate-pulse"></div>

                                    {/* Upload Button Skeleton */}
                                    <div className="h-12 w-40 bg-green-800 rounded-lg mx-auto mb-4 animate-pulse"></div>
                                    <div className="h-3 bg-gray-600 rounded w-36 mx-auto animate-pulse"></div>
                                </div>
                            </div>

                            {/* Info Section Skeleton */}
                            <div className="bg-green-800 rounded-lg p-6 mb-8">
                                <div className="h-6 bg-green-700 rounded w-48 mb-4 animate-pulse"></div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {[1, 2, 3, 4].map((item) => (
                                        <div key={item}>
                                            <div className="h-4 bg-green-700 rounded w-32 mb-2 animate-pulse"></div>
                                            <div className="h-3 bg-green-700 rounded w-full animate-pulse"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tips Section Skeleton */}
                            <div className="bg-gray-700 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-5 h-5 bg-green-800 rounded animate-pulse"></div>
                                    <div className="h-5 bg-gray-600 rounded w-24 animate-pulse"></div>
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="flex gap-2">
                                            <div className="w-2 h-2 bg-green-800 rounded-full mt-2 animate-pulse"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-600 rounded mb-1 animate-pulse"></div>
                                                <div className="h-4 bg-gray-600 rounded w-3/4 animate-pulse"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )

        case 'read':
            return (<>
            </>);
            break;



        case 'login':
        case 'signup':
            return (<>
                <div role="status" className=" w-2xs h-[500px] md:w-2xl mx-auto my-30 p-4 border border-green-200 rounded-sm shadow-sm animate-pulse md:p-6 dark:border-green-700">
                    <div className="flex items-center justify-center h-48 mb-4 bg-green-300 rounded-sm dark:bg-green-700">
                        <svg className="w-10 h-10 text-green-200 dark:text-green-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                            <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z" />
                            <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
                        </svg>
                    </div>
                    <div className="h-2.5 bg-green-200 rounded-full dark:bg-green-700 w-48 mb-4"></div>
                    <div className="h-2 bg-green-200 rounded-full dark:bg-green-700 mb-2.5"></div>
                    <div className="h-2 bg-green-200 rounded-full dark:bg-green-700 mb-2.5"></div>
                    <div className="h-2 bg-green-200 rounded-full dark:bg-green-700"></div>
                    <div className="flex items-center mt-4">
                        <svg className="w-10 h-10 me-3 text-green-200 dark:text-green-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                        </svg>
                        <div>
                            <div className="h-2.5 bg-green-200 rounded-full dark:bg-green-700 w-32 mb-2"></div>
                            <div className="w-48 h-2 bg-green-200 rounded-full dark:bg-green-700"></div>
                        </div>
                    </div>
                    <br />
                    <div className="h-2 bg-green-200 rounded-full dark:bg-green-700 mb-2.5"></div>
                    <div className="h-2 bg-green-200 rounded-full dark:bg-green-700 mb-2.5"></div>
                    <span className="sr-only">Loading...</span>
                </div>
            </>);
            break;

        case 'landing':
            return (<>
                {/* Hero Section Skeleton */}
                <section className="animate-pulse py-20 px-4">
                    <div className="max-w-6xl mx-auto text-center">
                        {/* Title Skeleton */}
                        <div className="h-16 bg-green-700 rounded-lg mb-6 max-w-md mx-auto"></div>

                        {/* Subtitle Skeleton */}
                        <div className="space-y-3 mb-8 max-w-3xl mx-auto">
                            <div className="h-6 bg-green-700 rounded mx-auto"></div>
                            <div className="h-6 bg-green-700 rounded mx-auto w-3/4"></div>
                        </div>

                        {/* Buttons Skeleton */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <div className="h-14 w-40 bg-green-900 rounded-lg"></div>
                            <div className="h-14 w-32 bg-green-700 rounded-lg"></div>
                        </div>
                    </div>
                </section>

                {/* Features Section Skeleton */}
                <section className=" animate-pulse  px-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Section Title Skeleton */}
                        <div className="h-10 rounded-lg mb-16 max-w-2xl mx-auto"></div>

                        {/* Feature Cards Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="text-center p-6">
                                    {/* Icon Skeleton */}
                                    <div className="bg-green-900 w-16 h-16 rounded-full mx-auto mb-4"></div>

                                    {/* Feature Title Skeleton */}
                                    <div className="h-6 bg-green-700 rounded mb-3 w-3/4 mx-auto"></div>

                                    {/* Feature Description Skeleton */}
                                    <div className="space-y-2">
                                        <div className="h-4 bg-green-700 rounded"></div>
                                        <div className="h-4 bg-green-700 rounded w-5/6 mx-auto"></div>
                                        <div className="h-4 bg-green-700 rounded w-4/5 mx-auto"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </>);
            break;
        default:
            return null;
            break;
    }
}

export default Skeleton