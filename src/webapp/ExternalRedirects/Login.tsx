import { useEffect } from "react";

function LoginRedirect() {
  useEffect(() => {
    // Redirect to external URL
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/login`;
  }, []);

  return null; // Render nothing as the user is being redirected
}

export default LoginRedirect;
