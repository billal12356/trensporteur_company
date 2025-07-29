"use client";

import { changePassword } from "@/redux/slice/authSlice";
import { AppDispatch } from "@/redux/store";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ChangePasswordForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<{
    password: string;
    ConfirmePassword: string;
  }>();

  const onSubmit = async (data: {
    password: string;
    ConfirmePassword: string;
  }) => {
    console.log(data);
    if (!email) return;

    const result = await dispatch(
      changePassword({
        email,
        password: data.password,
        ConfirmePassword: data.ConfirmePassword,
      })
    );
    if (changePassword.fulfilled.match(result)) {
      navigate(`/login`);
    } else {
      console.error("Verification failed:", result.payload || result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Card className="max-w-md w-full p-10 flex flex-col items-center shadow-lg">
        <div className="bg-purple-100 rounded-full p-3 mb-4">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s"
            alt="logo"
            className="w-24 h-24 rounded-full"
          />
        </div>
        <h2 className="text-2xl font-bold mb-1 text-center">
          Set new password
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Must be at least 8 characters.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
          <input
            type="password"
            placeholder="Password"
            {...register("password")}
            className="h-12 text-base border rounded px-4 w-full"
          />
          <input
            type="password"
            placeholder="Confirm password"
            {...register("ConfirmePassword")}
            className="h-12 text-base border rounded px-4 w-full"
          />

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full h-12 text-lg font-semibold"
          >
            Set new password
          </Button>
        </form>
      </Card>
    </div>
  );
}
