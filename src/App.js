// App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FaInstagram, FaFacebook, FaGithub, FaSignInAlt, FaMoon, FaSun } from "react-icons/fa";
import { IoMdFitness, IoMdNutrition } from "react-icons/io";
import { FaBed } from "react-icons/fa";
import { GiAchievement } from "react-icons/gi";
import { FiSend, FiMenu } from "react-icons/fi";
import SignUpForm from "./components/signup";
import SignInPage from "./components/login";
import videoBg from "./homeBg.mp4";
import './index.css';

const HomePage = () => {
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatMessage.trim() !== "") {
      setChatHistory([...chatHistory, { type: "user", message: chatMessage }]);
      setTimeout(() => {
        setChatHistory((prev) => [
          ...prev,
          { type: "bot", message: "Thank you for your message. How can I assist you with your fitness journey today?" },
        ]);
      }, 1000);
      setChatMessage("");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
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
          <a href="#" className="text-2xl font-bold">DREAMS</a>
          <div className="md:hidden">
            <button onClick={toggleMenu} className={`${isDarkMode ? 'text-white' : 'text-gray-900'} focus:outline-none`}>
              <FiMenu size={24} />
            </button>
          </div>
          <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:flex md:items-center absolute md:relative top-16 left-0 right-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} md:bg-transparent z-20 md:top-0`}>
            <ul className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 p-4 md:p-0">
              <li><a href="#" className={`hover:text-blue-400 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><IoMdFitness className="mr-1" /> Workout</a></li>
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

      <main className="container mx-auto mt-8 px-4">
        <section className="mb-12 relative overflow-hidden rounded-lg bg-gray-800 text-white py-20">
          <div className="absolute inset-0 overflow-hidden">
            <video autoPlay loop muted className="w-full h-full object-cover opacity-50">
              <source src={videoBg} autoPlay loop muted/>
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold mb-6 leading-tight">Transform Your Life with DREAMS Fitness</h1>
            <p className="text-2xl mb-8">Your journey to a healthier, stronger, and more confident you starts here.</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a href="#"
                 className="bg-blue-600 text-white hover:bg-blue-700 text-lg font-semibold py-3 px-8 rounded-full transition duration-300">Start
                Your Journey</a>
              <a href="#"
                 className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-800 text-lg font-semibold py-3 px-8 rounded-full transition duration-300">Learn
                More</a>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6 text-center">Chatbot Assistant</h2>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg max-w-2xl mx-auto`}>
            <div className={`h-80 overflow-y-auto mb-4 p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
              {chatHistory.map((chat, index) => (
                <div key={index} className={`mb-4 ${chat.type === "user" ? "text-right" : "text-left"}`}>
                  <span
                    className={`inline-block p-3 rounded-lg ${chat.type === "user" ? "bg-blue-600 text-white" : isDarkMode ? "bg-gray-600 text-white" : "bg-gray-300 text-gray-900"}`}>
                    {chat.message}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="flex">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask me anything about fitness..."
                className={`flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
              />
              <button type="submit"
                      className="bg-blue-600 text-white p-3 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300">
                <FiSend size={24}/>
              </button>
            </form>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6 text-center">Featured Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300`}>
              <img
                  src={require('./home.jpg')}
                  alt="Workout" className="w-full h-56 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-3">Effective Workouts</h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Discover our curated workout
                  plans for all fitness levels, designed to help you achieve your goals efficiently.</p>
                <a href="#" className="text-blue-400 font-semibold hover:text-blue-300 transition duration-200">Learn
                  More →</a>
              </div>
            </div>
            <div
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300`}>
              <img
                  src={require('./nutrition.jpg')}
                  alt="Nutrition" className="w-full h-60 object-cover"/>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-3">Balanced Nutrition</h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Learn about proper nutrition to
                  fuel your fitness journey and optimize your health and performance.</p>
                <a href="#" className="text-blue-400 font-semibold hover:text-blue-300 transition duration-300">Learn
                  More →</a>
              </div>
            </div>
            <div
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300`}>
              <img
                  src={require('./sleep.jpg')}
                  alt="Sleep" className="w-full h-56 object-cover"/>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-3">Quality Sleep</h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Understand the importance of
                  sleep in your fitness routine and learn techniques for better rest and recovery.</p>
                <a href="#" className="text-blue-400 font-semibold hover:text-blue-300 transition duration-200">Learn
                  More →</a>
              </div>
            </div>
            <div
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300`}>
              <img
                  src={require('./achievement.jpg')}
                  alt="Achievement" className="w-full h-56 object-cover"/>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-3">Remarkable Achievements</h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Celebrate your fitness milestones and get inspired by others' success stories.</p>
                <a href="#" className="text-blue-400 font-semibold hover:text-blue-300 transition duration-200">Learn
                  More →</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'} py-12`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-3xl font-bold mb-2">DREAMS Fitness</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dreams don't work unless you do</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-lg">Follow us:</span>
              <a href="https://www.instagram.com/banh_ng05/?hl=en" target="_blank" rel="noopener noreferrer"
                 className="text-blue-400 hover:text-blue-300 transition duration-300">
                <FaInstagram size={28} />
              </a>
              <a href="https://www.facebook.com/nguyen.banh.9" target="_blank" rel="noopener noreferrer"
                 className="text-blue-400 hover:text-blue-300 transition duration-300">
                <FaFacebook size={28} />
              </a>
              <a href="https://github.com/BanhNg2005" target="_blank" rel="noopener noreferrer"
                 className="text-blue-400 hover:text-blue-300 transition duration-300">
                <FaGithub size={28} />
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            <p>&copy; 2024 DREAMS Fitness. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/sleep" element={<h1>Sleep</h1>} />
        <Route path="/nutrition" element={<h1>Nutrition</h1>} />
        <Route path="/workout" element={<h1>Workout</h1>} />
        <Route path="/achievement" element={<h1>Achievement</h1>} />
      </Routes>
    </Router>
  );
};

export default App;