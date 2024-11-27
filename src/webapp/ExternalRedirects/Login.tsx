import { useEffect } from "react";

function LoginRedirect() {
  useEffect(() => {
    // Redirect to external URL
    window.location.href = "https://hmz.ngrok.io/login";
  }, []);

  return null; // Render nothing as the user is being redirected
}

export default LoginRedirect;
