import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get("mode") as "login" | "signup" | "forgot") || "login";
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(initialMode);

  return (
    <div className="min-h-screen">
      <AuthForm mode={mode} onModeChange={setMode} />
    </div>
  );
};

export default Auth;