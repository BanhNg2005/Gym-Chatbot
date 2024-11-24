import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpForm from "./components/signup";
import SignInPage from "./components/login";
import ResetPasswordForm from "./components/resetpass";
import Workout from "./components/workout";
import NutritionDashboard from "./components/nutrition";
import SleepTracker from "./components/sleep";
import HomePage from "./components/home";
import AchievementComponent from "./components/achievement";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/resetpass" element={<ResetPasswordForm />} />
        <Route path="/sleep" element={<SleepTracker />} />
        <Route path="/nutrition" element={<NutritionDashboard />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/achievement" element={<AchievementComponent />} />
      </Routes>
    </Router>
  );
};

export default App;