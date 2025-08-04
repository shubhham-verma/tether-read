'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

import z from 'zod';
import { Button, Label, TextInput, HelperText, Spinner } from 'flowbite-react';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Skeleton from '@/components/Skeleton';

const passwordSchema = z
  .string()
  .min(6, { message: 'Password must be at least 6 characters long' })
  .refine((val) => /[a-z]/.test(val), {
    message: 'Password must include at least one lowercase letter',
  })
  .refine((val) => /[0-9]/.test(val), {
    message: 'Password must include at least one number',
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: 'Password must include at least one special character',
  });

const signupSchema = z
  .object({
    email: z.string().email({ message: 'Email address must be valid' }),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

function Signup() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setpassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailHelperText, setemailHelperText] = useState('');
  const [passwordHelperText, setpasswordHelperText] = useState([]);
  const [confirmPasswordHelperText, setConfirmPasswordHelperText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/shelf');
    }
  }, [authLoading, user, router]);

  if (authLoading || user) return <Skeleton page="signup" />;

  const handleSignup = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      signupSchema.parse({ email, password, confirmPassword });
      setpasswordHelperText([]);
      setemailHelperText('');
      setConfirmPasswordHelperText('');

      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully!');
      router.push('/shelf');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const tree = z.treeifyError(error);

        if (tree.properties?.email) {
          setemailHelperText(tree.properties.email.errors[0]);
        } else {
          setemailHelperText('');
        }

        if (tree.properties?.password) {
          setpasswordHelperText(tree.properties.password.errors);
        } else {
          setpasswordHelperText([]);
        }

        if (tree.properties?.confirmPassword) {
          setConfirmPasswordHelperText(tree.properties.confirmPassword.errors[0]);
        } else {
          setConfirmPasswordHelperText('');
        }
      } else {
        let message = 'Something went wrong';
        switch (error.code) {
          case 'auth/email-already-in-use':
            message = 'Email is already registered';
            break;
          case 'auth/invalid-email':
            message = 'Invalid email format';
            break;
          case 'auth/weak-password':
            message = 'Password is too weak';
            break;
          default:
            break;
        }
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (event) => {
    event.preventDefault();

    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Signed in with Google');
      router.push('/shelf');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-white dark:bg-green-900 rounded-lg p-8 shadow-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Create your account
        </h2>

        <div className="mb-4">
          <Label htmlFor="email" value="Email" />
          <TextInput
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            shadow
            required
          />
          {emailHelperText && <HelperText color="failure">{emailHelperText}</HelperText>}
        </div>

        <div className='relative my-4'>
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

        <div className='relative my-4'>
          <Label htmlFor="password" value="Password" />
          <TextInput
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter password"
            required
            onChange={(e) => { setConfirmPassword(e.target.value) }}
          />
          {confirmPasswordHelperText &&
            <HelperText>{confirmPasswordHelperText}</HelperText>
          }
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute top-[11px] right-3  text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showConfirmPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
          </button>
        </div>


        <Button type="submit" className="w-full mb-4" disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Sign up'}
        </Button>

        <div className="my-6 border-t border-gray-300" />


        <Button
          type="button"
          className="w-full mb-2"
          color="light"
          onClick={handleGoogleSignup}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="h-5 w-5 mx-2"
          />
          Sign up with Google
        </Button>



        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
