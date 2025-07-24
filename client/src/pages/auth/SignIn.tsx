"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Truck, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { useNavigate } from "react-router-dom"
import { loginUser } from "@/redux/slice/authSlice"

interface FormData {
  email: string
  password: string
  rememberMe: boolean
}

interface FormErrors {
  email: string
  password: string
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  })

  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // مسح الخطأ عند بدء الكتابة
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = { email: "", password: "" }

    if (!formData.email.includes("@")) {
      newErrors.email = "يجب إدخال بريد إلكتروني صالح"
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة"
    }

    if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور قصيرة جداً"
    }

    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }


    try {

      await dispatch(loginUser(formData));

    } catch (error) {
      console.error("خطأ في تسجيل الدخول:", error)
    } finally {

    }
  }

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-lg border border-white/20">
          <CardHeader className="text-center pb-8">
            {/* شعار الشركة */}
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-2xl ring-4 ring-white/20">
              <Truck className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">مرحباً بك</h1>
            <p className="text-blue-100 text-lg">سجل دخولك إلى نظام إدارة النقل</p>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
              {/* البريد الإلكتروني */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-12 text-right bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:bg-white/20 focus:border-blue-400 transition-all duration-300"
                    placeholder="أدخل بريدك الإلكتروني"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="text-red-300 text-sm text-right flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-300 rounded-full"></span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* كلمة المرور */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="h-12 text-right bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:bg-white/20 focus:border-blue-400 transition-all duration-300 pr-12"
                    placeholder="أدخل كلمة المرور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.password && (
                  <p className="text-red-300 text-sm text-right flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-300 rounded-full"></span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* تذكرني ونسيت كلمة المرور */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="text-blue-300 hover:text-blue-100 text-sm transition-colors hover:underline"
                >
                  نسيت كلمة المرور؟
                </button>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))}
                    className="border-white/30 data-[state=checked]:bg-blue-500"
                  />
                  <Label htmlFor="rememberMe" className="text-white text-sm cursor-pointer">
                    تذكرني
                  </Label>
                </div>
              </div>

              {/* زر تسجيل الدخول */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl border-0"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="animate-spin w-5 h-5" />
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Lock className="w-5 h-5" />
                    تسجيل الدخول
                  </div>
                )}
              </Button>

            </form>
          </CardContent>
        </Card>

        {/* معلومات إضافية */}
        <div className="mt-8 text-center">
          <p className="text-blue-200 text-sm">نظام إدارة النقل والمواصلات</p>
          <p className="text-blue-300 text-xs mt-1">آمن ومحمي بأحدث تقنيات الأمان</p>
        </div>
      </div>
    </div>
  )
}
