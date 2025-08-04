"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { Eye, EyeOff, Lock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { changePassword } from "@/redux/slice/authSlice"
import type { AppDispatch } from "@/redux/store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

import { Progress } from "@/components/ui/progress"

interface PasswordFormData {
  password: string
  confirmPassword: string
}

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (pwd) => pwd.length >= 8 },
  { label: "Contains uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "Contains lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
  { label: "Contains number", test: (pwd) => /\d/.test(pwd) },
  { label: "Contains special character", test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
]

export default function ChangePasswordForm() {
  const dispatch = useDispatch<AppDispatch>()
  const { email } = useParams<{ email: string }>()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<PasswordFormData>({
    mode: "onChange",
  })

  const password = watch("password", "")
  const confirmPassword = watch("confirmPassword", "")

  // Calculate password strength
  const getPasswordStrength = (pwd: string): number => {
    const metRequirements = passwordRequirements.filter((req) => req.test(pwd)).length
    return (metRequirements / passwordRequirements.length) * 100
  }

  const getStrengthColor = (strength: number): string => {
    if (strength < 40) return "bg-red-500"
    if (strength < 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = (strength: number): string => {
    if (strength < 40) return "Weak"
    if (strength < 70) return "Medium"
    return "Strong"
  }

  const onSubmit = async (data: PasswordFormData) => {
    if (!email) {
      setError("Email parameter is missing")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await dispatch(
        changePassword({
          email,
          password: data.password,
          ConfirmePassword: data.confirmPassword,
        }),
      )

      if (changePassword.fulfilled.match(result)) {
        setSuccess(true)
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      } else {
        setError((result.payload as string) || "Failed to change password")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength(password)

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Password Changed Successfully!</h2>
              <p className="text-sm text-gray-600 mb-4">
                Your password has been updated. You will be redirected to the login page shortly.
              </p>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-sm text-gray-600">Redirecting...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="max-w-md w-full shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
            <Lock className="h-8 w-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Set New Password</CardTitle>
          <CardDescription className="text-gray-600">Create a strong password to secure your account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                New Password
              </Label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  className="pr-10 h-11 w-[100%] pl-3 border rounded-lg font-semibold text-sm"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    validate: (value) => {
                      const metRequirements = passwordRequirements.filter((req) => req.test(value)).length
                      if (metRequirements < 3) {
                        return "Password must meet at least 3 requirements"
                      }
                      return true
                    },
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Password strength</span>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength < 40
                          ? "text-red-600"
                          : passwordStrength < 70
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <Progress value={passwordStrength} className="h-2" />
                </div>
              )}

              {/* Password Requirements */}
              {password && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 font-medium">Password requirements:</p>
                  {passwordRequirements.map((req, index) => {
                    const isMet = req.test(password)
                    return (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {isMet ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-300" />
                        )}
                        <span className={isMet ? "text-green-600" : "text-gray-500"}>{req.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  className="pr-10 h-11 w-[100%] pl-3 border rounded-lg font-semibold text-sm"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => value === password || "Passwords do not match",
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.confirmPassword.message}
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Setting Password...
                </div>
              ) : (
                "Set New Password"
              )}
            </Button>
          </form>

          {/* Security Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Security Tips:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Use a unique password you haven't used before</li>
                  <li>• Consider using a password manager</li>
                  <li>• Don't share your password with anyone</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
