import React, { useState, useEffect } from "react";
import { FaDumbbell, FaRedo, FaBed, FaRandom, FaSignOutAlt } from "react-icons/fa";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FaSignInAlt, FaMoon, FaSun } from "react-icons/fa";
import { IoMdFitness, IoMdNutrition } from "react-icons/io";
import { GiAchievement } from "react-icons/gi";
import { FiMenu } from "react-icons/fi";
import { auth } from './firebase';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { database } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

const Workout = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [workoutPlan, setWorkoutPlan] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const collectionRef = collection(database, "workoutHistory");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handler functions
  const handleCreateWorkout = async (plan) => {
    setWorkoutPlan(plan);
    try {
      if (!user) {
        throw new Error("User is not authenticated");
      }
      const docRef = await addDoc(collection(database, `users/${user.uid}/workoutPlans`), plan);
      console.log("Workout plan saved with ID: ", docRef.id);
      alert("Workout plan saved successfully!");
    } catch (error) {
      console.error("Error saving workout plan: ", error);
      alert('Error creating workout plan: ' + error.message);
    }
  };

  const handleAdjustWorkout = async (feedback) => {
    try {
      if (!user) {
        throw new Error("User is not authenticated");
      }
      const docRef = await addDoc(collection(database, `users/${user.uid}/workoutAdjustments`), feedback);
      console.log("Workout adjustment saved with ID: ", docRef.id);
      alert('Workout adjusted successfully!');
    } catch (error) {
      console.error("Error saving workout adjustment: ", error);
      alert('Error adjusting workout: ' + error.message);
    }
  };

  const handleSetRestDay = async (days) => {
    try {
      if (!user) {
        throw new Error("User is not authenticated");
      }
      const docRef = await addDoc(collection(database, `users/${user.uid}/restDays`), { days });
      console.log("Rest days saved with ID: ", docRef.id);
      alert('Rest days set successfully!');
    } catch (error) {
      console.error("Error saving rest days: ", error);
      alert('Error setting rest days: ' + error.message);
    }
  };

  const handleExerciseVariation = async (exerciseName, variationName) => {
    try {
      if (!user) {
        throw new Error("User is not authenticated");
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
      console.log("Exercise variation saved with ID: ", docRef.id);
      alert(
        `Selected variation "${variationName}" for "${exerciseName}".`
      );
    } catch (error) {
      console.error("Error saving exercise variation: ", error);
      alert("Error selecting exercise variation: " + error.message);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          body {
            font-family: 'Poppins', sans-serif;
            min-height: 100vh;
            margin: 0;
          }
        `}
      </style>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} sticky top-0 left-0 w-full p-4 shadow-md z-50`}>
        <div className="container mx-auto flex justify-between items-center">
          <a href="/" className="text-2xl font-bold flex items-center">
            <img src="/images/dreamslogo.png" alt="Dreams Logo" className="w-8 h-8 mr-2" />
            DREAMS
          </a>
          <div className="md:hidden">
            <button onClick={toggleMenu} className={`${isDarkMode ? 'text-white' : 'text-gray-900'} focus:outline-none`}>
              <FiMenu size={24} />
            </button>
          </div>
          <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:flex md:items-center absolute md:relative top-16 left-0 right-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} md:bg-transparent z-20 md:top-0`}>
            <ul className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 p-4 md:p-0">
              <li>
                <Link to="/workout" className={`hover:text-blue-400 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <IoMdFitness className="mr-1" /> Workout
                </Link>
              </li>
              <li>
                <a href="/nutrition" className={`hover:text-blue-400 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <IoMdNutrition className="mr-1" /> Nutrition
                </a>
              </li>
              <li>
                <a href="#" className={`hover:text-blue-400 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <FaBed className="mr-1" /> Sleep
                </a>
              </li>
              <li>
                <a href="#" className={`hover:text-blue-400 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <GiAchievement className="mr-1" /> Achievement
                </a>
              </li>
            </ul>
            {user ? (
              <>
                <span className="mt-4 md:mt-0 ml-4 text-lg font-semibold">
                  {`Hi, ${user.displayName || user.email}`}
                </span>
                <button
                  onClick={() => {
                    signOut(auth)
                      .then(() => {
                        console.log("User signed out");
                        alert("Signed out successfully!");
                      })
                      .catch((error) => {
                        console.error("Error signing out:", error);
                        alert("Error signing out: " + error.message);
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
            >
              {isDarkMode ? (
                <FaSun className="text-yellow-400" size={24} />
              ) : (
                <FaMoon className="text-gray-700" size={24} />
              )}
            </button>
          </nav>
        </div>
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

    onCreateWorkout({ workoutType, duration, muscleGroups });
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
          >
            <option value="">Select Workout Type</option>
            <option value="strength">Strength Training</option>
            <option value="cardio">Cardio</option>
            <option value="flexibility">Flexibility</option>
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
          />
          {errors.duration && <p className="text-red-500 text-xs italic">{errors.duration}</p>}
        </div>
        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Muscle Groups</label>
          <div className="flex flex-wrap">
            {["Chest", "Back", "Legs", "Arms", "Shoulders", "Core"].map((group) => (
              <label key={group} className="inline-flex items-center mr-4 mb-2">
                <input
                  type="checkbox"
                  className="form-checkbox text-purple-500"
                  value={group}
                  checked={muscleGroups.includes(group)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setMuscleGroups([...muscleGroups, group]);
                    } else {
                      setMuscleGroups(muscleGroups.filter((item) => item !== group));
                    }
                  }}
                />
                <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>{group}</span>
              </label>
            ))}
          </div>
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
    // Reset form
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
          name: "Forearm plank", image: require("./PlankForearm.jpg"),
          description: "One of the most common ways to perform a plank, is slightly easier than holding your body up with just your hands.\n\nPlace forearms on the floor with elbows aligned below shoulders and arms parallel to your body at about shoulder width. If flat palms bother your wrists, clasp your hands together."
        },
        {
          name: "Side plank", image: require("./SidePlank.jpg"),
          description: "This core exercise targets your obliques, shoulders, glutes, and legs. Start by lying on your side with legs stacked and prop yourself up on your elbow or hand. Engage your core, lift your hips, and keep your body in a straight line. To make it harder, raise your top arm or leg, or both. For more support, cross your top leg in front of your body. Hold and maintain alignment for maximum benefit."
        },
        {
          name: "Plank shoulder taps", image: require("./PlankShoulderTaps.jpg"),
          description: "This plank variation adds a dynamic element to the exercise, challenging your core and shoulder stability. Start in a high plank position with hands directly under shoulders and feet hip-width apart. Keeping your hips square to the floor, lift one hand and tap the opposite shoulder. Return to the starting position and repeat on the other side. Continue alternating sides while maintaining a strong plank position."
        },
      ],
    },
    {
      name: "Squats",
      variations: [
        {
          name: "Barbell back squat", image: require("./BackSquat.jpg"),
          description: "This compound movement strengthens your quads, core, and glutes. Start by positioning the barbell on the front of your shoulders, keeping your elbows up and chest high. Stand with feet shoulder-width apart, then lower your body into a squat by bending at the hips and knees. Keep your back straight and core tight. Push through your heels to return to standing. Ensure the barbell stays stable and your torso upright throughout."
        },
        {
          name: "Dumbbell squat", image: require("./DumbbellSquat.jpg"),
          description: "This compound movement strengthens your quads, glutes, hamstrings, and core. Start by holding a dumbbell in each hand at your sides or at shoulder level. Stand with feet shoulder-width apart, then lower your body into a squat by bending at the hips and knees. Keep your chest up, back straight, and core tight. Push through your heels to return to standing. Ensure your posture stays upright throughout the movement."
        },
        {
          name: "Sumo squat", image: require("./SumoSquat.jpg"),
          description: "This compound movement targets your inner thighs, glutes, and quads. Begin by standing with feet wider than shoulder-width apart and toes pointing outward. Hold a dumbbell or kettlebell with both hands in front of your hips. Lower your body into a squat by bending at the hips and knees. Keep your chest up, back straight, and core engaged. Press through your heels to return to standing, maintaining stability in your torso throughout."
        },
      ],
    },
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