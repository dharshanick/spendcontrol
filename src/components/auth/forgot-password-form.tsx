
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import type { User } from "@/lib/types";

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

const questionsSchema = z.object({
  bestFriend: z.string().min(1, { message: "Answer is required." }),
  nickname: z.string().min(1, { message: "Answer is required." }),
  petName: z.string().min(1, { message: "Answer is required." }),
});

const passwordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type Step = "email" | "questions" | "password" | "success";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [userForRecovery, setUserForRecovery] = useState<User | null>(null);
  const { getUserByEmail } = useUser();

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const questionsForm = useForm<z.infer<typeof questionsSchema>>({
    resolver: zodResolver(questionsSchema),
    defaultValues: { bestFriend: "", nickname: "", petName: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleEmailSubmit = (values: z.infer<typeof emailSchema>) => {
    setLoading(true);
    const user = getUserByEmail(values.email);
    if (user) {
      setUserForRecovery(user);
      setStep("questions");
    } else {
      toast({
        variant: "destructive",
        title: "User not found",
        description: "No account found with that email address.",
      });
    }
    setLoading(false);
  };

  const handleQuestionsSubmit = (values: z.infer<typeof questionsSchema>) => {
    setLoading(true);
    const answers = userForRecovery?.securityAnswers;
    if (
      answers &&
      answers.bestFriend.toLowerCase() === values.bestFriend.toLowerCase() &&
      answers.nickname.toLowerCase() === values.nickname.toLowerCase() &&
      answers.petName.toLowerCase() === values.petName.toLowerCase()
    ) {
      setStep("password");
    } else {
      toast({
        variant: "destructive",
        title: "Incorrect Answers",
        description: "One or more security answers are incorrect. Please try again.",
      });
    }
    setLoading(false);
  };

  const handlePasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
    setLoading(true);
    // In a real app, you'd call an API to update the password.
    console.log("New password set for", userForRecovery?.email);
    toast({
      title: "Password Reset Successful",
      description: "You can now log in with your new password.",
    });
    setStep("success");
    setTimeout(() => router.push("/login"), 2000);
    setLoading(false);
  };
  
  const renderStep = () => {
    switch (step) {
      case "email":
        return (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
            </form>
          </Form>
        );
      case "questions":
        return (
          <Form {...questionsForm}>
            <form onSubmit={questionsForm.handleSubmit(handleQuestionsSubmit)} className="space-y-4">
                <FormField
                    control={questionsForm.control}
                    name="bestFriend"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>What is your best friend's name?</FormLabel>
                        <FormControl>
                            <Input placeholder="Answer" {...field} disabled={loading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={questionsForm.control}
                    name="nickname"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>What is your nickname?</FormLabel>
                        <FormControl>
                            <Input placeholder="Answer" {...field} disabled={loading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={questionsForm.control}
                    name="petName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>What is your pet's name?</FormLabel>
                        <FormControl>
                            <Input placeholder="Answer" {...field} disabled={loading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Answers
              </Button>
            </form>
          </Form>
        );
    case "password":
        return (
           <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </form>
          </Form>
        );
      case "success":
        return (
            <div className="text-center">
                <h3 className="text-xl font-semibold text-primary">Success!</h3>
                <p className="text-muted-foreground mt-2">Your password has been reset. Redirecting you to the login page...</p>
            </div>
        )
      default:
        return null;
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          {step === 'email' && "Enter your email to get started."}
          {step === 'questions' && "Answer your security questions to proceed."}
          {step === 'password' && "Enter a new password for your account."}
          {step === 'success' && "Redirecting..."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
            {renderStep()}
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
