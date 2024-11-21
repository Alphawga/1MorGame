'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Icons } from '@/components/icons'
import { useToast } from '@/hooks/use-toast'
import { trpc } from '@/app/_providers/trpc-provider'

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
})

type AuthFormValues = z.infer<typeof authSchema>

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
    },
  })

  const register = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: data.message,
      })
      utils.auth.invalidate()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  async function onSubmit(data: AuthFormValues) {
    setIsLoading(true)
    try {
      if (isRegister) {
        await register.mutateAsync({
          ...data,
          auth_provider: 'EMAIL',
        })
      } else {
        // Handle login
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {isRegister ? 'Create an account' : 'Welcome back'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isRegister
            ? 'Enter your details to create your account'
            : 'Enter your credentials to sign in'}
        </p>
      </div>

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {}}
          disabled={isLoading}
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {}}
          disabled={isLoading}
        >
          <Icons.facebook className="mr-2 h-4 w-4" />
          Continue with Facebook
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isRegister && (
              <>
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
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
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" disabled={isLoading} />
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
                    <Input {...field} type="password" disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isRegister ? 'Create account' : 'Sign in'}
            </Button>
          </form>
        </Form>
      </div>

      <div className="text-center text-sm">
        {isRegister ? (
          <>
            Already have an account?{' '}
            <Button
              variant="link"
              className="p-0"
              onClick={() => setIsRegister(false)}
            >
              Sign in
            </Button>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <Button
              variant="link"
              className="p-0"
              onClick={() => setIsRegister(true)}
            >
              Create one
            </Button>
          </>
        )}
      </div>
    </div>
  )
} 