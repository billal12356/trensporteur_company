import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { changePassword } from "@/redux/slice/userSlice";
import { useUser } from "@/hooks/context/userContext/UserProvider";

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePassword() {
  const { userData } = useUser();

  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.user);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordForm>();

  const onSubmit = (data: ChangePasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      setError("confirmPassword", { message: "كلمتا المرور غير متطابقتين" });
      return;
    }

    if (userData?._id) {
      dispatch(changePassword({ id: userData._id, ...data })).then((action: any) => {
        if (!action.error) {
          reset();
        } else if (typeof action.payload === "string") {
          setError("currentPassword", { message: action.payload });
        }
      });
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto mt-14">
      <Card>
        <CardHeader>
          <CardTitle>تغيير كلمة المرور</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="كلمة المرور الحالية"
                {...register("currentPassword", {
                  required: "كلمة المرور الحالية مطلوبة",
                })}
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="كلمة المرور الجديدة"
                {...register("newPassword", {
                  required: "كلمة المرور الجديدة مطلوبة",
                })}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="تأكيد كلمة المرور الجديدة"
                {...register("confirmPassword", {
                  required: "يرجى تأكيد كلمة المرور الجديدة",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جارٍ التحديث..." : "تغيير كلمة المرور"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
