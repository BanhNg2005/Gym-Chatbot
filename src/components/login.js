import React, { useState } from "react";
import { FaGoogle, FaFacebook, FaGithub, FaUser, FaLock } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Navigate } from 'react-router-dom';

import "../index.css";

const SignInPage = () => {
  const [signInMethod, setSignInMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    const formFields = ["email", "phone", "password", "confirmPassword"];
    const newErrors = {};

    formFields.forEach(field => {
      validateField(field, formData[field]);
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (Object.keys(newErrors).length === 0 && Object.values(errors).every(error => error === "")) {
      console.log("Form submitted", formData);
      setIsSubmitted(true);
      setMessage("Sign-in successful!");
    } else {
      setErrors(newErrors);
    }
  };

  const validateField = (field, value) => {
    // Add your field validation logic here
    console.log(`Validating field: ${field}, value: ${value}`);
  };

  const handleThirdPartySignIn = (provider) => {
    setMessage(`Signing in with ${provider}...`);
  };

  if (isSubmitted) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-low to-secondary-low flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-theme-color-primary">
          Sign In
        </h1>

        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setSignInMethod("email")}
            className={`px-4 py-2 rounded-full ${
              signInMethod === "email"
                ? "bg-theme-color-primary text-white"
                : "bg-gray-200 text-gray-700"
            } transition-colors duration-300`}
          >
            Email/Phone
          </button>
          <button
            onClick={() => setSignInMethod("thirdParty")}
            className={`px-4 py-2 rounded-full ${
              signInMethod === "thirdParty"
                ? "bg-theme-color-primary text-white"
                : "bg-gray-200 text-gray-700"
            } transition-colors duration-300`}
          >
            Third-Party
          </button>
        </div>

        <AnimatePresence mode="wait">
          {signInMethod === "email" ? (
            <motion.form
              key="email-form"
              initial={{ opacity: 0, x: -50 }}
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-primary"
                  required
                  aria-label="Email or Phone"
                />
              </div>
              <div className="relative">
                <FaLock className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-primary"
                  required
                  aria-label="Password"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-theme-color-primary text-white py-2 rounded-md hover:bg-theme-color-primary-dark transition-colors duration-300"
              >
                Sign In
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="third-party"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
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
            href="signup"
            className="text-theme-color-primary hover:underline"
          >
            Sign up here
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default SignInPage;