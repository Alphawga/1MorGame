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
import { useToast } from '@/hooks/use-toast'
import { trpc } from '@/app/_providers/trpc-provider'

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ResetFormValues = z.infer<typeof resetSchema>

export function PasswordResetForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  })

  const resetPassword = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'If an account exists with this email, you will receive password reset instructions.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  async function onSubmit(data: ResetFormValues) {
    setIsLoading(true)
    try {
      await resetPassword.mutateAsync(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Password Reset Email'}
          </Button>
        </form>
      </Form>
    </div>
  )
} 