import React, { useEffect, useState } from "react";

const AuthButton: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch("https://hmz.ngrok.io/whoami", {
          method: "GET",
          credentials: "include", // Include cookies in the request
        });

        if (response.ok) {
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
  }, []);

  const handleLogin = () => {
    window.location.href = "https://hmz.ngrok.io/login";
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("https://hmz.ngrok.io/logout", {
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
