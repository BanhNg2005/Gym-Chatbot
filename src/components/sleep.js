// sleep.js

import React, { useState, useEffect } from "react";
import { IoMdFitness, IoMdNutrition } from "react-icons/io";
import { FaSignInAlt, FaSignOutAlt, FaBed } from "react-icons/fa";
import { GiAchievement, GiWaterBottle } from "react-icons/gi";
import { FiSend, FiMenu, FiSun, FiMoon } from "react-icons/fi";
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
  doc,
  updateDoc,
  deleteDoc, // Imported for editing and deleting
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
  // Added state variables for editing
  const [editEntryId, setEditEntryId] = useState(null);
  const [editSleepDuration, setEditSleepDuration] = useState("");
  const [editSleepQuality, setEditSleepQuality] = useState("");
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
      const sleepQueryInstance = query(
        sleepCollection,
        orderBy("timestamp", "desc")
      );

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

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        toast.success("Signed out successfully!");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
        toast.error("Error signing out: " + error.message);
      });
  };

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

  // Function to delete a sleep entry
  const handleDelete = async (id) => {
    if (!user) {
      toast.error("Please sign in to delete your sleep data.");
      return;
    }

    try {
      const sleepDocRef = doc(database, `users/${user.uid}/sleep`, id);
      await deleteDoc(sleepDocRef);
      toast.success("Sleep data deleted successfully!");
    } catch (error) {
      console.error("Error deleting sleep data:", error);
      toast.error(`Error deleting sleep data: ${error.message}`);
    }
  };

  // Function to initiate editing a sleep entry
  const handleEditInitiate = (entry) => {
    setEditEntryId(entry.id);
    setEditSleepDuration(entry.duration.toString());
    setEditSleepQuality(entry.quality);
  };

  // Function to update a sleep entry
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to edit your sleep data.");
      return;
    }

    const newErrors = {};

    if (!editSleepDuration) {
      newErrors.editSleepDuration = "Sleep duration is required";
    } else if (isNaN(editSleepDuration) || parseFloat(editSleepDuration) <= 0) {
      newErrors.editSleepDuration = "Duration must be a positive number";
    }

    if (!editSleepQuality) {
      newErrors.editSleepQuality = "Sleep quality is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const duration = parseFloat(editSleepDuration);
      const sleepDocRef = doc(database, `users/${user.uid}/sleep`, editEntryId);
      await updateDoc(sleepDocRef, {
        duration,
        quality: editSleepQuality,
      });

      toast.success("Sleep data updated successfully!");
      setEditEntryId(null);
      setEditSleepDuration("");
      setEditSleepQuality("");
      setErrors({});
    } catch (error) {
      console.error("Error updating sleep data:", error);
      toast.error(`Error updating sleep data: ${error.message}`);
    }
  };

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
      legend: {
        position: "top",
        labels: { color: isDarkMode ? "#ffffff" : "#000000" },
      },
      title: {
        display: true,
        text: "Sleep Duration Over Time",
        color: isDarkMode ? "#ffffff" : "#000000",
      },
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
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <header
        className={`py-4 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } shadow-md sticky top-0 left-0 w-full p-4 z-50`}
      >
        <div className="container mx-auto flex justify-between items-center">
          <a href="/" className="text-2xl font-bold flex items-center">
            <img src="/images/dreamslogo.png" alt="Dreams Logo" className="w-8 h-8 mr-2"/>
            DREAMS
          </a>
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li>
                <Link
                  to="/workout"
                  className={`hover:text-blue-500 transition-colors duration-300 flex items-center ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <IoMdFitness className="mr-2"/> Workout
                </Link>
              </li>
              <li>
                <Link
                  to="/nutrition"
                  className={`hover:text-blue-500 transition-colors duration-300 flex items-center ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <IoMdNutrition className="mr-2"/> Nutrition
                </Link>
              </li>
              <li>
                <Link
                  to="/sleep"
                  className={`hover:text-blue-500 transition-colors duration-300 flex items-center ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <FaBed className="mr-2"/> Sleep
                </Link>
              </li>
              <li>
                <Link
                  to="/achievement"
                  className={`hover:text-blue-500 transition-colors duration-300 flex items-center ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <GiAchievement className="mr-2"/> Achievement
                </Link>
              </li>
            </ul>
          </nav>
          <div className="flex items-center space-x-4">

            {user ? (
              <>
                <span className="text-lg font-semibold hidden md:block">{`Hi, ${
                  user.displayName || user.email
                }`}</span>
                <button
                  onClick={handleSignOut}
                  className="hidden md:flex items-center space-x-2 bg-red-700 text-white px-4 py-2 rounded-full hover:bg-red-500 transition-colors duration-300"
                  aria-label="Sign out"
                >
                  <FaSignOutAlt/>
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link to="/login">
                <button
                  className="hidden md:flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors duration-300"
                  aria-label="Sign in"
                >
                  <FaSignInAlt/>
                  <span>Sign In</span>
                </button>
              </Link>
            )}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                isDarkMode ? "bg-yellow-400" : "bg-gray-200"
              }`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <FiSun className="text-gray-900"/> : <FiMoon/>}
            </button>
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-full bg-gray-200"
              aria-label="Toggle menu"
            >
              <FiMenu/>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden mt-4 px-4">
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/workout"
                    className="py-2 hover:text-blue-500 transition-colors duration-300 flex items-center"
                  >
                    <IoMdFitness className="mr-2"/> Workout
                  </Link>
                </li>
                <li>
                  <Link
                    to="/nutrition"
                    className="py-2 hover:text-blue-500 transition-colors duration-300 flex items-center"
                  >
                    <IoMdNutrition className="mr-2"/> Nutrition
                  </Link>
                </li>
                <li>
                  <Link
                    to="/sleep"
                    className="py-2 hover:text-blue-500 transition-colors duration-300 flex items-center"
                  >
                    <FaBed className="mr-2"/> Sleep
                  </Link>
                </li>
                <li>
                  <Link
                    to="/achievement"
                    className="py-2 hover:text-blue-500 transition-colors duration-300 flex items-center"
                  >
                    <GiAchievement className="mr-2"/> Achievement
                  </Link>
                </li>
              </ul>
            </nav>
            {user ? (
              <>
                <span className="mt-4 block text-lg font-semibold">{`Hi, ${
                  user.displayName || user.email
                }`}</span>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="mt-4 flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors duration-300 w-full"
                  aria-label="Sign out"
                >
                  <FaSignOutAlt/>
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link to="/login">
                <button
                  className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors duration-300 w-full"
                  aria-label="Sign in"
                >
                  <FaSignInAlt/>
                  <span>Sign In</span>
                </button>
              </Link>
            )}
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        {/* Sleep Tracking Section */}
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
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
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

        {/* Sleep Insights Section */}
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

        {/* Hydration Tip Section */}
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

        {/* Sleep History Section */}
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
                <li
                  key={entry.id}
                  className={`p-4 rounded ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  {editEntryId === entry.id ? (
                    // Edit form
                    <form onSubmit={handleUpdate} className="space-y-2">
                      <div>
                        <label
                          htmlFor="editSleepDuration"
                          className="block mb-1"
                        >
                          Sleep Duration (hours)
                        </label>
                        <input
                          type="number"
                          id="editSleepDuration"
                          value={editSleepDuration}
                          onChange={(e) =>
                            setEditSleepDuration(e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            isDarkMode
                              ? "bg-gray-600 text-white border-gray-500"
                              : "bg-white text-gray-900 border-gray-300"
                          }`}
                          min="0"
                          step="0.1"
                          required
                        />
                        {errors.editSleepDuration && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.editSleepDuration}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="editSleepQuality"
                          className="block mb-1"
                        >
                          Sleep Quality
                        </label>
                        <select
                          id="editSleepQuality"
                          value={editSleepQuality}
                          onChange={(e) =>
                            setEditSleepQuality(e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            isDarkMode
                              ? "bg-gray-600 text-white border-gray-500"
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
                        {errors.editSleepQuality && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.editSleepQuality}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditEntryId(null)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    // Display entry
                    <div>
                      <p>Date: {entry.timestamp.toLocaleDateString()}</p>
                      <p>Duration: {entry.duration} hours</p>
                      <p>Quality: {entry.quality}</p>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => handleEditInitiate(entry)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors duration-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
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