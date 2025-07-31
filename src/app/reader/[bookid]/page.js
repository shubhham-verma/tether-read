import React from 'react'
import Navbar from '@/components/Navbar-home'

function ReaderPage({ params }) {
  return (
    <>
      <Navbar />
      <div>ReaderPage: {params.bookid}</div>
    </>
  )
}

export default ReaderPage