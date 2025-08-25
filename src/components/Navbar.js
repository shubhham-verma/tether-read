'use client';
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

import toast from 'react-hot-toast';
import Skeleton from "./Skeleton";

export default function Navigation() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);


    const handleSignout = async () => {
        try {

            await logout();
            router.push('/');
            router.refresh();

        } catch (error) {
            console.log({ logout_error: error });
            toast.error("Cannot Logout !");
        }
    }

    if (loading)
        return (
            <Skeleton page='navbar' />
        );

    else
        return (
            <>


                <nav className="bg-white border-gray-200 dark:bg-gray-900">
                    <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                            <span> <img src="https://www.svgrepo.com/show/405748/green-book.svg" className="w-5 h-5" alt="logo" /> </span>
                            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Tether Read</span>
                        </a>
                        <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded={menuOpen} onClick={() => setMenuOpen((prev) => !prev)}
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                            </svg>
                        </button>
                        <div className={`${menuOpen ? "" : "hidden"} w-full md:block md:w-auto`} id="navbar-default">
                            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">

                                {user ?
                                    <>
                                        <li>
                                            <a href="/shelf" className={`block py-2 px-3 rounded-sm ${pathname === "/shelf" ? "text-green-700 dark:text-green-500 font-bold" : "text-gray-900 dark:text-white"}
                                             hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:dark:hover:text-green-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent`}> Shelf</a>
                                        </li>
                                        <li class="md:relative md:after:content-[''] md:after:absolute md:after:w-[1px] md:after:h-6 md:after:bg-gray-400 md:after:right-[-16px] md:after:top-1/2 md:after:-translate-y-1/2">
                                            <a href="/upload" className={`block py-2 px-3 rounded-sm ${pathname === "/upload" ? "text-green-700 dark:text-green-500 font-bold" : "text-gray-900 dark:text-white"}
                                             hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:dark:hover:text-green-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent`}> Upload</a>
                                        </li>
                                        {/* <li>
                                            <a href="/reader/123" className={`block py-2 px-3 rounded-sm ${pathname === "/" ? "text-green-700 dark:text-green-500 font-bold" : "text-gray-900 dark:text-white"}
                                             hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:dark:hover:text-green-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent`}> Read</a>
                                        </li> */}

                                        <li>
                                            <a href="#" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-green-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent" onClick={handleSignout}>Sign Out</a>
                                        </li>
                                    </>
                                    :
                                    <>
                                        <li>
                                            <a href="/login" className={`block py-2 px-3 rounded-sm ${pathname === "/login" ? "text-green-700 dark:text-green-500 font-bold" : "text-gray-900 dark:text-white"}
                                             hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:dark:hover:text-green-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent`}> Login</a>
                                        </li>
                                        <li>
                                            <a href="/signup" className={`block py-2 px-3 rounded-sm ${pathname === "/signup" ? "text-green-700 dark:text-green-500 font-bold" : "text-gray-900 dark:text-white"}
                                             hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:dark:hover:text-green-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent`}> Sign Up</a>
                                        </li>
                                    </>}



                            </ul>
                        </div>
                    </div>
                </nav>

            </>
        )


}

