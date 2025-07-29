"use client";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { resetPassword, verifyCode } from "@/redux/slice/authSlice";
import { AppDispatch } from "@/redux/store";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { IoReturnUpBackOutline } from "react-icons/io5";

type FormValues = { pin: string };
export default function VerifyCodeForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { pin: "" },
  });

  const onSubmit = async ({ pin }: FormValues) => {
    if (!email) return;

    const result = await dispatch(verifyCode({ email, code: Number(pin) }));
    if (verifyCode.fulfilled.match(result)) {
      navigate(`/change-password/${email}`);
    } else {
      console.error("Verification failed:", result.payload || result.error);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    await dispatch(resetPassword(email));
  };

  return (
    <div className="h-screen ">
      <Link to='/reset-password' className="self-start">
        <IoReturnUpBackOutline className="w-48 text-5xl" />
      </Link>
      <div className="flex flex-col gap-4 p-3 justify-center items-center mt-24 ">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s"
          alt="logo"
          className="w-24 h-24"
        />
        <h1 className="text-4xl font-bold">Enter your code</h1>
        <span className="text-gray-500 font-semibold">
          We sent a code to {email}
        </span>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-72"
        >
          <div className="flex flex-col">
            <Controller
              name="pin"
              control={control}
              rules={{
                required: "Code is required",
                pattern: { value: /^\d{6}$/, message: "Enter 6 digits" },
              }}
              render={({ field }) => (
                <InputOTP maxLength={6} {...field} className="mx-auto">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-14 h-14 text-2xl" />
                    <InputOTPSlot index={1} className="w-14 h-14 text-2xl" />
                    <InputOTPSlot index={2} className="w-14 h-14 text-2xl" />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} className="w-14 h-14 text-2xl" />
                    <InputOTPSlot index={4} className="w-14 h-14 text-2xl" />
                    <InputOTPSlot index={5} className="w-14 h-14 text-2xl" />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />

            <div className="mt-5 gap-1">
              <span className="text-gray-500 font-semibold">
                Didn&apos;t receive the email?
              </span>
              <button
                type="button"
                onClick={handleResend}
                className="ml-1 border-b border-black font-bold cursor-pointer focus:outline-none focus:ring-0"
              >
                Click to resend
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-80 bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-10 font-semibold text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-0 focus:border-none"
          >
            {isSubmitting ? "Please wait..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
