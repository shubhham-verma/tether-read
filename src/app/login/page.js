'use client';
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'

import Navbar from '@/components/Navbar-login'

function Login() {

  // const router = useRouter();
  // const [email, setEmail] = useState("");
  // const [password, setpassword] = useState("");

  // const handleLogin = async (event) => {
  //   event.preventDefault();



  // }



  return (
    <>
      <Navbar />
      <div>Login</div>
    </>
  )
}

export default Login