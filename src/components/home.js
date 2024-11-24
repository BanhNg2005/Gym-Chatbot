import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaFacebook,
  FaGithub,
  FaSignInAlt,
  FaSignOutAlt,
  FaCommentDots,
} from "react-icons/fa";
import { IoMdFitness, IoMdNutrition } from "react-icons/io";
import { FaBed } from "react-icons/fa";
import { GiAchievement } from "react-icons/gi";
import { FiSend, FiMenu, FiSun, FiMoon } from "react-icons/fi";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { database } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import videoBg from "./templates/homeBg.mp4";
import "../index.css";

const HomePage = () => {
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const auth = getAuth();
  const [user, setUser] = useState(null);

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

    return () => unsubscribeAuth();
  }, [auth]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatbotOpen) {
      scrollToBottom();
    }
  }, [isChatbotOpen, chatHistory]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        toast.success("Signed out successfully!");
      })
      .catch((error) => {
        toast.error("Error signing out: " + error.message);
      });
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
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
      />
      <header
        className={`py-4 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-md sticky top-0 left-0 w-full p-4 z-50`}
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
                <span className="text-lg font-semibold hidden md:block">{`Hi, ${user.displayName || user.email}`}</span>
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
              className={`p-2 rounded-full ${isDarkMode ? "bg-yellow-400" : "bg-gray-200"}`}
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
                <span className="mt-4 block text-lg font-semibold">{`Hi, ${user.displayName || user.email}`}</span>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="mt-4 flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors duration-300"
                  aria-label="Sign out"
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link to="/login">
                <button
                  className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors duration-300"
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
      <main className="container mx-auto mt-8 px-4">
        <section className="mb-12 relative overflow-hidden rounded-lg bg-gray-800 text-white py-20">
          <div className="absolute inset-0 overflow-hidden">
            <video autoPlay loop muted className="w-full h-full object-cover opacity-50">
              <source src={videoBg} autoPlay loop muted />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Transform Your Life with DREAMS Fitness
            </h1>
            <p className="text-2xl mb-8">
              Your journey to a healthier, stronger, and more confident you starts here.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/signup"
                className="bg-blue-600 text-white hover:bg-blue-700 text-lg font-semibold py-3 px-8 rounded-full transition duration-300"
              >
                Start Your Journey
              </Link>
              <a
                href="#featured-content"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-800 text-lg font-semibold py-3 px-8 rounded-full transition duration-300"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        <section className="mt-36 mb-12">
          <h2 className="text-3xl font-semibold mb-6 text-center">About Us</h2>
          <div
            className={`${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              } p-6 rounded-lg shadow-lg max-w-4xl mx-auto`}
          >
            <p className="text-lg leading-relaxed">
              Welcome to <strong>DREAMS Fitness</strong>! We are dedicated to helping you achieve your
              fitness goals through personalized workouts, nutritional advice, and ongoing support.
              Our mission is to empower you to live a healthier, happier life.
            </p>
          </div>
        </section>

        <section id="featured-content" className="mt-24 ">
          <h2 className="text-3xl font-semibold mb-6 text-center">Featured Content</h2>
          <div className="flex flex-wrap justify-center gap-8">
            <div
              className={`${isDarkMode ? "bg-gray-800" : "bg-white"
                } rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 w-64 h-auto`}
            >
              <img
                src={require("./templates/home.jpg")}
                alt="Workout"
                className="w-full h-40 object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">Effective Workouts</h3>
                <p
                  className={`${isDarkMode ? "text-gray-400" : "text-gray-600"
                    } mb-3`}
                >
                  Discover our curated workout plans for all fitness levels, designed to help you achieve
                  your goals efficiently.
                </p>
                <Link
                  to="/workout"
                  className="text-blue-400 font-semibold hover:text-blue-300 transition duration-200"
                >
                  Learn More →
                </Link>
              </div>
            </div>
            <div
              className={`${isDarkMode ? "bg-gray-800" : "bg-white"
                } rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 w-64 h-auto`}
            >
              <img
                src={require("./templates/nutrition.jpg")}
                alt="Nutrition"
                className="w-full h-40 object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">Balanced Nutrition</h3>
                <p
                  className={`${isDarkMode ? "text-gray-400" : "text-gray-600"
                    } mb-3`}
                >
                  Learn about proper nutrition to fuel your fitness journey and optimize your health and
                  performance.
                </p>
                <a
                  href="/nutrition"
                  className="text-blue-400 font-semibold hover:text-blue-300 transition duration-200"
                >
                  Learn More →
                </a>
              </div>
            </div>
            <div
              className={`${isDarkMode ? "bg-gray-800" : "bg-white"
                } rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 w-64 h-auto`}
            >
              <img
                src={require("./templates/sleep.jpg")}
                alt="Sleep"
                className="w-full h-40 object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">Quality Sleep</h3>
                <p
                  className={`${isDarkMode ? "text-gray-400" : "text-gray-600"
                    } mb-3`}
                >
                  Understand the importance of sleep in your fitness routine and learn techniques for better
                  rest and recovery.
                </p>
                <a
                  href="#"
                  className="text-blue-400 font-semibold hover:text-blue-300 transition duration-200"
                >
                  Learn More →
                </a>
              </div>
            </div>
            <div
              className={`${isDarkMode ? "bg-gray-800" : "bg-white"
                } rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 w-64 h-auto`}
            >
              <img
                src={require("./templates/achievement.jpg")}
                alt="Achievement"
                className="w-full h-40 object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">Remarkable Achievements</h3>
                <p
                  className={`${isDarkMode ? "text-gray-400" : "text-gray-600"
                    } mb-3`}
                >
                  Celebrate your fitness milestones and get inspired by others' success stories.
                </p>
                <a
                  href="#"
                  className="text-blue-400 font-semibold hover:text-blue-300 transition duration-200"
                >
                  Learn More →
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer
        className={`${isDarkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-900"
          } py-10 mt-48`}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-3xl font-bold mb-2">DREAMS Fitness</h3>
              <p
                className={`${isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
              >
                Dreams don't work unless you do
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-lg">Follow us:</span>
              <a
                href="https://www.instagram.com/banh_ng05/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition duration-300"
              >
                <FaInstagram size={28} />
              </a>
              <a
                href="https://www.facebook.com/bu.bu.944023/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition duration-300"
              >
                <FaFacebook size={28} />
              </a>
              <a
                href="https://github.com/BanhNg2005"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition duration-300"
              >
                <FaGithub size={28} />
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            <p>&copy; 2024 DREAMS Fitness. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none"
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
                    className={`prose prose-sm ${isDarkMode ? "prose-invert" : ""} inline-block p-2 rounded-lg ${isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"
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
                      className={`inline-block p-2 rounded-lg ${isDarkMode
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
            >
              <FiSend size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default HomePage;