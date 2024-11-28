import React, { useEffect, useState } from "react";
import useCsrfToken from "./hooks/useCsrfToken";

const AuthButton: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
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
    try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        setIsAuthenticated(false);
      } else {
        console.error("Failed to log out:", response.statusText);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (isAuthenticated === null) {
    return <p>Checking authentication...</p>;
  }

  return (
    <div>
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
