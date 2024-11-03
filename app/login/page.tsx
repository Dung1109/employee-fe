"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Lock, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  account: z.string().min(1, "Username is required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState<{
    success: boolean;
    message: string;
  }>({ success: false, message: "" });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      account: "",
      password: "",
    },
  });

  const router = useRouter();
  const { toast } = useToast();

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setFormState({ success: false, message: "" });

    try {
      // Simulate API call
      await axios
        .post("http://localhost:8080/api/v1/employee/login", data, {
          headers: { "Content-Type": "application/json" },
        })
        .then(
          (response) => {
            if (response.status === 200) {
              setFormState({ success: true, message: "Login successful" });
              router.push("/");
            }
            console.log(response);
            toast({
              title: "Login successful",
              description: "You have successfully logged in.",
            });
          },
          (error) => {
            setFormState({ success: false, message: "Login failed" });
            toast({
              title: "Login failed",
              description: "Please try again.",
              variant: "destructive",
            });
            console.error("Run", error);
          },
        );
    } catch (error) {
      console.error(error);
      setFormState({
        success: false,
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Member Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Username"
                          className="pl-8"
                          {...field}
                        />
                      </div>
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
                      <div className="relative">
                        <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Password"
                          className="pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {formState.message && (
                <p
                  className={`text-sm ${formState.success ? "text-green-500" : "text-red-500"}`}
                >
                  {formState.message}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-emerald-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/register" className="text-sm">
            <Button variant="link" className="text-sm">
              Forgot Password?
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
