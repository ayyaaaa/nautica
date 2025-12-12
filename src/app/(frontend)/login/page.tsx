'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Anchor, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ModeToggle } from '@/components/mode-toggle'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 1. Call Payload's default Login API
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || ''}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await res.json()

      if (res.ok && data.user) {
        toast.success('Welcome back!', {
          description: 'Logging you in...',
        })

        // 2. Redirect based on Role
        // If Admin, go to Dashboard. If Operator, go to Portal.
        if (data.user.role === 'admin') {
          router.push('/dashboard/approvals')
        } else {
          router.push('/portal')
        }

        router.refresh() // Ensure auth state updates
      } else {
        toast.error('Login Failed', {
          description: 'Invalid email or password.',
        })
      }
    } catch (error) {
      toast.error('Network Error', {
        description: 'Could not connect to the server.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4 relative">
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="mb-8 flex flex-col items-center text-center">
        <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg">
          <Anchor className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Harbor Management System</h1>
        <p className="text-muted-foreground">Vessel Operator Portal</p>
      </div>

      <Card className="w-full max-w-sm shadow-xl border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-xl">Sign In</CardTitle>
          <CardDescription>Enter your email and password to access your fleet.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {/* Optional: Add Forgot Password link later */}
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t pt-6 bg-muted/20">
          <div className="text-sm text-center text-muted-foreground">
            {"Don't"} have an account?
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/register">
              Register New Vessel <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
