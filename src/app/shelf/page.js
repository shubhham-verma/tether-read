'use client';

import { useAuth } from "@/context/AuthContext";
import Skeleton from '@/components/Skeleton';

function shelf() {

    const { loading } = useAuth();
    if (loading)
        return (
            <Skeleton page='shelf' />
        )

    else
        return (
            <>
                <div className="text-6xl">shelf page</div>
            </>
        )
}

export default shelf