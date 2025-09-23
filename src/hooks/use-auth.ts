import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signInSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100),
});

const signUpSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100),
  firstName: z
    .string()
    .min(2, "First Name must be at least 2 characters long")
    .max(100),
  lastName: z
    .string()
    .min(2, "Last Name must be at least 2 characters long")
    .max(100),
});

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

export const useAuth = () => {
  const { signIn, signOut } = useAuthActions();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const handleSignIn = async (data: SignInData) => {
    setIsLoading(true);
    try {
      await signIn("password", {
        email: data.email,
        password: data.password,
        flow: "signIn",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Sign In Error:", error);
      signInForm.setError("password", {
        message: "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpData) => {
    setIsLoading(true);
    try {
      await signIn("password", {
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
        flow: "signUp",
      });
      router.push("/");
    } catch (error) {
      console.error("Sign Up Error:", error);
      signUpForm.setError("root", {
        message: "Failed to create account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };

  return {
    signInForm,
    signUpForm,
    handleSignIn,
    handleSignUp,
    handleSignOut,
    isLoading,
  };
};
