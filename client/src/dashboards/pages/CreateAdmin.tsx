import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { createUser } from "@/redux/slice/userSlice";
import { useUser } from "@/hooks/context/userContext/UserProvider";

type CreateAdminForm = {
    fullName: string;
    email: string;
    password: string;
    passwordConfirm: string;
    phone?: string;
    role: string;
};

export const CreateAdmin = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.user);
    const { userData } = useUser();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm<CreateAdminForm>();

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const password = watch("password");

    const onSubmit = (data: CreateAdminForm) => {
        const formattedPhone = data.phone?.replace(/\s|\-|\./g, "") || undefined;
        dispatch(
            createUser({
                ...data,
                phone: formattedPhone,
            })
        );
        reset();
    };

    return (
        <div className="max-w-lg mx-auto p-6 mt-12 bg-white rounded shadow">
            <h2 className="text-2xl font-bold text-center mb-6">إنشاء حساب جديد</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block mb-1">الاسم الكامل</label>
                    <input
                        type="text"
                        {...register("fullName", { required: "هذا الحقل مطلوب" })}
                        className="w-full px-3 py-2 border rounded"
                    />
                    {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1">البريد الإلكتروني</label>
                    <input
                        type="email"
                        {...register("email", { 
                            required: "البريد مطلوب",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "صيغة البريد الإلكتروني غير صحيحة"
                            }
                        })}
                        className="w-full px-3 py-2 border rounded"
                        dir="ltr"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1">كلمة المرور</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            {...register("password", {
                                required: "كلمة المرور مطلوبة",
                                minLength: { value: 8, message: "على الأقل 8 أحرف" },
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                    message: "يجب أن تحتوي على حرف كبير، صغير، رقم، ورمز خاص"
                                }
                            })}
                            className="w-full px-3 py-2 border rounded pr-10"
                            dir="ltr"
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1">تأكيد كلمة المرور</label>
                    <div className="relative">
                        <input
                            type={showPasswordConfirm ? "text" : "password"}
                            {...register("passwordConfirm", { 
                                required: "التأكيد مطلوب",
                                validate: (value) => value === password || "كلمات المرور غير متطابقة"
                            })}
                            className="w-full px-3 py-2 border rounded pr-10"
                            dir="ltr"
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        >
                            {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.passwordConfirm && (
                        <p className="text-red-500 text-sm mt-1">{errors.passwordConfirm.message}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1">رقم الهاتف (اختياري)</label>
                    <input
                        type="tel"
                        {...register("phone", {
                            pattern: {
                                value: /^[0-9+\-\s()]+$/,
                                message: "رقم الهاتف غير صالح"
                            }
                        })}
                        className="w-full px-3 py-2 border rounded"
                        dir="ltr"
                    />
                    {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1">الدور (Role)</label>
                    <select
                        {...register("role", { required: "يرجى تحديد الصلاحية" })}
                        className="w-full px-3 py-2 border rounded"
                    >
                        <option value="user">مستخدم عادي (User)</option>
                        <option value="manager">مدير (Manager)</option>
                        {userData?.role === 'admin' && (
                            <option value="admin">مسؤول (Admin)</option>
                        )}
                    </select>
                    {errors.role && (
                        <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700"
                >
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "إنشاء الحساب"}
                </button>
            </form>
        </div>
    );
};
