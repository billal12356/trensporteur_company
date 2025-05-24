import { useUser } from "@/hooks/context/userContext/UserProvider";
import { updateUser, User } from "@/redux/slice/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

export const EditProfile = () => {
  const { userData, setUserData } = useUser(); // أضف setUserData هنا
  const { loading } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const { register, handleSubmit, reset } = useForm<User>();

  const onSubmit = async (data: User) => {
    if (userData?._id) {
      const action = await dispatch(updateUser({ id: userData._id, data }));
      if (updateUser.fulfilled.match(action)) {
        setUserData({ ...userData, ...data }); // ✅ تحديث السياق بالقيم الجديدة
        reset();
      }
    }
  };

  const roleTitleMap: Record<string, string> = {
    chauffeur: "بيانات السائق",
    operateur: "الصفحة المهنية",
    admin: "إعدادات الحساب",
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded mt-14">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {roleTitleMap[userData?.role || "admin"]}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">الاسم الكامل</label>
          <input
            type="text"
            defaultValue={userData?.fullName}
            {...register("fullName")}
            className="border px-3 py-2 rounded w-full"
          />
        </div>

        {/* البريد الإلكتروني والهاتف يمكن إضافتهما بنفس الطريقة */}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" /> : "حفظ البيانات"}
        </button>
      </form>
    </div>
  );
};
