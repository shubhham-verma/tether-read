'use client';

import React from 'react'
import { useAuth } from "@/context/AuthContext";


function UploadPage() {

  const { loading } = useAuth();

  if (loading)
    return (<>
      <div className='text-5xl' > Skeleton component </div>
    </>)

  else
    return (<>
      <div className='text-5xl' > Uploading component </div>
    </>)
}

export default UploadPage