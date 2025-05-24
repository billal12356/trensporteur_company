import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { Loader2 } from "lucide-react";
import { createUser } from "@/redux/slice/userSlice";

type CreateAdminForm = {
    fullName: string;
    email: string;
    password: string;
    passwordConfirm: string;
    phone?: string;
};

export const CreateAdmin = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.user);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateAdminForm>();

    const onSubmit = (data: CreateAdminForm) => {
        const formattedPhone = data.phone?.replace(/\s|\-|\./g, "") || undefined;
        dispatch(
            createUser({
                ...data,
                phone: formattedPhone,
                role: "admin",
            })
        );
        reset();
    };

    return (
        <div className="max-w-lg mx-auto p-6 mt-12 bg-white rounded shadow">
            <h2 className="text-2xl font-bold text-center mb-6">إضافة مشرف جديد</h2>

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
                        {...register("email", { required: "البريد مطلوب" })}
                        className="w-full px-3 py-2 border rounded"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1">كلمة المرور</label>
                    <input
                        type="password"
                        {...register("password", {
                            required: "كلمة المرور مطلوبة",
                            minLength: { value: 6, message: "على الأقل 6 أحرف" },
                        })}
                        className="w-full px-3 py-2 border rounded"
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1">تأكيد كلمة المرور</label>
                    <input
                        type="password"
                        {...register("passwordConfirm", { required: "التأكيد مطلوب" })}
                        className="w-full px-3 py-2 border rounded"
                    />
                    {errors.passwordConfirm && (
                        <p className="text-red-500 text-sm mt-1">{errors.passwordConfirm.message}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1">رقم الهاتف (اختياري)</label>
                    <input
                        type="text"
                        {...register("phone")}
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700"
                >
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "إضافة المشرف"}
                </button>
            </form>
        </div>
    );
};
