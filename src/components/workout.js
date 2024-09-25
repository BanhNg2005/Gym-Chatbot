import React, { useState } from "react";
import { FaDumbbell, FaChartLine, FaRedo, FaBed, FaRandom } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FaSignInAlt, FaMoon, FaSun } from "react-icons/fa";
import { IoMdFitness, IoMdNutrition } from "react-icons/io";
import { GiAchievement } from "react-icons/gi";
import { FiSend, FiMenu } from "react-icons/fi";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Workout = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [workoutPlan, setWorkoutPlan] = useState({});
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [exerciseSuggestions, setExerciseSuggestions] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreateWorkout = (plan) => {
    setWorkoutPlan(plan);
    // this is empty for now (will add functionality later)
  };

  const handleLogProgress = (progress) => {
    setWorkoutHistory([...workoutHistory, progress]);
    // this is empty for now (will add functionality later)
  };

  const handleAdjustWorkout = (feedback) => {
    // this is empty for now (will add functionality later)
  };

  const handleSetRestDay = (day) => {
    // this is empty for now (will add functionality later)
  };

  const handleExerciseVariation = (exercise, variation) => {
    // this is empty for now (will add functionality later)
  };
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-lavender-50">
        <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          body {
            font-family: 'Poppins', sans-serif;
          }
        `}
      </style>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 shadow-md`}>
        <div className="container mx-auto flex justify-between items-center">
          <a href="/" className="text-2xl font-bold">DREAMS</a>
          <div className="md:hidden">
            <button onClick={toggleMenu} className={`${isDarkMode ? 'text-white' : 'text-gray-900'} focus:outline-none`}>
              <FiMenu size={24} />
            </button>
          </div>
          <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:flex md:items-center absolute md:relative top-16 left-0 right-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} md:bg-transparent z-20 md:top-0`}>
            <ul className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 p-4 md:p-0">
              <li><Link to="/workout" className={`hover:text-blue-400 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <IoMdFitness className="mr-1" /> Workout
            </Link></li>
              <li><a href="#" className={`hover:text-blue-400 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><IoMdNutrition className="mr-1" /> Nutrition</a></li>
              <li><a href="#" className={`hover:text-blue-400 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><FaBed className="mr-1" /> Sleep</a></li>
              <li><a href="#" className={`hover:text-blue-400 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><GiAchievement className="mr-1" /> Achievement</a></li>
            </ul>
            <Link to="/login">
              <button className="mt-4 md:mt-0 ml-4 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300 flex items-center">
                <FaSignInAlt className="mr-2" />
                Sign In
              </button>
            </Link>
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
      <h1 className="text-4xl font-bold text-center text-purple-700 mb-8">Workout Planner</h1>
      <div className="flex justify-center space-x-4 mb-8">
        <TabButton icon={<FaDumbbell />} label="Create Plan" active={activeTab === "create"} onClick={() => handleTabChange("create")} />
        <TabButton icon={<FaChartLine />} label="Track Progress" active={activeTab === "track"} onClick={() => handleTabChange("track")} />
        <TabButton icon={<FaRedo />} label="Adjust Workout" active={activeTab === "adjust"} onClick={() => handleTabChange("adjust")} />
        <TabButton icon={<FaBed />} label="Rest Days" active={activeTab === "rest"} onClick={() => handleTabChange("rest")} />
        <TabButton icon={<FaRandom />} label="Variations" active={activeTab === "variations"} onClick={() => handleTabChange("variations")} />
      </div>

      {activeTab === "create" && <CreateWorkoutPlan onCreateWorkout={handleCreateWorkout} />}
      {activeTab === "track" && <TrackWorkoutProgress onLogProgress={handleLogProgress} history={workoutHistory} />}
      {activeTab === "adjust" && <AdjustWorkout onAdjustWorkout={handleAdjustWorkout} />}
      {activeTab === "rest" && <RestDays onSetRestDay={handleSetRestDay} />}
      {activeTab === "variations" && <ExerciseVariations onSelectVariation={handleExerciseVariation} />}
    </div>
  );
};

const TabButton = ({ icon, label, active, onClick }) => (
  <button
    className={`flex items-center space-x-2 px-4 py-2 rounded-full ${active ? "bg-purple-500 text-white" : "bg-lavender-200 text-purple-700"}`}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const CreateWorkoutPlan = ({ onCreateWorkout }) => {
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
    // Reset form
    setWorkoutType("");
    setDuration("");
    setMuscleGroups([]);
    setErrors({});
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-purple-700">Create Workout Plan</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-purple-700 text-sm font-bold mb-2" htmlFor="workoutType">
            Workout Type
          </label>
          <select
            id="workoutType"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-purple-700 leading-tight focus:outline-none focus:shadow-outline ${errors.workoutType ? "border-red-500" : ""}`}
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
          <label className="block text-purple-700 text-sm font-bold mb-2" htmlFor="duration">
            Duration (minutes)
          </label>
          <input
            type="number"
            id="duration"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-purple-700 leading-tight focus:outline-none focus:shadow-outline ${errors.duration ? "border-red-500" : ""}`}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          {errors.duration && <p className="text-red-500 text-xs italic">{errors.duration}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-purple-700 text-sm font-bold mb-2">Muscle Groups</label>
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
                <span className="ml-2 text-purple-700">{group}</span>
              </label>
            ))}
          </div>
          {errors.muscleGroups && <p className="text-red-500 text-xs italic">{errors.muscleGroups}</p>}
        </div>
        <button
          type="submit"
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Create Workout Plan
        </button>
      </form>
    </div>
  );
};

const TrackWorkoutProgress = ({ onLogProgress, history }) => {
  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogProgress({ exercise, sets, reps, weight, date: new Date() });
    // Reset form
    setExercise("");
    setSets("");
    setReps("");
    setWeight("");
  };

  const chartData = {
    labels: history.map((entry) => entry.date.toLocaleDateString()),
    datasets: [
      {
        label: "Weight Lifted",
        data: history.map((entry) => entry.weight),
        borderColor: "rgb(147, 112, 219)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-purple-700">Track Workout Progress</h2>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-purple-700 text-sm font-bold mb-2" htmlFor="exercise">
              Exercise
            </label>
            <input
              type="text"
              id="exercise"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-purple-700 leading-tight focus:outline-none focus:shadow-outline"
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-purple-700 text-sm font-bold mb-2" htmlFor="sets">
              Sets
            </label>
            <input
              type="number"
              id="sets"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-purple-700 leading-tight focus:outline-none focus:shadow-outline"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-purple-700 text-sm font-bold mb-2" htmlFor="reps">
              Reps
            </label>
            <input
              type="number"
              id="reps"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-purple-700 leading-tight focus:outline-none focus:shadow-outline"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-purple-700 text-sm font-bold mb-2" htmlFor="weight">
              Weight (lbs)
            </label>
            <input
              type="number"
              id="weight"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-purple-700 leading-tight focus:outline-none focus:shadow-outline"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Log Progress
        </button>
      </form>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2 text-purple-700">Progress Chart</h3>
        <Line data={chartData} />
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2 text-purple-700">Workout History</h3>
        <ul className="divide-y divide-purple-200">
          {history.map((entry, index) => (
            <li key={index} className="py-4">
              <p className="text-sm font-medium text-purple-900">{entry.exercise}</p>
              <p className="text-sm text-purple-500">
                {entry.sets} sets x {entry.reps} reps @ {entry.weight} lbs
              </p>
              <p className="text-sm text-purple-500">{entry.date.toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const AdjustWorkout = ({ onAdjustWorkout }) => {
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
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-purple-700">Adjust Workout</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-purple-700 text-sm font-bold mb-2">Workout Difficulty</label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`w-8 h-8 rounded-full focus:outline-none ${difficulty === value ? "bg-purple-500 text-white" : "bg-lavender-200"}`}
                onClick={() => setDifficulty(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-purple-700 text-sm font-bold mb-2" htmlFor="feedback">
            Feedback
          </label>
          <textarea
            id="feedback"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-purple-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="4"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit Adjustment
        </button>
      </form>
    </div>
  );
};

const RestDays = ({ onSetRestDay }) => {
  const [selectedDays, setSelectedDays] = useState([]);

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSetRestDay(selectedDays);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-purple-700">Set Rest Days</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <button
              key={day}
              type="button"
              className={`p-2 rounded ${selectedDays.includes(day) ? "bg-purple-500 text-white" : "bg-lavender-200"}`}
              onClick={() => toggleDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
        <button
          type="submit"
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Set Rest Days
        </button>
      </form>
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2 text-purple-700">Why Rest Days Matter</h3>
        <p className="text-purple-700">
          Rest days are crucial for muscle recovery and growth. They help prevent burnout and reduce the risk of injury.
          Aim for 1-2 rest days per week, depending on your workout intensity and fitness level.
        </p>
      </div>
    </div>
  );
};

const ExerciseVariations = ({ onSelectVariation }) => {
  const [selectedExercise, setSelectedExercise] = useState(null);

  const exercises = [
    {
      name: "Push-ups",
      variations: [
        { name: "Standard Push-ups", image: "" },
        { name: "Wide Push-ups", image: "" },
        { name: "Diamond Push-ups", image: "" },
      ],
    },
    {
      name: "Squats",
      variations: [
        { name: "Bodyweight Squats", image: "" },
        { name: "Jump Squats", image: "" },
        { name: "Sumo Squats", image: "" },
      ],
    },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-purple-700">Exercise Variations</h2>
      <div className="grid grid-cols-2 gap-4">
        {exercises.map((exercise) => (
          <div key={exercise.name} className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-purple-700">{exercise.name}</h3>
            <button
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => setSelectedExercise(exercise)}
            >
              View Variations
            </button>
          </div>
        ))}
      </div>
      {selectedExercise && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4 text-purple-700">{selectedExercise.name} Variations</h3>
          <div className="grid grid-cols-3 gap-4">
            {selectedExercise.variations.map((variation) => (
              <div key={variation.name} className="border rounded-lg p-4">
                <img src={variation.image} alt={variation.name} className="w-full h-40 object-cover rounded-lg mb-2" />
                <h4 className="font-semibold mb-2 text-purple-700">{variation.name}</h4>
                <button
                  className="bg-lavender-300 hover:bg-lavender-400 text-purple-700 font-bold py-1 px-2 rounded text-sm focus:outline-none focus:shadow-outline"
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