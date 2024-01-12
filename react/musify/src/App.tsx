import "./App.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import WelcomePage from "./pages/WelcomePage.tsx";
import PopupProvider from "./components/context/Popup.tsx";
import ProtectedRoute from "./components/wrappers/ProtectedRoute.tsx";

function App() {
  return (
    <Router>
      <PopupProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route
            path="/my-music"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PopupProvider>
    </Router>
  );
}

export default App;
