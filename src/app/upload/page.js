'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";


import { FaUpload, FaBook, FaEdit, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import Skeleton from '@/components/Skeleton';
import toast from 'react-hot-toast';

export default function UploadPage() {

  const { user, loading } = useAuth();
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [metadata, setMetadata] = useState({
    title: '',
    author: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // File validation
  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!file.type.includes('epub') && !file.name.toLowerCase().endsWith('.epub')) {
      throw new Error('Please select a valid EPUB file');
    }

    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    return true;
  };

  // Parse EPUB metadata using JSZip (since EPUB is essentially a ZIP file)
  const parseEpubMetadata = async (file) => {
    try {

      const filename = file.name.replace('.epub', '');
      const parts = filename.split('-');

      // Simple heuristic: if filename contains " by ", split on that
      let title = filename;
      let author = 'Edit author here';

      if (filename.includes(' by ')) {
        const [titlePart, authorPart] = filename.split(' by ');
        title = titlePart.trim();
        author = authorPart.trim();
      } else if (parts.length >= 2) {
        author = parts[0].trim();
        title = parts.slice(1).join(' ').trim();
      }

      return {
        title: title || 'Edit title here',
        author: author || 'Edit author here'
      };
    } catch (error) {
      console.error('Error parsing EPUB:', error);
      return {
        title: 'Edit title here',
        author: 'Edit author here'
      };
    }
  };

  // Handle file selection
  const handleFileSelect = async (file) => {
    try {
      validateFile(file);
      setSelectedFile(file);
      setIsAnalyzing(true);

      // Extract metadata
      const extractedMetadata = await parseEpubMetadata(file);
      setMetadata(extractedMetadata);
      setShowForm(true);
      setIsAnalyzing(false);
    } catch (error) {
      toast.error(error.message);
      setSelectedFile(null);
      setIsAnalyzing(false);
    }
  };

  // Handle drag 
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("hendle submit clicked");

    if (!selectedFile || !metadata.title.trim() || !metadata.author.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('title', metadata.title.trim());
      formData.append('author', metadata.author.trim());
      formData.append('file', selectedFile);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Make API call to /api/upload
      const token = await user.getIdToken();
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        // Handle success
        setTimeout(() => {
          // Reset form
          setSelectedFile(null);
          setMetadata({ title: '', author: '' });
          setShowForm(false);
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
        toast.success("File uploaded succesfully!!")
      } else {
        toast.error("There was an error in uploadig the file.");
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Reset upload
  const resetUpload = () => {
    setSelectedFile(null);
    setMetadata({ title: '', author: '' });
    setShowForm(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!loading && !user)
      router.replace('/login');
  }, [user, loading, router]);

  if (loading)
    return <Skeleton page='upload' />;
  else if (!user)
    return null;
  else
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto p-6">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload New Book</h1>
            <p className="text-gray-600">
              Add EPUB files to your Tether Read library
            </p>
          </div>

          {!showForm ? (
            /* Upload Section */
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200 ${dragActive
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {isAnalyzing ? (
                  <div className="text-center">
                    <FaSpinner className="w-12 h-12 text-green-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Analyzing EPUB file...
                    </h3>
                    <p className="text-gray-600">
                      Extracting metadata from your book
                    </p>
                  </div>
                ) : (
                  <>
                    <FaUpload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Upload your EPUB file
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Drag and drop your file here, or click to browse
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center gap-2 hover:cursor-pointer"
                    >
                      <FaBook className="w-4 h-4" />
                      Choose EPUB File
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                      Maximum file size: 5MB
                    </p>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".epub"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          ) : (
            /* Metadata Form Section */
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Book Details</h2>
                <button
                  onClick={resetUpload}
                  className="text-gray-500 hover:text-gray-700 hover:cursor-pointer transition-colors duration-200"
                >
                  Upload Different File
                </button>
              </div>

              {/* File Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <FaBook className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-800">{selectedFile?.name}</p>
                    <p className="text-sm text-gray-600">
                      {(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Title Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Book Title *
                  </label>
                  <div className="relative">
                    <FaEdit className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={metadata.title}
                      onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                      placeholder="Enter book title"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-black"
                    />
                  </div>
                </div>

                {/* Author Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author *
                  </label>
                  <div className="relative">
                    <FaEdit className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={metadata.author}
                      onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                      placeholder="Enter author name"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-black"
                    />
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Uploading...</span>
                      <span className="text-sm text-gray-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 hover:cursor-pointer ${isUploading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                    onClick={handleSubmit}
                  >
                    {isUploading ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="w-4 h-4 cursor-pointer" onClick={handleSubmit} />
                        Add to Library
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetUpload}
                    disabled={isUploading}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Upload Guidelines</h3>
            <div className="grid md:grid-cols-2 gap-6 text-green-100">
              <div>
                <h4 className="font-medium text-white mb-2">Supported Format</h4>
                <p className="text-sm">Only EPUB files are currently supported</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">File Size Limit</h4>
                <p className="text-sm">Maximum file size is 5MB per upload</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Metadata Extraction</h4>
                <p className="text-sm">We automatically extract book title and author when possible</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Cloud Storage</h4>
                <p className="text-sm">Your books are securely stored and synced across devices</p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaBook className="w-5 h-5 text-green-600" />
              Pro Tips
            </h3>
            <div className="space-y-3 text-gray-600">
              <p className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                Name your EPUB files descriptively (e.g., "Book Title - Author Name.epub") for better metadata extraction
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                You can always edit the title and author after the automatic extraction
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                Your reading progress will be automatically saved as you read
              </p>
            </div>
          </div>
        </div>
      </div>
    );
}