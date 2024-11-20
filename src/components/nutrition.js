import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiSend, FiSun, FiMoon } from "react-icons/fi";
import { FaBed, FaSignInAlt, FaSignOutAlt, FaAppleAlt, FaUtensils, FaCalendarAlt, FaClipboardList } from "react-icons/fa";
import { IoMdFitness, IoMdNutrition } from "react-icons/io";
import { GiAchievement } from "react-icons/gi";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { database } from "./firebase";

import "react-toastify/dist/ReactToastify.css";

const Nutrition = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const [meal, setMeal] = useState("");
  const [calories, setCalories] = useState("");
  const [mealsHistory, setMealsHistory] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [errors, setErrors] = useState({ meal: "", calories: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user) {
      // Reference to the user's nutrition collection
      const nutritionCollection = collection(database, `users/${user.uid}/nutrition`);

      // Create a query to order meals by timestamp (latest first)
      const mealsQuery = query(nutritionCollection, orderBy("timestamp", "desc"));

      // Set up a real-time listener
      const unsubscribe = onSnapshot(
        mealsQuery,
        (snapshot) => {
          const meals = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              meal: data.meal,
              calories: data.calories,
              timestamp: data.timestamp ? data.timestamp.toDate() : new Date(), // Convert to Date
            };
          });
          setMealsHistory(meals);
        },
        (error) => {
          console.error("Error fetching meals:", error);
          toast.error("Error fetching meals: " + error.message);
        }
      );

      // Cleanup the listener on unmount or when user changes
      return () => unsubscribe();
    } else {
      // If no user is authenticated, clear the meals history
      setMealsHistory([]);
    }
  }, [user]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

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

  // Enhanced handleSubmit function with improved validation
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate Meal/Snack
    if (!meal.trim()) {
      newErrors.meal = "Meal/Snack information is required";
    }

    // Validate Calories
    if (!calories) {
      newErrors.calories = "Calories information is required";
    } else if (isNaN(calories) || parseInt(calories, 10) <= 0) {
      newErrors.calories = "Calories must be a positive number";
    }

    // If there are validation errors, update the state and exit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Proceed to add meal
    handleAddMeal();

    // Reset form fields and errors
    setMeal("");
    setCalories("");
    setErrors({});
  };

  const handleDeleteMeal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this meal?")) return;
  
    try {
      if (!user) {
        throw new Error("User is not authenticated!");
      }
  
      const mealDocRef = doc(database, `users/${user.uid}/nutrition/${id}`);
      await deleteDoc(mealDocRef);
      toast.success("Meal deleted successfully!");
    } catch (error) {
      console.error("Error deleting meal:", error);
      toast.error(`Error deleting meal: ${error.message}`);
    }
  };

  const handleAddMeal = async () => {
    try {
      if (!user) {
        throw new Error("User is not authenticated! Please sign in to save your meal.");
      }

      // Parse calories to a number
      const parsedCalories = parseInt(calories, 10);
      if (isNaN(parsedCalories) || parsedCalories <= 0) {
        throw new Error("Calories must be a positive number.");
      }

      const mealData = {
        meal: meal.trim(),
        calories: parsedCalories,
        timestamp: serverTimestamp(), // Use Firestore server timestamp
      };

      // Log the data being sent
      console.log("Submitting Meal Data:", mealData);

      // Reference to the user's nutrition collection
      const nutritionCollection = collection(database, `users/${user.uid}/nutrition`);

      // Add the meal to Firestore
      const docRef = await addDoc(nutritionCollection, mealData);

      console.log("Meal saved with ID:", docRef.id);
      toast.success("Meal logged successfully!");

      // Reset form fields and errors
      setMeal("");
      setCalories("");
      setErrors({});
    } catch (error) {
      console.error("Error adding meal:", error);
      toast.error(`Error adding meal: ${error.message}`);
    }
  };

  const mealPlans = [
    {
      title: "High Protein Plan",
      description: "Perfect for muscle building and recovery",
      image: require("./highprotein.jpg"),
      detailedDescription:
        "This high protein meal plan is designed to support muscle growth and recovery. It includes a variety of lean proteins, complex carbohydrates, and healthy fats to fuel your body and promote muscle synthesis. Ideal for athletes and those engaged in strength training.",
    },
    {
      title: "Low Carb Plan",
      description: "Ideal for weight loss and blood sugar control",
      image: require("./lowcarb.jpg"),
      detailedDescription:
        "Our low carb meal plan is perfect for those looking to lose weight or manage their blood sugar levels. It focuses on high-quality proteins, healthy fats, and low-glycemic vegetables. This plan helps reduce insulin spikes and promotes fat burning.",
    },
    {
      title: "Balanced Nutrition Plan",
      description: "For overall health and well-being",
      image: require("./balanced.jpg"),
      detailedDescription:
        "The balanced nutrition plan is designed to provide a well-rounded diet that supports overall health and well-being. It includes a mix of lean proteins, whole grains, fruits, vegetables, and healthy fats. This plan is suitable for most people looking to maintain a healthy lifestyle.",
    },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
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

      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Nutritional Tips */}
          <div
            className={`${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              } p-6 rounded-lg shadow-md`}
          >
            <div className="flex items-center mb-4">
              <FaAppleAlt className="text-2xl text-green-500 mr-2" />
              <h2 className="text-2xl font-bold">Nutritional Tips</h2>
            </div>
            <ul className="list-disc pl-5">
              {[
                "Eat a variety of colorful fruits and vegetables",
                "Include lean proteins in every meal",
                "Stay hydrated by drinking plenty of water",
                "Limit processed foods and added sugars",
                "Include healthy fats from sources like avocados and nuts",
              ].map((tip, index) => (
                <li key={index} className="mb-2">
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Log Your Meal */}
          <div
            className={`${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              } p-6 rounded-lg shadow-md`}
          >
            <div className="flex items-center mb-4">
              <FaUtensils className="text-2xl text-blue-500 mr-2" />
              <h2 className="text-2xl font-bold">Log Your Meal</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="meal" className="block mb-2">
                  Meal/Snack:
                </label>
                <input
                  type="text"
                  id="meal"
                  value={meal}
                  onChange={(e) => setMeal(e.target.value)}
                  className={`w-full p-2 border rounded ${isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                    } ${errors.meal ? "border-red-500" : ""}`}
                />
                {errors.meal && (
                  <p className="text-red-500 text-sm mt-1">{errors.meal}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="calories" className="block mb-2">
                  Calories:
                </label>
                <input
                  type="number"
                  id="calories"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  min="1"
                  step="1"
                  className={`w-full p-2 border rounded ${isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                    } ${errors.calories ? "border-red-500" : ""}`}
                />
                {errors.calories && (
                  <p className="text-red-500 text-sm mt-1">{errors.calories}</p>
                )}
              </div>

              <button
                type="submit"
                className="bg-[#2563EB] text-white px-4 py-2 rounded-full flex items-center"
              >
                <FiSend className="mr-2" /> Log Meal
              </button>
            </form>
            {mealsHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Meals History</h3>
                <ul className="list-disc pl-5">
                  {mealsHistory.map((mealItem) => (
                    <li key={mealItem.id} className="mb-1 flex justify-between items-center">
                      <div>
                        <strong>{mealItem.meal}</strong> - {mealItem.calories} Calories on{" "}
                        {mealItem.timestamp instanceof Date
                          ? mealItem.timestamp.toLocaleDateString()
                          : "Invalid Date"}
                      </div>
                      <button
                        onClick={() => handleDeleteMeal(mealItem.id)}
                        className="ml-4 text-red-500 hover:text-red-700 focus:outline-none"
                        title="Delete Meal"
                      >
                        🗑️
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Meal Plans */}
        <div className="mt-8">
          <div
            className={`${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              } p-6 rounded-lg shadow-md`}
          >
            <div className="flex items-center mb-4">
              <FaCalendarAlt className="text-2xl text-purple-500 mr-2" />
              <h2 className="text-2xl font-bold">Meal Plans</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mealPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                    } rounded-lg overflow-hidden shadow-md`}
                >
                  <img src={plan.image} alt={plan.title} className="w-full h-60 object-cover" />
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
                <div
                  className={`${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                    } p-6 rounded-lg max-w-2xl w-full`}
                >
                  <h3 className="text-2xl font-bold mb-4">{selectedPlan.title}</h3>
                  <img
                    src={selectedPlan.image}
                    alt={selectedPlan.title}
                    className="w-full h-64 object-cover rounded mb-4"
                  />
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
        </div>
      </div>
    </div>
  );
};

export default Nutrition;