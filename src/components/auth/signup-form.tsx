
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
import OauthButtons from "./oauth-buttons";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { Separator } from "../ui/separator";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const formSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
  bestFriend: z.string().min(1, { message: "Answer is required." }),
  nickname: z.string().min(1, { message: "Answer is required." }),
  petName: z.string().min(1, { message: "Answer is required." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});


export default function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useUser();
  const profileAvatar = PlaceHolderImages.find(p => p.id === 'profile-avatar');


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      bestFriend: "",
      nickname: "",
      petName: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setUser({ 
        fullName: values.fullName, 
        email: values.email, 
        avatar: profileAvatar?.imageUrl || `https://picsum.photos/seed/${values.email}/128/128`,
        securityAnswers: {
            bestFriend: values.bestFriend,
            nickname: values.nickname,
            petName: values.petName
        }
    });
    toast({
      title: "Account Created!",
      description: "Redirecting to your new dashboard...",
    });
    router.push("/dashboard");
  }

  return (
    <Card className="w-full max-w-md border-0 md:border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>
          Start your journey to financial clarity with Spend Control.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[70vh] overflow-y-auto pr-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-6" />
            <div className="space-y-2">
                <p className="text-sm font-medium">Security Questions</p>
                <p className="text-xs text-muted-foreground">These will be used to recover your account if you forget your password.</p>
            </div>
             <FormField
              control={form.control}
              name="bestFriend"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your best friend's name?</FormLabel>
                  <FormControl>
                    <Input placeholder="Answer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your nickname?</FormLabel>
                  <FormControl>
                    <Input placeholder="Answer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="petName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your pet's name?</FormLabel>
                  <FormControl>
                    <Input placeholder="Answer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </Form>
        <OauthButtons />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
