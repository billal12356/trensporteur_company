"use client"

import { resetPassword } from "@/redux/slice/authSlice"
import type { AppDispatch } from "@/redux/store"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { useState } from "react"
import { ArrowLeft, Mail, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Link, useNavigate } from "react-router-dom"

type FormData = { email: string }

export default function ResetPasswordForm() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useNavigate()
  const [error, setError] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    getValues,
  } = useForm<FormData>({
    mode: "onChange",
  })

  const onSubmit = async (data: FormData) => {
    setError("")
    try {
      const resultAction = await dispatch(resetPassword(data.email))
      if (resetPassword.fulfilled.match(resultAction)) {
        router(`/verify-code/${data.email}`)
      } else {
        setError("Failed to send verification code. Please check your email and try again.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    }
  }

  const email = getValues("email")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Forgot your password?</CardTitle>
              <CardDescription className="text-base">
                No worries! Enter your email address and we'll send you a verification code to reset your password.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="pl-10 h-11 w-[100%] "
                    disabled={isSubmitting}
                    {...register("email", {
                      required: "Email address is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={!email || email.trim() === "" || !isValid || isSubmitting}
                className="w-full h-11 text-base font-medium"
                size="lg"
              >
                {isSubmitting ? "Sending code..." : "Send verification code"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
