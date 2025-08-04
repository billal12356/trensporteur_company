"use client"

import { useForm, Controller } from "react-hook-form"
import { useDispatch } from "react-redux"
import { resetPassword, verifyCode } from "@/redux/slice/authSlice"
import type { AppDispatch } from "@/redux/store"
import { useState } from "react"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Link, useNavigate, useParams } from "react-router-dom"

type FormValues = { pin: string }

export default function VerifyCodeForm() {
  const dispatch = useDispatch<AppDispatch>()
  const params = useParams()
  const email = params?.email as string
  const router = useNavigate()
  const [error, setError] = useState<string>("")
  const [isResending, setIsResending] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { pin: "" },
  })

  const onSubmit = async ({ pin }: FormValues) => {
    if (!email) return

    setError("")
    try {
      const result = await dispatch(verifyCode({ email, code: Number(pin) }))
      if (verifyCode.fulfilled.match(result)) {
        router(`/change-password/${email}`)
      } else {
        setError("Invalid verification code. Please try again.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    }
  }

  const handleResend = async () => {
    if (!email) return

    setIsResending(true)
    setError("")
    try {
      await dispatch(resetPassword(email))
      setError("") // Clear any previous errors on successful resend
    } catch (err) {
      setError("Failed to resend code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Link
          to="/reset-password"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to reset password
        </Link>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Enter verification code</CardTitle>
              <CardDescription className="text-base">
                We sent a 6-digit code to
                <br />
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <Controller
                  name="pin"
                  control={control}
                  rules={{
                    required: "Verification code is required",
                    pattern: {
                      value: /^\d{6}$/,
                      message: "Please enter all 6 digits",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <InputOTP maxLength={6} {...field} className="mx-auto" disabled={isSubmitting}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                          <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                          <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                          <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                          <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                        </InputOTPGroup>
                      </InputOTP>
                      {fieldState.error && (
                        <p className="text-sm text-destructive text-center">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResend}
                    disabled={isResending}
                    className="h-auto p-0 text-primary hover:text-primary/80"
                  >
                    {isResending ? "Sending..." : "Resend code"}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full h-11 text-base font-medium"
                size="lg"
              >
                {isSubmitting ? "Verifying..." : "Verify code"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
