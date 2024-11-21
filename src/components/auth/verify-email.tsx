'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { trpc } from '@/app/_providers/trpc-provider'
import { useToast } from '@/hooks/use-toast'

export function VerifyEmail() {
  const [isVerifying, setIsVerifying] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { toast } = useToast()

  const verifyEmail = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Your email has been verified. You can now sign in.',
      })
      setTimeout(() => router.push('/login'), 2000)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  useEffect(() => {
    if (token) {
      verifyEmail.mutate({ token })
    }
  }, [token])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verifying your email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVerifying ? (
          <div className="flex items-center justify-center">
            <Icons.spinner className="h-6 w-6 animate-spin" />
          </div>
        ) : verifyEmail.isSuccess ? (
          <div className="text-center">
            <p className="mb-4">Your email has been verified!</p>
            <Button onClick={() => router.push('/login')}>
              Continue to login
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-red-500 mb-4">Verification failed</p>
            <Button onClick={() => router.push('/register')}>
              Try again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 