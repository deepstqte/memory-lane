import React, { useEffect, useState } from "react";
import useCsrfToken from "../hooks/useCsrfToken";

const AuthButton: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string>("");
  const csrfToken = useCsrfToken();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/whoami`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
        });

        const data = await response.json();
        if ("userId" in data) {
          setIsAuthenticated(true);
          setUserId(data.userId);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, [csrfToken]);

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/login`;
  };

  const handleLogout = async () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/logout`;
  };

  if (isAuthenticated === null) {
    return <p>Checking authentication...</p>;
  }

  return (
    <div className="is-flex is-align-items-center">
      {isAuthenticated && (
        <a
          href={"/"+userId}
          className="button is-ghost"
          style={{
            marginRight: "1rem",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          My Profile
        </a>
      )}
      {isAuthenticated ? (
        <button className="button is-danger" onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <button className="button is-primary" onClick={handleLogin}>
          Login
        </button>
      )}
    </div>
  );
};

export default AuthButton;
