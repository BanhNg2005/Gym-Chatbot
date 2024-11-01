import React, { useState, useEffect } from "react";
import { FaGoogle, FaFacebook, FaGithub, FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Navigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, googleProvider, facebookProvider, githubProvider } from './firebase';

const LoginForm = () => {
  const [signInMethod, setSignInMethod] = useState("email");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [emailOrPhoneError, setEmailOrPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resetEmailError, setResetEmailError] = useState("");
  const [resetEmailSuccess, setResetEmailSuccess] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    const savedEmailOrPhone = localStorage.getItem('emailOrPhone');
    const savedPassword = localStorage.getItem('password');
    if (savedEmailOrPhone && savedPassword) {
      setEmailOrPhone(savedEmailOrPhone);
      setPassword(savedPassword);
      handleSignIn(savedEmailOrPhone, savedPassword, true);
    }
  }, []);

  const isEmail = (input) => {
    const emailPattern = /^\S+@\S+\.\S+$/;
    return emailPattern.test(input);
  };

  const handleSignIn = async (emailOrPhoneInput, passwordInput, remember) => {
    setEmailOrPhoneError("");
    setPasswordError("");

    if (isEmail(emailOrPhoneInput)) {
      try {
        await signInWithEmailAndPassword(auth, emailOrPhoneInput, passwordInput);
        if (remember) {
          localStorage.setItem('emailOrPhone', emailOrPhoneInput);
          // Warning: Storing passwords in localStorage is not secure.
          // Consider using more secure methods like sessionStorage or secure HTTP-only cookies.
          localStorage.setItem('password', passwordInput);
        }
        setIsSubmitted(true);
      } catch (error) {
        setEmailOrPhoneError("Incorrect email or password. Please try again.");
      }
    } else {
      try {
        const appVerifier = new RecaptchaVerifier('recaptcha-container', {
          'size': 'invisible',
          'callback': (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          }
        }, auth);
        const confirmationResult = await signInWithPhoneNumber(auth, emailOrPhoneInput, appVerifier);
        const code = window.prompt('Enter the OTP sent to your phone');
        if (code) {
          await confirmationResult.confirm(code);
          if (remember) {
            localStorage.setItem('emailOrPhone', emailOrPhoneInput);
            localStorage.setItem('password', passwordInput); // Although password may not be applicable for phone auth
          }
          setIsSubmitted(true);
        } else {
          setEmailOrPhoneError("OTP verification failed. Please try again.");
        }
      } catch (error) {
        setEmailOrPhoneError("Please type a correct email/phone number!");
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetEmailError("");
    setResetEmailSuccess("");

    const emailPattern = /^\S+@\S+\.\S+$/;
    if (!emailPattern.test(resetEmail)) {
      setResetEmailError("Please enter a valid email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetEmailSuccess("If an account exists with that email, a password reset link has been sent.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      if (error.code === 'auth/invalid-email') {
        setResetEmailError("Please enter a valid email address.");
      } else {
        setResetEmailError("Error sending reset email. Please try again.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleSignIn(emailOrPhone, password, rememberMe);
  };

  const handleThirdPartySignIn = async (provider) => {
    try {
      let selectedProvider;
      switch (provider) {
        case "Google":
          selectedProvider = googleProvider;
          break;
        case "Facebook":
          selectedProvider = facebookProvider;
          break;
        case "GitHub":
          selectedProvider = githubProvider;
          break;
        default:
          return;
      }
      await signInWithPopup(auth, selectedProvider);
      setIsSubmitted(true);
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setEmailOrPhoneError("The authentication popup was closed before completing the sign-in process. Please try again.");
      } else {
        setEmailOrPhoneError(error.message);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isSubmitted) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 to-sky-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-sky-700">
          Sign In
        </h1>

        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setSignInMethod("email")}
            className={`px-4 py-2 rounded-full ${signInMethod === "email"
                ? "bg-sky-600 text-white"
                : "bg-gray-200 text-gray-700"
              } transition-colors duration-300`}
          >
            Email/Phone
          </button>
          <button
            onClick={() => setSignInMethod("thirdParty")}
            className={`px-4 py-2 rounded-full ${signInMethod === "thirdParty"
                ? "bg-sky-600 text-white"
                : "bg-gray-200 text-gray-700"
              } transition-colors duration-300`}
          >
            Third-Party
          </button>
        </div>

        <AnimatePresence mode="wait">
          {signInMethod === "email" && !showForgotPassword ? (
            <motion.form
              key="email-form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="relative">
                <FaUser className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Email or Phone"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                  aria-label="Email or Phone"
                />
                {emailOrPhoneError && (
                  <p className="mt-1 text-sm text-red-600">{emailOrPhoneError}</p>
                )}
              </div>
              <div className="relative">
                <FaLock className="absolute top-3 left-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                  aria-label="Password"
                />
                <div
                  className="absolute top-3 right-3 cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600">
                  Remember Me
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-sky-600 text-white py-2 rounded-md hover:bg-sky-700 transition-colors duration-300"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="w-full text-sky-600 text-sm hover:underline"
              >
                Forgot Password?
              </button>
              <div id="recaptcha-container"></div>
            </motion.form>
          ) : signInMethod === "email" && showForgotPassword ? (
            <motion.form
              key="forgot-password-form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleResetPassword}
              className="space-y-4"
            >
              <div className="relative">
                <FaUser className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                  aria-label="Email for password reset"
                />
                {(resetEmailError || resetEmailSuccess) && (
                  <p className={`mt-1 text-sm ${resetEmailError ? 'text-red-600' : 'text-green-600'}`}>
                    {resetEmailError || resetEmailSuccess}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-sky-600 text-white py-2 rounded-md hover:bg-sky-700 transition-colors duration-300"
              >
                Reset Password
              </button>
              <button
                type="button"
                onClick={() => { setShowForgotPassword(false); setResetEmailError(""); setResetEmailSuccess(""); }}
                className="w-full text-sky-600 text-sm hover:underline"
              >
                Back to Sign In
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="third-party"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <button
                onClick={() => handleThirdPartySignIn("Google")}
                className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors duration-300"
              >
                <FaGoogle />
                <span>Sign in with Google</span>
              </button>
              <button
                onClick={() => handleThirdPartySignIn("Facebook")}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
              >
                <FaFacebook />
                <span>Sign in with Facebook</span>
              </button>
              <button
                onClick={() => handleThirdPartySignIn("GitHub")}
                className="w-full flex items-center justify-center space-x-2 bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 transition-colors duration-300"
              >
                <FaGithub />
                <span>Sign in with GitHub</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-sky-600 hover:underline"
          >
            Sign up here
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginForm;