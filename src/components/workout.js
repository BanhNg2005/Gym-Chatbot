import React, { useState, useEffect } from "react";
import { FaDumbbell, FaRedo, FaBed, FaRandom, FaSignOutAlt, FaCommentDots } from "react-icons/fa";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FaSignInAlt } from "react-icons/fa";
import { IoMdFitness, IoMdNutrition } from "react-icons/io";
import { GiAchievement } from "react-icons/gi";
import { FiMenu, FiSun, FiMoon, FiSend } from "react-icons/fi";
import { auth, database } from './firebase';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import 'react-toastify/dist/ReactToastify.css';

const Workout = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [workoutPlan, setWorkoutPlan] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Set up Firestore listener for chat messages
        const chatRef = collection(database, `users/${currentUser.uid}/chats`);
        const q = query(chatRef, orderBy("timestamp", "asc"));

        const unsubscribeChats = onSnapshot(q, (snapshot) => {
          const chats = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              type: data.type,
              message: data.message,
              timestamp: data.timestamp?.toDate() || new Date(),
            };
          });
          setChatHistory(chats);
        });

        return () => {
          unsubscribeChats();
        };
      } else {
        setChatHistory([]);
      }
    });

    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    };
  }, []);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();

    if (chatMessage.trim() === "") {
      toast.error("Please enter a message before sending.");
      return;
    }

    if (!user) {
      toast.error("You need to login first to send a message.");
      return;
    }

    try {
      const userMessageData = {
        message: chatMessage,
        type: "user",
        timestamp: serverTimestamp(),
      };

      await addDoc(
        collection(database, `users/${user.uid}/chats`),
        userMessageData
      );

      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: chatMessage }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      const botMessageData = {
        message: data.response,
        type: "bot",
        timestamp: serverTimestamp(),
      };

      await addDoc(
        collection(database, `users/${user.uid}/chats`),
        botMessageData
      );

      setChatMessage("");
    } catch (error) {
      toast.error("Error submitting chat: " + error.message);
    }
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        toast.success("Signed out successfully!");
      })
      .catch((error) => {
        toast.error("Error signing out: " + error.message);
      });
  };

  const handleCreateWorkout = async (plan) => {
    setWorkoutPlan(plan);
    try {
      if (!user) {
        throw new Error("User is not authenticated! Please sign in to save your workout plan.");
      }
  
      const workoutData = {
        workoutType: plan.workoutType,
        duration: parseInt(plan.duration, 10), 
        muscleGroups: plan.muscleGroups.map((mg) => ({
          label: mg.label,
          value: mg.value,
        })),
        timestamp: serverTimestamp(),
      };
  
      const docRef = await addDoc(collection(database, `users/${user.uid}/workoutPlans`), workoutData);
      toast.success("Workout plan saved successfully!");
    } catch (error) {
      toast.error('Error creating workout plan: ' + error.message);
    }
  };

  const handleAdjustWorkout = async (feedback) => {
    try {
      if (!user) {
        throw new Error("User is not authenticated! Please sign in to adjust your workout.");
      }
      const docRef = await addDoc(collection(database, `users/${user.uid}/workoutAdjustments`), feedback);
      toast.success('Workout adjusted successfully!');
    } catch (error) {
      toast.error('Error adjusting workout: ' + error.message);
    }
  };

  const handleSetRestDay = async (days) => {
    try {
      if (!user) {
        throw new Error("User is not authenticated! Please sign in to set your rest days.");
      }
      const docRef = await addDoc(collection(database, `users/${user.uid}/restDays`), { days });
      toast.success('Rest days set successfully!');
    } catch (error) {
      toast.error('Error setting rest days: ' + error.message);
    }
  };

  const handleExerciseVariation = async (exerciseName, variationName) => {
    try {
      if (!user) {
        throw new Error("User is not authenticated! Please sign in to select exercise variations.");
      }
      const data = {
        exercise: exerciseName,
        variation: variationName,
        timestamp: new Date(),
      };
      const docRef = await addDoc(
        collection(database, `users/${user.uid}/exerciseVariations`),
        data
      );
      toast.success(
        `Selected variation "${variationName}" for "${exerciseName}".`
      );
    } catch (error) {
      toast.error("Error selecting exercise variation: " + error.message);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen ${
      isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
    } transition-colors duration-300 flex flex-col`}>
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
            <img src="/images/dreamslogo.png" alt="Dreams Logo" className="w-8 h-8 mr-2" />
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
                  <IoMdFitness className="mr-2" /> Workout
                </Link>
              </li>
              <li>
                <Link
                  to="/nutrition"
                  className={`hover:text-blue-500 transition-colors duration-300 flex items-center ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <IoMdNutrition className="mr-2" /> Nutrition
                </Link>
              </li>
              <li>
                <Link
                  to="/sleep"
                  className={`hover:text-blue-500 transition-colors duration-300 flex items-center ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <FaBed className="mr-2" /> Sleep
                </Link>
              </li>
              <li>
                <Link
                  to="/achievement"
                  className={`hover:text-blue-500 transition-colors duration-300 flex items-center ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <GiAchievement className="mr-2" /> Achievement
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
                  className="hidden md:flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors duration-300"
                  aria-label="Sign out"
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link to="/login">
                <button
                  className="hidden md:flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors duration-300"
                  aria-label="Sign in"
                >
                  <FaSignInAlt />
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
              {isDarkMode ? <FiSun className="text-gray-900" /> : <FiMoon />}
            </button>
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-full bg-gray-200"
              aria-label="Toggle menu"
            >
              <FiMenu />
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
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link to="/login">
                <button
                  className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors duration-300 w-full"
                  aria-label="Sign in"
                >
                  <FaSignInAlt />
                  <span>Sign In</span>
                </button>
              </Link>
            )}
          </div>
        )}
      </header>
      <h1 className={`text-4xl font-bold text-center mt-8 mb-8 ${isDarkMode ? 'text-white' : 'text-black'}`}>Workout Planner</h1>
      <div className="flex justify-center space-x-4 mb-8">
        <TabButton icon={<FaDumbbell />} label="Create Plan" active={activeTab === "create"} onClick={() => handleTabChange("create")} isDarkMode={isDarkMode} />
        <TabButton icon={<FaRedo />} label="Adjust Workout" active={activeTab === "adjust"} onClick={() => handleTabChange("adjust")} isDarkMode={isDarkMode} />
        <TabButton icon={<FaBed />} label="Rest Days" active={activeTab === "rest"} onClick={() => handleTabChange("rest")} isDarkMode={isDarkMode} />
        <TabButton icon={<FaRandom />} label="Variations" active={activeTab === "variations"} onClick={() => handleTabChange("variations")} isDarkMode={isDarkMode} />
      </div>

      {activeTab === "create" && <CreateWorkoutPlan onCreateWorkout={handleCreateWorkout} isDarkMode={isDarkMode} />}
      {activeTab === "adjust" && <AdjustWorkout onAdjustWorkout={handleAdjustWorkout} isDarkMode={isDarkMode} />}
      {activeTab === "rest" && <RestDays onSetRestDay={handleSetRestDay} isDarkMode={isDarkMode} />}
      {activeTab === "variations" && <ExerciseVariations onSelectVariation={handleExerciseVariation} isDarkMode={isDarkMode} />}

      <button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none"
        aria-label="Open chatbot"
      >
        <FaCommentDots size={24} />
      </button>

      {isChatbotOpen && (
        <div
          className={`fixed bottom-20 right-1 border rounded-lg shadow-lg w-96 max-w-full z-50 ${
            isDarkMode
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-gray-900 border-gray-300"
          }`}
        >
          <div
            className={`flex justify-between items-center p-4 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h3 className="text-lg font-semibold">AI Assistant</h3>
            <button
              onClick={toggleChatbot}
              className={`focus:outline-none ${
                isDarkMode
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              aria-label="Close chatbot"
            >
              &times;
            </button>
          </div>
          <div className="p-4 h-64 overflow-y-auto">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`mb-4 ${
                  chat.type === "user" ? "text-right" : "text-left"
                }`}
              >
                {chat.type === "bot" ? (
                  <div
                    className={`prose prose-sm ${
                      isDarkMode ? "prose-invert" : ""
                    } inline-block p-2 rounded-lg ${
                      isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {chat.message}
                    </ReactMarkdown>
                    <div className="text-xs text-gray-500 mt-1">
                      {chat.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div className="inline-block">
                    <span
                      className={`inline-block p-2 rounded-lg ${
                        isDarkMode
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {chat.message}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {chat.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <form
            onSubmit={handleChatSubmit}
            className={`flex p-4 border-t ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask me anything about fitness..."
              className={`flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                isDarkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300"
              aria-label="Send message"
            >
              <FiSend size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ icon, label, active, onClick, isDarkMode }) => (
  <button
    className={`flex items-center space-x-2 px-4 py-2 rounded-full ${active ? "bg-blue-600 text-white" : `${isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"}`}`}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const muscleGroupOptions = [
  { value: 'Chest', label: 'Chest' },
  { value: 'Back', label: 'Back' },
  { value: 'Legs', label: 'Legs' },
  { value: 'Arms', label: 'Arms' },
  { value: 'Shoulders', label: 'Shoulders' },
  { value: 'Core', label: 'Core' },
];

const CreateWorkoutPlan = ({ onCreateWorkout, isDarkMode }) => {
  const [workoutType, setWorkoutType] = useState("");
  const [duration, setDuration] = useState("");
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!workoutType) newErrors.workoutType = "Workout type is required";
    if (!duration) newErrors.duration = "Duration is required";
    if (muscleGroups.length === 0) newErrors.muscleGroups = "At least one muscle group must be selected";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const workoutData = {
      workoutType,
      duration: parseInt(duration, 10),
      muscleGroups: muscleGroups.map((mg) => ({
        label: mg.label,
        value: mg.value,
      })),
    };

    onCreateWorkout(workoutData);
    setWorkoutType("");
    setDuration("");
    setMuscleGroups([]);
    setErrors({});
  };

  return (
    <div className={`shadow-md rounded-lg p-6 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
      <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Create Workout Plan</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`} htmlFor="workoutType">
            Workout Type
          </label>
          <select
            id="workoutType"
            className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${errors.workoutType ? "border-red-500" : ""} ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value)}
            required
          >
            <option value="">Select Workout Type</option>
            <option value="Strength Training">Strength Training</option>
            <option value="Cardio">Cardio</option>
            <option value="Flexibility">Flexibility</option>
            <option value="Balance">Balance</option>
          </select>
          {errors.workoutType && <p className="text-red-500 text-xs italic">{errors.workoutType}</p>}
        </div>
        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`} htmlFor="duration">
            Duration (minutes)
          </label>
          <input
            type="number"
            id="duration"
            className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${errors.duration ? "border-red-500" : ""} ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            min="1"
          />
          {errors.duration && <p className="text-red-500 text-xs italic">{errors.duration}</p>}
        </div>
        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Muscle Groups</label>
          <Select
            isMulti
            options={muscleGroupOptions}
            className={`react-select-container ${errors.muscleGroups ? 'border border-red-500' : ''}`}
            classNamePrefix="react-select"
            value={muscleGroups}
            onChange={(selectedOptions) => setMuscleGroups(selectedOptions)}
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
                color: isDarkMode ? '#fff' : '#000',
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: isDarkMode ? '#374151' : '#fff',
              }),
              multiValue: (provided) => ({
                ...provided,
                backgroundColor: isDarkMode ? '#4B5563' : '#D1D5DB',
              }),
              multiValueLabel: (provided) => ({
                ...provided,
                color: isDarkMode ? '#fff' : '#000',
              }),
              multiValueRemove: (provided) => ({
                ...provided,
                color: isDarkMode ? '#fff' : '#000',
                ':hover': {
                  backgroundColor: isDarkMode ? '#9CA3AF' : '#D1D5DB',
                  color: '#fff',
                },
              }),
            }}
            placeholder="Select Muscle Groups"
          />
          {errors.muscleGroups && <p className="text-red-500 text-xs italic">{errors.muscleGroups}</p>}
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-3xl focus:outline-none focus:shadow-outline"
        >
          Create Workout Plan
        </button>
      </form>
    </div>
  );
};

const AdjustWorkout = ({ onAdjustWorkout, isDarkMode }) => {
  const [difficulty, setDifficulty] = useState(3);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdjustWorkout({ difficulty, feedback });
    setDifficulty(3);
    setFeedback("");
  };

  return (
    <div className={`shadow-md rounded-lg p-6 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
      <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Adjust Workout</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Workout Difficulty</label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`w-8 h-8 rounded-full focus:outline-none ${difficulty === value ? "bg-sky-500 text-white" : "bg-sky-200 text-gray-900"}`}
                onClick={() => setDifficulty(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`} htmlFor="feedback">
            Feedback
          </label>
          <textarea
            id="feedback"
            className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
            rows="4"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-3xl focus:outline-none focus:shadow-outline"
        >
          Submit Adjustment
        </button>
      </form>
    </div>
  );
};

const RestDays = ({ onSetRestDay, isDarkMode }) => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [errors, setErrors] = useState({});

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (selectedDays.length === 0) {
      newErrors.selectedDays = "Please select at least one rest day.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSetRestDay(selectedDays);
    setSelectedDays([]);
    setErrors({});
  };

  return (
    <div className={`shadow-md rounded-lg p-6 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
      <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Set Rest Days</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <button
              key={day}
              type="button"
              className={`p-2 rounded ${selectedDays.includes(day) ? "bg-sky-500 text-white" : "bg-sky-200 text-gray-900"}`}
              onClick={() => toggleDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
        {errors.selectedDays && <p className="text-red-500 text-xs italic mb-4">{errors.selectedDays}</p>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-3xl focus:outline-none focus:shadow-outline"
        >
          Set Rest Days
        </button>
      </form>
      <div className="mt-4">
        <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Why Rest Days Matter</h3>
        <p>
          Rest days are an essential part of any effective fitness routine, not just for muscle recovery,
          but also for overall progress and long-term health. When you exercise, your muscles undergo stress and tiny tears,
          and it's during rest that they repair and grow stronger. Skipping rest days can lead to burnout, overtraining,
          and an increased risk of injury, which could ultimately derail your fitness journey.
          By incorporating 1-2 rest days each week, you give your body the chance to rebuild and restore,
          allowing you to come back to your workouts feeling refreshed and ready to perform at your best.
          It's important to listen to your body—rest days aren’t a sign of weakness but a key component of balanced
          training that can elevate your results and prevent setbacks.
        </p>
      </div>
    </div>
  );
};

const ExerciseVariations = ({ onSelectVariation, isDarkMode }) => {
  const [selectedExercise, setSelectedExercise] = useState(null);

  const exercises = [
    {
      name: "Planks",
      variations: [
        {
          name: "Forearm plank",
          image: require("./templates/PlankForearm.jpg"),
          description:
            "One of the most common ways to perform a plank, is slightly easier than holding your body up with just your hands.\n\nPlace forearms on the floor with elbows aligned below shoulders and arms parallel to your body at about shoulder width. If flat palms bother your wrists, clasp your hands together.",
          suggestedRepsSets: "3 sets of 60 seconds",
          caloriesBurned: "5 calories per minute",
        },
        {
          name: "Side plank",
          image: require("./templates/SidePlank.jpg"),
          description:
            "This core exercise targets your obliques, shoulders, glutes, and legs. Start by lying on your side with legs stacked and prop yourself up on your elbow or hand. Engage your core, lift your hips, and keep your body in a straight line. To make it harder, raise your top arm or leg, or both. For more support, cross your top leg in front of your body. Hold and maintain alignment for maximum benefit.",
          suggestedRepsSets: "3 sets of 45 seconds each side",
          caloriesBurned: "4 calories per minute",
        },
        {
          name: "Plank shoulder taps",
          image: require("./templates/PlankShoulderTaps.jpg"),
          description:
            "This plank variation adds a dynamic element to the exercise, challenging your core and shoulder stability. Start in a high plank position with hands directly under shoulders and feet hip-width apart. Keeping your hips square to the floor, lift one hand and tap the opposite shoulder. Return to the starting position and repeat on the other side. Continue alternating sides while maintaining a strong plank position.",
          suggestedRepsSets: "3 sets of 20 taps",
          caloriesBurned: "6 calories per minute",
        },
      ],
    },
    {
      name: "Squats",
      variations: [
        {
          name: "Barbell back squat", image: require("./templates/BackSquat.jpg"),
          description: "This compound movement strengthens your quads, core, and glutes. Start by positioning the barbell on the front of your shoulders, keeping your elbows up and chest high. Stand with feet shoulder-width apart, then lower your body into a squat by bending at the hips and knees. Keep your back straight and core tight. Push through your heels to return to standing. Ensure the barbell stays stable and your torso upright throughout.",
          suggestedRepsSets: "3 sets of 10 reps",
          caloriesBurned: "8 calories per minute",
        },
        {
          name: "Dumbbell squat", image: require("./templates/DumbbellSquat.jpg"),
          description: "This compound movement strengthens your quads, glutes, hamstrings, and core. Start by holding a dumbbell in each hand at your sides or at shoulder level. Stand with feet shoulder-width apart, then lower your body into a squat by bending at the hips and knees. Keep your chest up, back straight, and core tight. Push through your heels to return to standing. Ensure your posture stays upright throughout the movement.",
          suggestedRepsSets: "3 sets of 12 reps",
          caloriesBurned: "6 calories per minute",
        },
        {
          name: "Sumo squat", image: require("./templates/SumoSquat.jpg"),
          description: "This compound movement targets your inner thighs, glutes, and quads. Begin by standing with feet wider than shoulder-width apart and toes pointing outward. Hold a dumbbell or kettlebell with both hands in front of your hips. Lower your body into a squat by bending at the hips and knees. Keep your chest up, back straight, and core engaged. Press through your heels to return to standing, maintaining stability in your torso throughout.",
          suggestedRepsSets: "3 sets of 15 reps",
          caloriesBurned: "7 calories per minute",
        },
      ],
    },
    {
      name: "Push-ups",
      variations: [
        {
          name: "Standard push-up", image: require("./templates/PushupStandard.jpg"),
          description: "This classic bodyweight exercise targets your chest, shoulders, triceps, and core. Start in a high plank position with hands directly under shoulders and feet hip-width apart. Lower your body by bending your elbows, keeping them close to your sides. Push back up to the starting position, maintaining a straight line from head to heels. Modify by dropping to your knees or elevating your hands on a bench.",
          suggestedRepsSets: "3 sets of 12 reps",
          caloriesBurned: "4 calories per minute",
        },
        {
          name: "Incline push-up", image: require("./templates/PushupIncline.jpg"),
          description: "This push-up variation is easier than the standard version and targets your chest, shoulders, and triceps. Start in a high plank position with hands on an elevated surface, such as a bench or step. Lower your body by bending your elbows, keeping them close to your sides. Push back up to the starting position, maintaining a straight line from head to heels. Increase the incline for added difficulty.",
          suggestedRepsSets: "3 sets of 10 reps",
          caloriesBurned: "3 calories per minute",
        },
        {
          name: "Diamond push-up", image: require("./templates/PushupDiamond.jpg"),
          description: "This push-up variation targets your triceps, chest, and shoulders. Start in a high plank position with hands close together under your chest, forming a diamond shape with your thumbs and index fingers. Lower your body by bending your elbows, keeping them close to your sides. Push back up to the starting position, maintaining a straight line from head to heels. Modify by dropping to your knees or elevating your hands on a bench.",
          suggestedRepsSets: "3 sets of 8 reps",
          caloriesBurned: "5 calories per minute",
        },
      ],
    },
    {
      name: "Lunges",
      variations: [
        {
          name: "Forward lunge", image: require("./templates/LungeForward.jpg"),
          description: "This lower body exercise targets your quads, hamstrings, and glutes. Start by standing with feet hip-width apart. Take a big step forward with one leg and lower your body until both knees are bent at a 90-degree angle. Keep your front knee over your ankle and your back knee hovering just above the floor without touching. Push through your front heel to return to standing. Repeat on the other side.",
          suggestedRepsSets: "3 sets of 12 reps each leg",
          caloriesBurned: "6 calories per minute",
        },
        {
          name: "Wide lunge", image: require("./templates/LungeWide.jpg"),
          description: "This lunge variation targets your inner thighs, quads, hamstrings, and glutes. Start by standing with feet wider than hip-width apart. Take a big step to one side and lower your body into a lunge, bending the knee of the leading leg while keeping the other leg straight. Push through your heel to return to standing. Repeat on the other side. Maintain a straight back and engage your core throughout.",
          suggestedRepsSets: "3 sets of 10 reps each leg",
          caloriesBurned: "5 calories per minute",
        },
        {
          name: "Walking lunge", image: require("./templates/LungeWalking.jpg"),
          description: "This dynamic lunge variation targets your quads, hamstrings, and glutes. Start by standing with feet hip-width apart. Take a big step forward with one leg and lower your body until both knees are bent at a 90-degree angle. Push through your front heel to return to standing and immediately step forward with the other leg. Continue walking forward, alternating legs with each step.",
          suggestedRepsSets: "3 sets of 20 steps",
          caloriesBurned: "7 calories per minute",
        },
      ],
    }
  ];

  return (
    <div className={`shadow-md rounded-lg p-6 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
      <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Exercise Variations</h2>
      <div className="grid grid-cols-2 gap-4">
        {exercises.map((exercise) => (
          <div key={exercise.name} className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">{exercise.name}</h3>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-3xl focus:outline-none focus:shadow-outline"
              onClick={() => {
                if (selectedExercise && selectedExercise.name === exercise.name) {
                  setSelectedExercise(null);
                } else {
                  setSelectedExercise(exercise);
                }
              }}
            >
              {selectedExercise && selectedExercise.name === exercise.name ? 'Hide Variations' : 'View Variations'}
            </button>
          </div>
        ))}
      </div>
      {selectedExercise && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">
            {selectedExercise.name} Variations
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {selectedExercise.variations.map((variation) => (
              <div key={variation.name} className="border rounded-lg p-4">
                <img src={variation.image} alt={variation.name} className="w-full h-45 object-cover rounded-lg mb-2" />
                <h4 className="font-semibold mb-2">{variation.name}</h4>
                {variation.description && <p className="text-sm mb-2">{variation.description}</p>}
                <p className="text-sm mb-1"><strong>Suggested Reps/Sets:</strong> {variation.suggestedRepsSets}</p>
                <p className="text-sm mb-2"><strong>Calories Burned:</strong> {variation.caloriesBurned}</p>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-3xl focus:outline-none focus:shadow-outline"
                  onClick={() => onSelectVariation(selectedExercise.name, variation.name)}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Workout;