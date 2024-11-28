import { useState, useEffect } from "react";

const useCsrfToken = () => {
  const [csrfToken, setCsrfToken] = useState<string>("");

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/csrf-token`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch CSRF token");
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };

    fetchCsrfToken();
  }, []);

  return csrfToken;
};

export default useCsrfToken;
