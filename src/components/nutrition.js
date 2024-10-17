import React, { useState, useEffect } from "react";
import { FaSun, FaMoon, FaUtensils, FaAppleAlt, FaClipboardList, FaCalendarAlt, FaBed, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { IoMdFitness, IoMdNutrition } from "react-icons/io";
import { GiAchievement } from "react-icons/gi";
import { FiSend, FiMenu } from "react-icons/fi";
import { Link } from "react-router-dom";
import { auth } from './firebase'; 
import { signOut, onAuthStateChanged } from "firebase/auth";

const Header = ({ isDarkMode, toggleDarkMode, user, toggleMenu, isMenuOpen }) => (
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
                  })
                  .catch((error) => {
                    console.error("Error signing out:", error);
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
);

const NutritionDashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} user={user} toggleMenu={toggleMenu} isMenuOpen={isMenuOpen} />
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <NutritionAdvice isDarkMode={isDarkMode} />
          <LogMeals isDarkMode={isDarkMode} />
        </div>
        <div className="mt-8">
          <MealPlans isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};

const NutritionAdvice = ({ isDarkMode }) => {
  const tips = [
    "Eat a variety of colorful fruits and vegetables",
    "Include lean proteins in every meal",
    "Stay hydrated by drinking plenty of water",
    "Limit processed foods and added sugars",
    "Include healthy fats from sources like avocados and nuts"
  ];

  return (
    <div className={`${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"} p-6 rounded-lg shadow-md`}>
      <div className="flex items-center mb-4">
        <FaAppleAlt className="text-2xl text-green-500 mr-2" />
        <h2 className="text-2xl font-bold">Nutritional Tips</h2>
      </div>
      <ul className="list-disc pl-5">
        {tips.map((tip, index) => (
          <li key={index} className="mb-2">{tip}</li>
        ))}
      </ul>
    </div>
  );
};

const LogMeals = ({ isDarkMode }) => {
  const [meal, setMeal] = useState("");
  const [calories, setCalories] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Meal logged:", { meal, calories });
    setMeal("");
    setCalories("");
  };

  return (
    <div className={`${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"} p-6 rounded-lg shadow-md`}>
      <div className="flex items-center mb-4">
        <FaUtensils className="text-2xl text-blue-500 mr-2" />
        <h2 className="text-2xl font-bold">Log Your Meal</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="meal" className="block mb-2">Meal/Snack:</label>
          <input
            type="text"
            id="meal"
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
            className={`w-full p-2 border rounded ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="calories" className="block mb-2">Calories:</label>
          <input
            type="number"
            id="calories"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className={`w-full p-2 border rounded ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
          />
        </div>
        <button type="submit" 
          className="bg-[#2563EB] text-white px-4 py-2 rounded-full flex items-center"> <FiSend className="mr-2" /> Log Meal 
        </button>
      </form>
    </div>
  );
};

const MealPlans = ({ isDarkMode }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const mealPlans = [
    {
      title: "High Protein Plan",
      description: "Perfect for muscle building and recovery",
      image: "",
      detailedDescription: "This high protein meal plan is designed to support muscle growth and recovery. It includes a variety of lean proteins, complex carbohydrates, and healthy fats to fuel your body and promote muscle synthesis. Ideal for athletes and those engaged in strength training."
    },
    {
      title: "Low Carb Plan",
      description: "Ideal for weight loss and blood sugar control",
      image: "",
      detailedDescription: "Our low carb meal plan is perfect for those looking to lose weight or manage their blood sugar levels. It focuses on high-quality proteins, healthy fats, and low-glycemic vegetables. This plan helps reduce insulin spikes and promotes fat burning."
    },
    {
      title: "Balanced Nutrition Plan",
      description: "For overall health and well-being",
      image: "",
      detailedDescription: "The balanced nutrition plan is designed to provide a well-rounded diet that supports overall health and well-being. It includes a mix of lean proteins, whole grains, fruits, vegetables, and healthy fats. This plan is suitable for most people looking to maintain a healthy lifestyle."
    }
  ];

  return (
    <div className={`${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"} p-6 rounded-lg shadow-md`}>
      <div className="flex items-center mb-4">
        <FaCalendarAlt className="text-2xl text-purple-500 mr-2" />
        <h2 className="text-2xl font-bold">Meal Plans</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mealPlans.map((plan, index) => (
          <div key={index} className={`${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"} rounded-lg overflow-hidden shadow-md`}>
            <img src={plan.image} alt={plan.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{plan.title}</h3>
              <p>{plan.description}</p>
              <button
                className="mt-4 bg-[#2563EB] text-white px-4 py-2 rounded-full flex items-center"
                onClick={() => setSelectedPlan(plan)}
              >
                <FaClipboardList className="mr-2" /> View Plan
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h3 className="text-2xl font-bold mb-4">{selectedPlan.title}</h3>
            <img src={selectedPlan.image} alt={selectedPlan.title} className="w-full h-64 object-cover rounded mb-4" />
            <p className="mb-4">{selectedPlan.detailedDescription}</p>
            <button
              className="bg-[#2563EB] text-white px-4 py-2 rounded-full"
              onClick={() => setSelectedPlan(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionDashboard;