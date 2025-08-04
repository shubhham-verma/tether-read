'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import z from 'zod';
import { useAuth } from '@/context/AuthContext';


import { Button, Label, TextInput, HelperText, Spinner } from "flowbite-react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import toast from 'react-hot-toast'
import Skeleton from '@/components/Skeleton';


const passwordSchema = z
  .string()
  .min(6, { message: "Password must be at least 6 characters long" })
  .refine((val) => /[a-z]/.test(val), {
    message: "Password must include at least one lowercase letter",
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "Password must include at least one number",
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: "Password must include at least one special character",
  });

const loginSchema = z.object({
  email: z.email({ message: "Email address must be valid" }),
  password: passwordSchema,
});

function Login() {


  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setpassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailHelperText, setemailHelperText] = useState("");
  const [passwordHelperText, setpasswordHelperText] = useState([]);
  const [loading, setLoading] = useState(false);

  const pageLoading = useAuth().loading;
  const user = useAuth().user;

  const handleLogin = async (event) => {
    event.preventDefault();


    try {
      setLoading(true);

      loginSchema.parse({ email, password });

      setpasswordHelperText([]);
      setemailHelperText("");

      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!')
      router.push('/shelf');

    }
    catch (error) {
      if (error instanceof z.ZodError) { // must be form validation error
        const tree = z.treeifyError(error);

        // Email helper text
        if (tree.properties?.email) {
          setemailHelperText(tree.properties.email.errors[0]);
        } else {
          setemailHelperText("");
        }

        // Password helper text
        if (tree.properties?.password) {
          setpasswordHelperText(tree.properties.password.errors);
        } else {
          setpasswordHelperText([]);
        }
      }
      else {  // must be auth error
        console.log(error.code);
        let message = 'Something went wrong'
        switch (error.code) {
          case 'auth/user-not-found':
            message = 'No user found with this email'
            break
          case 'auth/invalid-credential':
            message = 'Incorrect email or password'
            break
          case 'auth/too-many-requests':
            message = 'Too many failed attempts. Try again later'
            break
          default:
            break
        }
        toast.error(message)
      }
    }
    finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = async (event) => {
    event.preventDefault();

    try {
      await signInWithPopup(auth, googleProvider);
      console.log("google login clicked");
      router.push('/shelf');

    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!pageLoading && user) {
      router.replace('/shelf');
    }
  }, [user, pageLoading, router]);


  if (pageLoading || user)
    return (
      <Skeleton page='login' />
    )


  else
    return (
      <>
        <main className="flex flex-col min-h-screen bg-gray-950 gap-y-30 py-4">

          <div className="flex items-center justify-center  p-4 ">
            <div className="text-2xl md:text-3xl text-white font-bold text-center">
              Discover. Learn. Grow.
            </div>
          </div>

          <div className="flex items-center justify-center  px-4">
            <div className="w-full max-w-md bg-green-900 p-6 rounded-lg shadow-md">
              <form className="space-y-4">
                <div>
                  <Label htmlFor="email" value="Email" />
                  <TextInput
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    required
                    onChange={(e) => { setEmail(e.target.value) }}
                  />
                  {emailHelperText && <HelperText>{emailHelperText}</HelperText>
                  }
                </div>
                <div className='relative'>
                  <Label htmlFor="password" value="Password" />
                  <TextInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    required
                    onChange={(e) => { setpassword(e.target.value) }}
                  />
                  {passwordHelperText &&
                    passwordHelperText.map((elem, idx) => (
                      <HelperText key={idx}>{elem}</HelperText>
                    ))
                  }
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute top-[11px] right-3  text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                  </button>
                </div>
                <Button type="submit" color="teal" className="w-full" onClick={handleLogin} disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Spinner color="failure" aria-label='login loading spinner' />
                    </div>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>

              <div className="my-6 border-t border-gray-300" />

              <Button
                color="light"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGoogleLogin}
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="h-5 w-5"
                />
                Continue with Google
              </Button>

              <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
                Don't have an account?{' '}
                <Link href="/signup" className="text-blue-500 hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </main>

      </>
    )
}

export default Login