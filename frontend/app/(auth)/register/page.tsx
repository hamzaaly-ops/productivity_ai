'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import type { TokenResponse } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const registerSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(64),
    email: z.string().email('Invalid email').min(5).max(256),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    confirmPassword: z.string(),
    fullName: z.string().max(128).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setError(null);
    try {
      await apiClient.post('/auth/register', {
        username: values.username,
        email: values.email,
        password: values.password,
        full_name: values.fullName || null,
      });
      const res = await apiClient.post<TokenResponse>('/auth/login', {
        username: values.username,
        password: values.password,
      });
      apiClient.setAuthToken(res.access_token);
      router.push('/overview');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold text-slate-50">Create an account</CardTitle>
        <CardDescription className="text-slate-400">
          Enter your details to get started
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-slate-700 bg-slate-900 text-slate-100"
                      placeholder="johndoe"
                      autoComplete="username"
                    />
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
                  <FormLabel className="text-slate-200">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      className="border-slate-700 bg-slate-900 text-slate-100"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Full name (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-slate-700 bg-slate-900 text-slate-100"
                      placeholder="John Doe"
                      autoComplete="name"
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
                  <FormLabel className="text-slate-200">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      className="border-slate-700 bg-slate-900 text-slate-100"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
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
                  <FormLabel className="text-slate-200">Confirm password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      className="border-slate-700 bg-slate-900 text-slate-100"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
            <p className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-cyan-400 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
