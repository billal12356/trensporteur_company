import { useUser } from "@/hooks/context/userContext/UserProvider";
import { updateUser, User } from "@/redux/slice/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

export const UpdateUser = () => {
    const { userData } = useUser();
    const { loading } = useSelector((state: RootState) => state.user)
    const dispatch = useDispatch<AppDispatch>()
    const { register, handleSubmit, reset } = useForm<User>();

    const onSubmit = (data: User) => {
        if (userData?._id) {
            dispatch(updateUser({ id: userData._id, data }));
            reset()
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-4 text-center">بيانات السائق</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block mb-1">الاسم الكامل</label>
                    <input
                        type="text"
                        {...register('fullName')}
                        className="border px-3 py-2 rounded w-full"
                    />
                </div>

                <div>
                    <label className="block mb-1">البريد الإلكتروني</label>
                    <input
                        type="email"
                        {...register('email')}
                        className="border px-3 py-2 rounded w-full"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                   {
                     loading ? <Loader2/> : " حفظ البيانات"
                   }
                </button>
            </form>
        </div>
    )
}
