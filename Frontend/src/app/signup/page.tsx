'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/components/providers/auth-provider';
import { ROUTES } from '@/config/config';
import { VALIDATION } from '@/config/config';

const formSchema = z
  .object({
    first_name: z.string().min(
      VALIDATION.NAME.MIN_LENGTH,
      VALIDATION.NAME.MESSAGE
    ),
    last_name: z.string().min(
      VALIDATION.NAME.MIN_LENGTH,
      VALIDATION.NAME.MESSAGE
    ),
    username: z.string().min(
      3,
      'Username must be at least 3 characters'
    ).max(
      30,
      'Username must be less than 30 characters'
    ).regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    ),
    email: z.string().email(VALIDATION.EMAIL.MESSAGE),
    phone_no: z.string().optional(),
    gender: z.string().optional(),
    password: z.string().min(
      VALIDATION.PASSWORD.MIN_LENGTH,
      VALIDATION.PASSWORD.MESSAGE
    ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// University interface to match the API response
interface University {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string | null;
}

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { signup, isLoading, error } = useAuthContext();
  const [serverError, setServerError] = useState<string | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(false);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      phone_no: '',
      gender: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Fetch universities from the API when component mounts
  useEffect(() => {
    const fetchUniversities = async () => {
      setIsLoadingUniversities(true);
      try {
        const response = await fetch('http://localhost:8000/universities');
        if (!response.ok) {
          throw new Error('Failed to fetch universities');
        }
        const data = await response.json();
        setUniversities(data);
      } catch (error) {
        console.error('Error fetching universities:', error);
        toast({
          title: 'Error',
          description: 'Failed to load universities. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingUniversities(false);
      }
    };

    fetchUniversities();
  }, [toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setServerError(null);
    
    // Validate that a university has been selected
    if (!selectedUniversityId) {
      setServerError('Please select a university');
      return;
    }
    
    try {
      // Add university_id to the signup data
      const signupData = {
        ...values,
        university_id: selectedUniversityId
      };
      
      const response = await signup(signupData);
      
      if (!response.success) {
        setServerError(response.error?.message || 'Failed to create account');
        return;
      }
      
      toast({
        title: 'Account created!',
        description: 'Your account has been created successfully.',
      });
      
      // Auth hook will handle redirect to dashboard
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setServerError(errorMessage);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="text-muted-foreground">
            Enter your information to create an account
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        type="text"
                        autoComplete="given-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        type="text"
                        autoComplete="family-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="johndoe"
                        type="text"
                        autoComplete="username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field: { onChange, value, ...fieldProps } }) => {
                  // Split the email into username and domain parts
                  const [username = "", domain = ""] = value.split("@");
                  
                  // Handle changes to the username part
                  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const newUsername = e.target.value;
                    onChange(`${newUsername}@${domain}`);
                  };
                  
                  // Handle changes to the domain part
                  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                    const newDomain = e.target.value;
                    onChange(`${username}@${newDomain}`);
                    
                    // Find the university ID that corresponds to the selected domain
                    if (newDomain) {
                      const selectedUniversity = universities.find(university => {
                        const emailParts = university.email.split('@');
                        const universityDomain = emailParts.length > 1 ? emailParts[1] : '';
                        return universityDomain === newDomain;
                      });
                      
                      if (selectedUniversity) {
                        setSelectedUniversityId(selectedUniversity.id);
                      } else {
                        setSelectedUniversityId('');
                      }
                    } else {
                      setSelectedUniversityId('');
                    }
                  };
                  
                  return (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <div className="flex items-center space-x-1">
                        <FormControl>
                          <Input
                            placeholder="username"
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            value={username}
                            onChange={handleUsernameChange}
                            className="rounded-r-none"
                            {...fieldProps}
                          />
                        </FormControl>
                        <span className="px-2 py-2 border border-input bg-muted">@</span>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-l-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={domain}
                            onChange={handleDomainChange}
                            disabled={isLoadingUniversities}
                          >
                            <option value="">Select university</option>
                            {isLoadingUniversities ? (
                              <option value="" disabled>Loading universities...</option>
                            ) : (
                              universities.map((university) => {
                                // Extract domain from university email (after @)
                                const emailParts = university.email.split('@');
                                const universityDomain = emailParts.length > 1 ? emailParts[1] : '';
                                
                                return (
                                  <option key={university.id} value={universityDomain}>
                                    {universityDomain}
                                  </option>
                                );
                              })
                            )}
                          </select>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        autoComplete="new-password"
                        {...field}
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
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1234567890"
                        type="tel"
                        autoComplete="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender (Optional)</FormLabel>
                    <FormControl>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <Button type="submit" className="w-full">
                Create Account
              </Button>
              <p className="px-8 text-center text-sm text-muted-foreground">
                By clicking continue, you agree to our{' '}
                <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" type="button">
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="github"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
          <Button variant="outline" type="button">
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="github"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </Button>
        </div>

        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{' '}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
