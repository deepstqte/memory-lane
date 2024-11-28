import { useEffect } from "react";

function LogoutRedirect() {
  useEffect(() => {
    // Redirect to external URL
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/logout`;
  }, []);

  return null; // Render nothing as the user is being redirected
}

export default LogoutRedirect;
