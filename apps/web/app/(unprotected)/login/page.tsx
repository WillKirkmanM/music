"use client"

import getBaseURL from "@/lib/Server/getBaseURL";

import { useState } from 'react';
import { setCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@music/ui/components/form";
import { Button } from '@music/ui/components/button';
import { Input } from '@music/ui/components/input';

const schema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { handleSubmit } = form;

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const response = await fetch(`${getBaseURL()}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.status && result.token) {
        setCookie('music_jwt', result.token);
        router.push("/");
      } else {
        setErrorMessage(result.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred during login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <h1 className="text-2xl font-bold text-center text-white pb-10">Sign In</h1>
      {errorMessage && (
        <div className="text-center text-red-600">
          {errorMessage}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-white w-80">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-white">Username</FormLabel>
                <FormControl>
                  <Input
                    className="block w-full px-3 py-2 mt-1 border border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white bg-gray-800"
                    placeholder="Enter your username"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600">{form.formState.errors.username?.message?.toString()}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-white">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className="block w-full px-3 py-2 mt-1 border border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white bg-gray-800"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600">{form.formState.errors.password?.message?.toString()}</FormMessage>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full px-4 py-2 mt-6 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </Button>
        </form>
      </Form>
    </div>
  );
}