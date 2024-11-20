// sleep.js

import React, { useState, useEffect } from "react";
import { IoMdFitness, IoMdNutrition } from "react-icons/io";
import {
  FaSignInAlt,
  FaSignOutAlt,
  FaBed,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import { GiAchievement, GiWaterBottle } from "react-icons/gi";
import {
  FiSend,
  FiMenu,
} from "react-icons/fi";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { database } from "./firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

const SleepTracker = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sleepDuration, setSleepDuration] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sleepHistory, setSleepHistory] = useState([]);
  const [weight, setWeight] = useState(70);
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState({});
  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (user) {
      const sleepCollection = collection(database, `users/${user.uid}/sleep`);
      const sleepQueryInstance = query(sleepCollection, orderBy("timestamp", "desc"));

      const unsubscribe = onSnapshot(
        sleepQueryInstance,
        (snapshot) => {
          const sleepEntries = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              duration: data.duration,
              quality: data.quality,
              timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
            };
          });
          setSleepHistory(sleepEntries);
        },
        (error) => {
          console.error("Error fetching sleep data:", error);
          toast.error("Error fetching sleep data: " + error.message);
        }
      );

      return () => unsubscribe();
    } else {
      setSleepHistory([]);
    }
  }, [user]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!sleepDuration) {
      newErrors.sleepDuration = "Sleep duration is required";
    } else if (isNaN(sleepDuration) || parseFloat(sleepDuration) <= 0) {
      newErrors.sleepDuration = "Duration must be a positive number";
    }

    if (!sleepQuality) {
      newErrors.sleepQuality = "Sleep quality is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!user) {
      toast.error("Please sign in to log your sleep data.");
      return;
    }

    try {
      const duration = parseFloat(sleepDuration);
      const sleepData = {
        duration,
        quality: sleepQuality,
        timestamp: serverTimestamp(),
      };

      const sleepCollection = collection(database, `users/${user.uid}/sleep`);
      await addDoc(sleepCollection, sleepData);

      toast.success("Sleep data logged successfully!");
      setSleepDuration("");
      setSleepQuality("");
      setErrors({});
    } catch (error) {
      console.error("Error adding sleep data:", error);
      toast.error(`Error adding sleep data: ${error.message}`);
    }
  };
  
  // This is to delete the sleep data

  const calculateWaterIntake = () => (weight * 0.033).toFixed(2);

  const chartData = {
    labels: sleepHistory
      .slice()
      .reverse()
      .map((entry) =>
        entry.timestamp instanceof Date
          ? entry.timestamp.toLocaleDateString()
          : "Invalid Date"
      ),
    datasets: [
      {
        label: "Sleep Duration (hours)",
        data: sleepHistory.slice().reverse().map((entry) => entry.duration),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: isDarkMode ? "#ffffff" : "#000000" } },
      title: { display: true, text: "Sleep Duration Over Time", color: isDarkMode ? "#ffffff" : "#000000" },
    },
    scales: {
      x: {
        ticks: { color: isDarkMode ? "#ffffff" : "#000000" },
        grid: { color: isDarkMode ? "#4B5563" : "#E5E7EB" },
      },
      y: {
        ticks: { color: isDarkMode ? "#ffffff" : "#000000" },
        grid: { color: isDarkMode ? "#4B5563" : "#E5E7EB" },
      },
    },
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      } transition-colors duration-300 flex flex-col`}
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />

      <header
        className={`${isDarkMode ? "bg-gray-800" : "bg-white"} sticky top-0 left-0 w-full p-4 shadow-md z-50`}
      >
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <img
              src="/images/dreamslogo.png"
              alt="Dreams Logo"
              className="w-8 h-8 mr-2"
            />
            DREAMS
          </Link>
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className={`${isDarkMode ? "text-white" : "text-gray-900"} focus:outline-none`}
              aria-label="Toggle menu"
            >
              <FiMenu size={24} />
            </button>
          </div>
          <nav
            className={`${
              isMenuOpen ? "block" : "hidden"
            } md:flex md:items-center absolute md:relative top-16 left-0 right-0 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } md:bg-transparent z-20 md:top-0`}
          >
            <ul className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 p-4 md:p-0">
              <li>
                <Link
                  to="/workout"
                  className={`hover:text-blue-400 flex items-center ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <IoMdFitness className="mr-1" /> Workout
                </Link>
              </li>
              <li>
                <Link
                  to="/nutrition"
                  className={`hover:text-blue-400 flex items-center ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <IoMdNutrition className="mr-1" /> Nutrition
                </Link>
              </li>
              <li>
                <Link
                  to="/sleep"
                  className={`hover:text-blue-400 flex items-center ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <FaBed className="mr-1" /> Sleep
                </Link>
              </li>
              <li>
                <Link
                  to="/achievement"
                  className={`hover:text-blue-400 flex items-center ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <GiAchievement className="mr-1" /> Achievement
                </Link>
              </li>
            </ul>
            {user ? (
              <>
                <span className="mt-4 md:mt-0 ml-4 text-lg font-semibold">{`Hi, ${
                  user.displayName || user.email
                }`}</span>
                <button
                  onClick={() => {
                    signOut(auth)
                      .then(() => {
                        toast.success("Signed out successfully!");
                      })
                      .catch((error) => {
                        console.error("Error signing out:", error);
                        toast.error("Error signing out: " + error.message);
                      });
                  }}
                  className="mt-4 md:mt-0 ml-4 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition duration-300 flex items-center"
                >
                  <FaSignOutAlt className="mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login">
                <button className="mt-4 md:mt-0 ml-4 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300 flex items-center">
                  <FaSignInAlt className="mr-2" />
                  Sign In
                </button>
              </Link>
            )}
            <button
              onClick={toggleDarkMode}
              className="ml-4 p-2 rounded-full focus:outline-none transition-colors duration-200 ease-in-out"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <FaSun className="text-yellow-400" size={24} />
              ) : (
                <FaMoon className="text-gray-700" size={24} />
              )}
            </button>
          </nav>
          {isMenuOpen && (
            <div className="md:hidden mt-4 px-4">
              <nav>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/workout"
                      className="py-2 hover:text-blue-500 transition-colors duration-300 flex items-center"
                    >
                      <IoMdFitness className="mr-2" /> Workout
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/nutrition"
                      className="py-2 hover:text-blue-500 transition-colors duration-300 flex items-center"
                    >
                      <IoMdNutrition className="mr-2" /> Nutrition
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/sleep"
                      className="py-2 hover:text-blue-500 transition-colors duration-300 flex items-center"
                    >
                      <FaBed className="mr-2" /> Sleep
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/achievement"
                      className="py-2 hover:text-blue-500 transition-colors duration-300 flex items-center"
                    >
                      <GiAchievement className="mr-2" /> Achievement
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        {/* this is sleep tracking section*/}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
          <section
            className={`p-6 rounded-lg shadow-lg ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center space-x-2 mb-4">
              <FaBed className="text-2xl text-blue-500" />
              <h2 className="text-xl font-semibold">Sleep Tracking</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="sleepDuration" className="block mb-1">
                  Sleep Duration (hours)
                </label>
                <input
                  type="number"
                  id="sleepDuration"
                  value={sleepDuration}
                  onChange={(e) => setSleepDuration(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                  min="0"
                  step="0.1"
                  required
                />
                {errors.sleepDuration && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.sleepDuration}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="sleepQuality" className="block mb-1">
                  Sleep Quality
                </label>
                <select
                  id="sleepQuality"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                  required
                >
                  <option value="">Select quality</option>
                  <option value="Poor">Poor</option>
                  <option value="Fair">Fair</option>
                  <option value="Good">Good</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Excellent">Excellent</option>
                </select>
                {errors.sleepQuality && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.sleepQuality}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center " 
              >
                <span>Log Sleep</span>
                <FiSend className="ml-2" />
              </button>
            </form>
          </section>

          <section
            className={`p-6 rounded-lg shadow-lg ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center space-x-2 mb-4">
              <IoMdNutrition className="text-2xl text-green-500" />
              <h2 className="text-xl font-semibold">Sleep Progress</h2>
            </div>
            <div className="w-full h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </section>
        </div>

        {/* This is the sleep insight section */}
        <section
          className={`mt-8 p-6 rounded-lg shadow-lg ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center space-x-2 mb-4">
            <FaBed className="text-2xl text-blue-500" />
            <h2 className="text-xl font-semibold">Sleep Insights</h2>
          </div>
          <ul className="list-disc pl-5 space-y-2">
            <li>Aim for 7-9 hours of sleep per night for optimal health.</li>
            <li>Maintain a consistent sleep schedule, even on weekends.</li>
            <li>Create a relaxing bedtime routine to help you unwind.</li>
            <li>Avoid caffeine and electronics before bedtime.</li>
            <li>
              Ensure your bedroom is dark, quiet, and cool for better sleep.
            </li>
          </ul>
        </section>

        {/* the hydration section section */}
        <section
          className={`mt-8 p-6 rounded-lg shadow-lg ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center space-x-2 mb-4">
            <GiWaterBottle className="text-2xl text-blue-500" />
            <h2 className="text-xl font-semibold">Hydration Tip</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="weight" className="block mb-1">
                Your Weight (kg)
              </label>
              <input
                type="number"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                }`}
                required
                min="0"
                step="0.1"
              />
            </div>
            <p>
              Based on your weight ({weight} kg), your recommended daily water
              intake is:
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {calculateWaterIntake()} liters
            </p>
            <p>
              Remember to adjust your water intake based on your activity level
              and climate.
            </p>
          </div>
        </section>

        {/* this is where the sleep history is shown */}
        <section
          className={`mt-8 p-6 rounded-lg shadow-lg ${
            isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
          }`}
        >
          <h2 className="text-2xl font-semibold mb-4">Sleep History</h2>
          {sleepHistory.length === 0 ? (
            <p>No sleep records found.</p>
          ) : (
            <ul className="space-y-2">
              {sleepHistory.map((entry) => (
                <li key={entry.id} className={`p-2 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <p>Date: {entry.timestamp.toLocaleDateString()}</p>
                  <p>Duration: {entry.duration} hours</p>
                  <p>Quality: {entry.quality}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default SleepTracker;