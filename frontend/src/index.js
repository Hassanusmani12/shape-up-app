import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import CinemaLayout from "./components/CinemaLayout";
import "bootstrap/dist/css/bootstrap.min.css";
import './index.css';
import './styles/4d-effects.css';

import { ThemeProvider } from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Workouts from "./pages/Workouts";
import NutritionChecker from "./pages/NutritionChecker";
import NutritionAIAnalyzer from "./pages/NutritionAIAnalyzer";
import BMRCalculator from "./pages/BMRCalculator";

import Features from "./pages/Features";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import NotificationsPage from "./pages/NotificationsPage";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import CookiePolicy from "./pages/CookiePolicy";

// Lazy load AI Hub for code splitting
const AIHub = lazy(() => import("./pages/AIHub"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<CinemaLayout />}>
      <Route index element={<Home />} />
      <Route path="/pages/features" element={<Features />} />
      <Route path="/pages/about" element={<About />} />
      <Route path="/pages/privacy" element={<Privacy />} />
      <Route path="/pages/terms" element={<Terms />} />
      <Route path="/pages/cookies" element={<CookiePolicy />} />
      <Route path="/pages/workouts" element={<Workouts />} />
      <Route path="/pages/nutrition-checker" element={<NutritionChecker />} />
      <Route path="/pages/bmr-calculator" element={<BMRCalculator />} />

      <Route element={<PublicRoute />}>
        <Route path="/pages/login" element={<Login />} />
        <Route path="/pages/register" element={<Register />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="/pages/profile/*" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/pages/settings" element={<Settings />} />
        <Route path="/ai-hub" element={<AIHub />} />
        <Route path="/nutrition-ai" element={<NutritionAIAnalyzer />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <Provider store={store}>
          <RouterProvider router={router} />
        </Provider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
