import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaGithub } from "react-icons/fa";
import { Navigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider, githubProvider } from './firebase';

import '../index.css';

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
        if (!value) {
          error = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = "Invalid email format";
        }
        break;
      case "phone":
        if (!value) {
          error = "Phone number is required";
        } else if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) {
          error = "Invalid phone number";
        }
        break;
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)) {
          error = "Password must have at least 8 characters, one uppercase letter, and one number";
        }
        break;
      case "confirmPassword":
        if (!value) {
          error = "Confirm password is required";
        } else if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;
      default:
        break;
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formFields = ["email", "phone", "password", "confirmPassword"];
    const newErrors = {};

    formFields.forEach(field => {
      validateField(field, formData[field]);
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (Object.keys(newErrors).length === 0 && Object.values(errors).every(error => error === "")) {
      // Sign up with Firebase
      createUserWithEmailAndPassword(auth, formData.email, formData.password)
        .then((userCredential) => {
          console.log("Form submitted", userCredential.user);
          setIsSubmitted(true);
        })
        .catch((error) => {
          console.error("Error signing up:", error.message);
          setErrors((prevErrors) => ({ ...prevErrors, email: error.message }));
        });
    } else {
      setErrors(newErrors);
    }
  };

  // const googleProvider = new GoogleAuthProvider();
  // const googleBtn = () => {
  //   signInWithPopup(auth, googleProvider)
  //   .then ((result) => {
  //     const userInfo = result.user;
  //     console.log(userInfo);
  //   })
  //   .catch(err => console.log(err));
  // }

  const handleThirdPartySignUp = (provider) => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(`Signed up with ${provider.providerId}`, result.user);
        setIsSubmitted(true);
      })
      .catch((error) => {
        if (error.code === 'auth/popup-closed-by-user') {
          console.error('Popup closed by user');
        } else {
          console.error(`Error signing up with ${provider.providerId}:`, error.message);
          setErrors((prevErrors) => ({ ...prevErrors, email: error.message }));
        }
      });
  };

  if (isSubmitted) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
      <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-blue-600 bg-clip-text text-transparent leading-tight pb-2">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-base py-2 px-3"
              placeholder="you@example.com"
              required
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-base py-2 px-3"
              placeholder="(123) 456-7890"
              required
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-base py-2 px-3"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-base py-2 px-3"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <button
              onClick={() => handleThirdPartySignUp(googleProvider)}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <FaGoogle className="text-red-500" />
            </button>
            <button
              onClick={() => handleThirdPartySignUp(facebookProvider)}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <FaFacebook className="text-blue-600" />
            </button>
            <button
              onClick={() => handleThirdPartySignUp(githubProvider)}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <FaGithub className="text-gray-900" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
