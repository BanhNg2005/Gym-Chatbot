import React, { useState } from "react";
import { FaGoogle, FaFacebook, FaGithub, FaUser, FaLock } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Navigate } from 'react-router-dom';

const SignInPage = () => {
  const [signInMethod, setSignInMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // this is empty for now (will add functionality later)
    setMessage("Sign-in successful!");
    setIsSubmitted(true); 
  };

  const handleThirdPartySignIn = (provider) => {
    // this is empty for now (will add functionality later)
    setMessage(`Signing in with ${provider}...`);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    // this is empty for now (will add functionality later)
    setMessage("Password reset link sent to your email!");
    setShowForgotPassword(false);
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
            className={`px-4 py-2 rounded-full ${
              signInMethod === "email"
                ? "bg-sky-600 text-white"
                : "bg-gray-200 text-gray-700"
            } transition-colors duration-300`}
          >
            Email/Phone
          </button>
          <button
            onClick={() => setSignInMethod("thirdParty")}
            className={`px-4 py-2 rounded-full ${
              signInMethod === "thirdParty"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                  aria-label="Email or Phone"
                />
              </div>
              <div className="relative">
                <FaLock className="absolute top-3 left-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                  aria-label="Password"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={togglePasswordVisibility}
                  className="mr-2"
                />
                <label htmlFor="showPassword" className="text-sm text-gray-600">
                  Show Password
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
            </motion.form>
          ) : signInMethod === "email" && showForgotPassword ? (
            <motion.form
              key="forgot-password-form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleForgotPassword}
              className="space-y-4"
            >
              <div className="relative">
                <FaUser className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                  aria-label="Email for password reset"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-sky-600 text-white py-2 rounded-md hover:bg-sky-700 transition-colors duration-300"
              >
                Reset Password
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
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

        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-green-600"
          >
            {message}
          </motion.p>
        )}

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

export default SignInPage;
