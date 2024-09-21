import React, { useState } from "react";
import { FaFacebook, FaGoogle, FaTwitter } from "react-icons/fa";
import { motion } from "framer-motion";

const AccountCreationPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    age: "",
    weight: "",
    height: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let newErrors = { ...errors };

    switch (name) {
      case "email":
        newErrors.email = /^\S+@\S+\.\S+$/.test(value) ? "" : "Invalid email format";
        break;
      case "password":
        newErrors.password =
          value.length < 8 ? "Password must be at least 8 characters long" : "";
        break;
      case "age":
        newErrors.age =
          isNaN(value) || value < 13 || value > 120
            ? "Age must be between 13 and 120"
            : "";
        break;
      case "weight":
        newErrors.weight =
          isNaN(value) || value < 30 || value > 300
            ? "Weight must be between 30 and 300 kg"
            : "";
        break;
      case "height":
        newErrors.height =
          isNaN(value) || value < 100 || value > 250
            ? "Height must be between 100 and 250 cm"
            : "";
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic here
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Create Your Fitness Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                errors.email ? "border-red-500" : ""
              }`}
              required
              aria-describedby="email-error"
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                errors.password ? "border-red-500" : ""
              }`}
              required
              aria-describedby="password-error"
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                errors.age ? "border-red-500" : ""
              }`}
              required
              aria-describedby="age-error"
            />
            {errors.age && (
              <p id="age-error" className="mt-1 text-sm text-red-600">
                {errors.age}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              Weight (kg)
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                errors.weight ? "border-red-500" : ""
              }`}
              required
              aria-describedby="weight-error"
            />
            {errors.weight && (
              <p id="weight-error" className="mt-1 text-sm text-red-600">
                {errors.weight}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700">
              Height (cm)
            </label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                errors.height ? "border-red-500" : ""
              }`}
              required
              aria-describedby="height-error"
            />
            {errors.height && (
              <p id="height-error" className="mt-1 text-sm text-red-600">
                {errors.height}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-md py-2 px-4 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Create Account
          </button>
        </form>
        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">Or sign up with:</p>
          <div className="mt-4 flex justify-center space-x-4">
            <button
              aria-label="Sign up with Facebook"
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaFacebook size={20} />
            </button>
            <button
              aria-label="Sign up with Google"
              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaGoogle size={20} />
            </button>
            <button
              aria-label="Sign up with Twitter"
              className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
            >
              <FaTwitter size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountCreationPage;