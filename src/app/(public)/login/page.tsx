// app/login/page.tsx
import { Suspense } from "react";
import LoginFormContent from "./LoginFormContent";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading login form...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}