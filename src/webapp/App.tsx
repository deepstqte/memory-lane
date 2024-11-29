import "@fortawesome/fontawesome-free/css/all.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MemoryList from "./MemoryList";
import Profile from "./Profile";
import MemoryPage from "./MemoryPage";
import LoginRedirect from "./ExternalRedirects/Login";
import LogoutRedirect from "./ExternalRedirects/Logout";
import AuthButton from "./AuthButton";
import './App.css'

function App() {
  return (
    <Router>
      <div>
        <div className='mx-auto max-w-7xl sm:px-6 lg:px-8 mt-32'>
          <AuthButton />
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
