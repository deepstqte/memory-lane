import "@fortawesome/fontawesome-free/css/all.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MemoryList from "./components/MemoryList";
import Profile from "./pages/Profile";
import MemoryPage from "./pages/MemoryPage";
import LoginRedirect from "./ExternalRedirects/Login";
import LogoutRedirect from "./ExternalRedirects/Logout";
import AuthButton from "./components/AuthButton";
import './App.css'

function App() {
  return (
    <Router>
      <div>
        <div className='mx-auto max-w-7xl sm:px-6 lg:px-8 mt-16'>
          <div className="is-flex is-justify-content-space-between is-align-items-center">
            <a href="/" className="logo">
              <div className="logo-text">
                <span className="logo-word memory">MEMORY</span>
                <span className="logo-word lane">LANE</span>
              </div>
            </a>
            <AuthButton />
          </div>
          <Routes>
            <Route path="/" element={<MemoryList />} />
            <Route path="/:userId" element={<Profile />} />
            <Route path="/:userId/:memoryId" element={<MemoryPage />} />
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/logout" element={<LogoutRedirect />} />
          </Routes>
        </div>
        <footer className="footer">
        </footer>
      </div>
    </Router>
  );
}

export default App
