import { useState } from "react";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";

/**
 * AuthPage component manages the display of SignIn and SignUp forms.
 * Toggles between sign-in and sign-up views based on isSigningIn state.
 */
export default function AuthPage() {
  // State to track whether the user is on the Sign In or Sign Up form
  const [isSigningIn, setIsSigningIn] = useState(true);

  return (
    <div className="auth-container">
      {/* Conditionally render SignIn or SignUp based on isSigningIn */}
      {isSigningIn ? (
        <SignIn onSwitch={() => setIsSigningIn(false)} />
      ) : (
        <SignUp onSwitch={() => setIsSigningIn(true)} />
      )}
    </div>
  );
}
