"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <SignUp 
        redirectUrl={redirectUrl || "/dashboard"} 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg rounded-lg border border-gray-200",
          }
        }}
      />
    </div>
  );
} 