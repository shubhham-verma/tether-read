'use client';

import { useAuth } from "@/context/AuthContext";
import Skeleton from '@/components/Skeleton';


function UploadPage() {

  const { loading } = useAuth();


  if (loading)
    return (
      <Skeleton page='upload' />
    )

  else
    return (<>
      <div className='text-5xl' > Uploading component </div>
    </>)
}

export default UploadPage