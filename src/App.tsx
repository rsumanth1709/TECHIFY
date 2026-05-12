import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { HomePage } from "./components/HomePage";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [currentPage, setCurrentPage] = useState<
    "login" | "signup" | "home"
  >("login");

  return (
    <>
      {currentPage === "login" ? (
        <LoginPage
          onSwitchToSignup={() => setCurrentPage("signup")}
          onLoginSuccess={() => setCurrentPage("home")}
        />
      ) : currentPage === "signup" ? (
        <SignupPage
          onSwitchToLogin={() => setCurrentPage("login")}
          onSignupSuccess={() => setCurrentPage("home")}
        />
      ) : (
        <HomePage />
      )}
      <Toaster />
    </>
  );
}