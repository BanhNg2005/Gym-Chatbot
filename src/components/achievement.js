import React, { useState, useEffect, useRef } from "react";
import {
    FaDumbbell, FaCommentDots, FaBed, FaTrophy,
    FaSignInAlt, FaCheck, FaTimes, FaChevronLeft, FaChevronRight, FaSignOutAlt,
} from "react-icons/fa";
import { FiSun, FiMoon, FiMenu, FiSend } from "react-icons/fi";
import { IoMdFitness, IoMdNutrition } from "react-icons/io";
import { GiAchievement } from "react-icons/gi";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend,
} from "chart.js";
import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToastContainer, toast } from "react-toastify";
import { auth, database } from './firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
    collection, query, orderBy, onSnapshot, serverTimestamp, addDoc
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
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [chatMessage, setChatMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const messagesEndRef = useRef(null);
    const allMuscleGroups = ["Chest", "Back", "Legs", "Arms", "Shoulders", "Core"];
    const allExerciseVariations = ["Planks", "Squats", "Push-ups", "Lunges"];

    const achievements = [
        { name: "First Workout", icon: <FaDumbbell />, unlocked: workoutPlans.length >= 1 },
        { name: "Five Workouts", icon: <FaTrophy />, unlocked: workoutPlans.length >= 5 },
        { name: "First Variation Selected", icon: <FaDumbbell />, unlocked: exerciseVariations.length >= 1 },
        { name: "Ten Workouts", icon: <FaTrophy />, unlocked: workoutPlans.length >= 10 },
        {
            name: "All Muscle Groups",
            icon: <FaTrophy />,
            unlocked: allMuscleGroups.every(muscle =>
                workoutPlans.some(plan =>
                    plan.muscleGroups.some(mg => mg.label === muscle)
                )
            ),
        },
        {
            name: "Complete All Variations",
            icon: <FaTrophy />,
            unlocked: allExerciseVariations.every(variation =>
                exerciseVariations.some(ev => ev.variation === variation)
            ),
        },
    ];

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                fetchWorkoutPlans(currentUser.uid);
                fetchExerciseVariations(currentUser.uid);
            } else {
                setWorkoutPlans([]);
                setExerciseVariations([]);
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
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isChatbotOpen) {
            scrollToBottom();
        }
    }, [isChatbotOpen, chatHistory]);

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
            console.error("Error submitting chat:", error);
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
        if (currentBadgeIndex + 3 < achievements.length && !isTransitioning) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentBadgeIndex(currentBadgeIndex + 3);
                setIsTransitioning(false);
            }, 500);
        }
    };

    const previousBadges = () => {
        if (currentBadgeIndex - 3 >= 0 && !isTransitioning) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentBadgeIndex(currentBadgeIndex - 3);
                setIsTransitioning(false);
            }, 500);
        }
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

            <button
                onClick={toggleChatbot}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none"
                aria-label="Open chatbot"
            >
                <FaCommentDots size={24} />
            </button>
            {isChatbotOpen && (
                <div
                    className={`fixed bottom-20 right-1 border rounded-lg shadow-lg w-96 max-w-full z-50 ${isDarkMode
                            ? "bg-gray-800 text-white border-gray-700"
                            : "bg-white text-gray-900 border-gray-300"
                        }`}
                >
                    <div
                        className={`flex justify-between items-center p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"
                            }`}
                    >
                        <h3 className="text-lg font-semibold">AI Assistant</h3>
                        <button
                            onClick={toggleChatbot}
                            className={`focus:outline-none ${isDarkMode
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
                                className={`mb-4 ${chat.type === "user" ? "text-right" : "text-left"}`}
                            >
                                {chat.type === "bot" ? (
                                    <div
                                        className={`prose prose-sm ${isDarkMode ? "prose-invert" : ""} inline-block p-2 rounded-lg ${
                                            isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"
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
                        <div ref={messagesEndRef} />
                    </div>
                    <form
                        onSubmit={handleChatSubmit}
                        className={`flex p-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"
                            }`}
                    >
                        <input
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Ask me anything about fitness..."
                            className={`flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${isDarkMode
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

            <main className="container mx-auto mt-8 p-4">
                <section className="mb-12" aria-labelledby="achievements-title">
                    <h2 id="achievements-title" className="text-3xl font-bold mb-6 text-center">
                        Achievements
                    </h2>
                    <div className="flex items-center">
                        <button
                            onClick={previousBadges}
                            disabled={currentBadgeIndex === 0}
                            className={`p-2 transition-opacity duration-300 ${currentBadgeIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
                        >
                            <FaChevronLeft size={24} />
                        </button>
                        <div className={`flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mx-4 transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
                            {achievements
                                .slice(currentBadgeIndex, currentBadgeIndex + 3)
                                .map((achievement, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg shadow-md flex flex-col items-center transition-transform duration-300 transform hover:scale-105 ${achievement.unlocked ? "bg-green-500" : "bg-gray-300"
                                            } h-40 sm:h-48 md:h-56`}
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
                            className={`p-2 transition-opacity duration-300 ${currentBadgeIndex + 3 >= achievements.length ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
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
                                        <strong>Variation:</strong> {variation.exercise}
                                    </p>
                                    <p>
                                        <strong>Exercise:</strong> {variation.variation}
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