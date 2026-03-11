"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Chrome } from "lucide-react";
import { useAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  if (isUserLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm border-0 shadow-2xl shadow-slate-300 dark:shadow-slate-900">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-gradient-to-r from-primary to-accent p-3">
              <Rocket className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            ITG Connect
          </CardTitle>
          <CardDescription>
            Welcome back! Please sign in to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={handleSignIn} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity">
              <Chrome className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>
            <p className="px-8 text-center text-xs text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
