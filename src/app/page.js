'use client';

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import { FaBook, FaCloud, FaMobile, FaUsers } from 'react-icons/fa';
import Skeleton from "@/components/Skeleton";

export default function Home() {

  const { loading } = useAuth();

  if (loading)
    return <Skeleton page="landing" />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-100 to-gray-200 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Tether Read
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your personal e-reading library in the cloud. Upload, sync, and read your EPUB books from anywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200">
              Login
            </Link>
            <Link href="/signup" className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200">
              SIgn Up
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-16">
            Everything you need for seamless reading
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBook className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Upload EPUBs</h3>
              <p className="text-gray-600">
                Simply upload your EPUB files and start reading instantly with our clean, distraction-free reader.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCloud className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Cloud Sync</h3>
              <p className="text-gray-600">
                Your books and reading progress are automatically synced across all your devices.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMobile className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Read Anywhere</h3>
              <p className="text-gray-600">
                Access your library from any device with an internet connection. Desktop, tablet, or mobile.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Account</h3>
              <p className="text-gray-600">
                Create your account to keep your reading progress and library organized and secure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-100 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-16">
            Simple. Powerful. Accessible.
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-4">1</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Create Account</h3>
              <p className="text-gray-600">
                Sign up for your free Tether Read account in seconds.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-4">2</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Upload Books</h3>
              <p className="text-gray-600">
                Upload your EPUB files to build your personal cloud library.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-4">3</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Read Everywhere</h3>
              <p className="text-gray-600">
                Enjoy your books on any device with automatic progress sync.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to start reading?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join Tether Read today and take your library with you everywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200">
              Create Account
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Tether Read</h3>
          <p className="mb-8">Your books, everywhere you go.</p>
          <div className="border-t border-gray-700 pt-8">
            <p className="text-sm">
              © 2025 Tether Read. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}