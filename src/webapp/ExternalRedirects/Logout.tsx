import { useEffect } from "react";

function LogoutRedirect() {
  useEffect(() => {
    // Redirect to external URL
    window.location.href = "https://hmz.ngrok.io/logout";
  }, []);

  return null; // Render nothing as the user is being redirected
}

export default LogoutRedirect;
