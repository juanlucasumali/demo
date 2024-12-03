import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import WelcomeScreen from "./auth/WelcomeScreen";
import SignUp from "./auth/SignUp";
import Login from "./auth/LogIn";
import MainInterface from "./MainInterface";

const MainApp: React.FC = () => {
  const [view, setView] = useState<"welcome" | "signup" | "login" | "main">(
    "welcome"
  );

  useEffect(() => {
    let isMounted = true;

    const getInitialSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        return;
      }

      if (session && isMounted) {
        setView("main");
      }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setView("main");
        } else {
          setView("welcome");
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = () => {
    setView("main");
  };

  const handleBack = () => {
    setView("welcome");
  };

  const renderView = () => {
    switch (view) {
      case "welcome":
        return (
          <WelcomeScreen
            onSelect={(option) => {
              if (option === "login") setView("login");
              if (option === "signup") setView("signup");
            }}
          />
        );
      case "signup":
        return <SignUp onSuccess={handleAuthSuccess} onBack={handleBack} />;
      case "login":
        return <Login onSuccess={handleAuthSuccess} onBack={handleBack} />;
      case "main":
        return <MainInterface />;
      default:
        return null;
    }
  };

  return <div className="app-container">{renderView()}</div>;
};

export default MainApp;