import React, { useState } from "react";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import { Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { confirmPasswordReset } from "firebase/auth";

const ResetPasswordForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please try again.");
      return;
    }

    try {
      const oobCode = new URLSearchParams(window.location.search).get('oobCode');
      await confirmPasswordReset(auth, oobCode, newPassword);
      setIsSubmitted(true);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (isSubmitted) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-sky-700">
          Reset Password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-gray-400" />
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
              aria-label="New Password"
            />
            <button
              type="button"
              onClick={toggleNewPasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-gray-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
              aria-label="Confirm Password"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errorMessage && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 text-sm text-red-600"
            >
              {errorMessage}
            </motion.p>
          )}
          <button
            type="submit"
            className="w-full bg-sky-600 text-white py-2 rounded-md hover:bg-sky-700 transition-colors duration-300"
          >
            Reset Password
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordForm;