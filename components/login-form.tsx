"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLogin } from "@/hooks/useLogin";
import { IconLoader2 } from "@tabler/icons-react";

const loginSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(4, {
    message: "Password must be at least 4 characters.",
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const loginMutation = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col items-center gap-2 text-center w-full mb-6">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter your username below to login to your account
            </p>
          </div>
          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="sylus abel"
                      className="border-foreground/30 border-[1px] placeholder:text-foreground/50"
                      {...field}
                    />
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
                  <div className="flex items-center">
                    <FormLabel>Password</FormLabel>
                    <a
                      href="/forgot-password"
                      className="ml-auto text-xs underline-offset-4 hover:underline text-gray-600"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      className="border-foreground/30 border-[1px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-foreground text-background hover:bg-foreground/80 disabled:cursor-not-allowed"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>
          <div className="text-center text-sm mt-6">
            Don&apos;t have an account?{" "}
            <a href="/register" className="underline underline-offset-4">
              Sign up
            </a>
          </div>
        </form>
      </Form>
    </div>
  );
}
