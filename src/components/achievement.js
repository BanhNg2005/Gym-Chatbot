import React, { useState, useEffect, useRef } from "react";
import {
    FaDumbbell, FaAppleAlt, FaBed, FaTrophy,
    FaSignInAlt, FaCheck, FaTimes, FaChevronLeft, FaChevronRight, FaSignOutAlt,
} from "react-icons/fa";
import { FiSun, FiMoon, FiMenu } from "react-icons/fi";
import { IoMdFitness, IoMdNutrition } from "react-icons/io";
import { GiAchievement } from "react-icons/gi";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend,
} from "chart.js";
import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { auth, database } from './firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
    collection, query, orderBy, onSnapshot
} from "firebase/firestore";

ChartJS.register(
    CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend
);

const AchievementComponent = () => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [workoutPlans, setWorkoutPlans] = useState([]);
    const [exerciseVariations, setExerciseVariations] = useState([]);
    const unsubscribeWorkoutPlansRef = useRef(null);
    const unsubscribeExerciseVariationsRef = useRef(null);
    const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

    const achievements = [
        { name: "First Workout", icon: <FaDumbbell />, unlocked: workoutPlans.length >= 1 },
        { name: "Five Workouts", icon: <FaTrophy />, unlocked: workoutPlans.length >= 5 },
        { name: "First Variation Selected", icon: <FaAppleAlt />, unlocked: exerciseVariations.length >= 1 },
        { name: "Ten Workouts", icon: <FaTrophy />, unlocked: workoutPlans.length >= 10 },
    ];

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                fetchWorkoutPlans(currentUser.uid);
                fetchExerciseVariations(currentUser.uid);
            } else {
                // Clear workout plans and exercise variations if user is signed out
                setWorkoutPlans([]);
                setExerciseVariations([]);

                // Unsubscribe from Firestore listeners
                if (unsubscribeWorkoutPlansRef.current) {
                    unsubscribeWorkoutPlansRef.current();
                    unsubscribeWorkoutPlansRef.current = null;
                }
                if (unsubscribeExerciseVariationsRef.current) {
                    unsubscribeExerciseVariationsRef.current();
                    unsubscribeExerciseVariationsRef.current = null;
                }
            }
        });

        return () => {
            if (unsubscribeAuth) unsubscribeAuth();
            if (unsubscribeWorkoutPlansRef.current) {
                unsubscribeWorkoutPlansRef.current();
                unsubscribeWorkoutPlansRef.current = null;
            }
            if (unsubscribeExerciseVariationsRef.current) {
                unsubscribeExerciseVariationsRef.current();
                unsubscribeExerciseVariationsRef.current = null;
            }
        };
    }, []);

    const handleSignOut = () => {
        signOut(auth)
            .then(() => {
                toast.success("Signed out successfully!");
            })
            .catch((error) => {
                toast.error("Error signing out: " + error.message);
            });
    };

    const fetchWorkoutPlans = (uid) => {
        const plansRef = collection(database, `users/${uid}/workoutPlans`);
        const q = query(plansRef, orderBy("timestamp", "asc"));

        unsubscribeWorkoutPlansRef.current = onSnapshot(
            q,
            (snapshot) => {
                const plans = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate() || new Date(),
                }));
                setWorkoutPlans(plans);
            },
            (error) => {
                toast.error("Error fetching workout plans: " + error.message);
            }
        );
    };

    const fetchExerciseVariations = (uid) => {
        const variationsRef = collection(database, `users/${uid}/exerciseVariations`);
        const q = query(variationsRef, orderBy("timestamp", "desc"));

        unsubscribeExerciseVariationsRef.current = onSnapshot(q, (snapshot) => {
            const variations = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date(),
            }));
            setExerciseVariations(variations);
        });
    };

    const workoutData = {
        labels: workoutPlans.map(plan => plan.timestamp.toLocaleDateString()),
        datasets: [
            {
                label: "Workouts",
                data: workoutPlans.map((plan, index) => index + 1),
                borderColor: isDarkMode ? "#10B981" : "#059669",
                backgroundColor: isDarkMode ? "rgba(16, 185, 129, 0.5)" : "rgba(5, 150, 105, 0.5)",
            },
        ],
    };

    const nextBadges = () => {
        setCurrentBadgeIndex((prevIndex) =>
            prevIndex + 3 < achievements.length ? prevIndex + 3 : prevIndex
        );
    };

    const previousBadges = () => {
        setCurrentBadgeIndex((prevIndex) => (prevIndex - 3 >= 0 ? prevIndex - 3 : 0));
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div
            className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
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
                theme={isDarkMode ? "dark" : "light"}
            />
            <header
                className={`py-4 ${isDarkMode ? "bg-gray-800" : "bg-white"
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
                                    className={`hover:text-blue-500 transition-colors duration-300 flex items-center ${isDarkMode ? "text-white" : "text-gray-900"
                                        }`}
                                >
                                    <IoMdFitness className="mr-2" /> Workout
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/nutrition"
                                    className={`hover:text-blue-500 transition-colors duration-300 flex items-center ${isDarkMode ? "text-white" : "text-gray-900"
                                        }`}
                                >
                                    <IoMdNutrition className="mr-2" /> Nutrition
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/sleep"
                                    className={`hover:text-blue-500 transition-colors duration-300 flex items-center ${isDarkMode ? "text-white" : "text-gray-900"
                                        }`}
                                >
                                    <FaBed className="mr-2" /> Sleep
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/achievement"
                                    className={`hover:text-blue-500 transition-colors duration-300 flex items-center ${isDarkMode ? "text-white" : "text-gray-900"
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
                                <span className="text-lg font-semibold hidden md:block">{`Hi, ${user.displayName || user.email
                                    }`}</span>
                                <button
                                    onClick={handleSignOut}
                                    className="hidden md:flex items-center space-x-2 bg-red-700 text-white px-4 py-2 rounded-full hover:bg-red-500 transition-colors duration-300"
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
                            className={`p-2 rounded-full ${isDarkMode ? "bg-yellow-400" : "bg-gray-200"
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
                                <span className="mt-4 block text-lg font-semibold">{`Hi, ${user.displayName || user.email
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

            <main className="container mx-auto mt-8 p-4">
                <section className="mb-12" aria-labelledby="achievements-title">
                    <h2 id="achievements-title" className="text-3xl font-bold mb-6">
                        Achievements
                    </h2>
                    <div className="flex items-center">
                        <button
                            onClick={previousBadges}
                            disabled={currentBadgeIndex === 0}
                            className="p-2"
                        >
                            <FaChevronLeft size={24} />
                        </button>
                        <div className="flex-grow grid grid-cols-3 gap-4 mx-4">
                            {achievements
                                .slice(currentBadgeIndex, currentBadgeIndex + 3)
                                .map((achievement, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg shadow-md flex flex-col items-center ${achievement.unlocked ? "bg-green-500" : "bg-gray-300"
                                            }`}
                                    >
                                        <div className="text-4xl mb-2">{achievement.icon}</div>
                                        <span className="text-lg font-semibold">
                                            {achievement.name}
                                        </span>
                                        {achievement.unlocked ? (
                                            <FaCheck className="text-white mt-2" />
                                        ) : (
                                            <FaTimes className="text-red-500 mt-2" />
                                        )}
                                    </div>
                                ))}
                        </div>
                        <button
                            onClick={nextBadges}
                            disabled={currentBadgeIndex + 3 >= achievements.length}
                            className="p-2"
                        >
                            <FaChevronRight size={24} />
                        </button>
                    </div>
                </section>

                {workoutPlans.length > 0 && (
                    <section className="mb-12" aria-labelledby="workout-plans-title">
                        <h2
                            id="workout-plans-title"
                            className="text-3xl font-bold mb-6"
                        >
                            Your Workout Plans
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {workoutPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`shadow-md rounded-lg p-4 ${isDarkMode
                                        ? "bg-gray-800 text-white"
                                        : "bg-white text-gray-900"
                                        }`}
                                >
                                    <h3 className="text-xl font-bold mb-2">
                                        {plan.workoutType}
                                    </h3>
                                    <p>
                                        <strong>Duration:</strong> {plan.duration} minutes
                                    </p>
                                    <p>
                                        <strong>Muscle Groups:</strong>{" "}
                                        {plan.muscleGroups.map((mg) => mg.label).join(", ")}
                                    </p>
                                    <p>
                                        <strong>Created At:</strong>{" "}
                                        {plan.timestamp.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {exerciseVariations.length > 0 && (
                    <section className="mb-12" aria-labelledby="exercise-variations-title">
                        <h2
                            id="exercise-variations-title"
                            className="text-3xl font-bold mb-6"
                        >
                            Your Exercise Variations
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {exerciseVariations.map((variation) => (
                                <div
                                    key={variation.id}
                                    className={`shadow-md rounded-lg p-4 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                                        }`}
                                >
                                    <p>
                                        <strong>Exercise:</strong> {variation.exercise}
                                    </p>
                                    <p>
                                        <strong>Variation:</strong> {variation.variation}
                                    </p>
                                    <p>
                                        <strong>Selected At:</strong> {variation.timestamp.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {workoutPlans.length > 0 && (
                    <section className="mb-12" aria-labelledby="progress-title">
                        <h2 id="progress-title" className="text-3xl font-bold mb-6">
                            Workout Progress
                        </h2>
                        <div
                            className={`p-4 rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"
                                }`}
                        >
                            <Line
                                data={workoutData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: "top" },
                                        title: {
                                            display: true,
                                            text: `Your Workouts Over Time`,
                                        },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            title: { display: true, text: "Number of Workouts" },
                                        },
                                        x: {
                                            title: { display: true, text: "Date" },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default AchievementComponent;