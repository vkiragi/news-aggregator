import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground mt-2">
            Sign up to start your personalized news experience
          </p>
        </div>
        
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "shadow-none w-full",
            }
          }}
          signInUrl="/sign-in/"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
} 