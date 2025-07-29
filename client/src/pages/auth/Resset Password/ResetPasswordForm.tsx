import { resetPassword } from "@/redux/slice/authSlice";
import { AppDispatch } from "@/redux/store";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { IoReturnUpBackOutline } from "react-icons/io5";

export default function ResetPasswordForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { register, handleSubmit } = useForm<{ email: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    const resultAction = await dispatch(resetPassword(data.email));
    setLoading(false);

    if (resetPassword.fulfilled.match(resultAction)) {
      navigate(`/verify-code/${data.email}`);
    } else {
      console.error(
        "Failed to send code:",
        resultAction.payload || resultAction.error
      );
      
    }
  };

  return (
    <div className="h-screen bg-gray-200">
      <Link to="/login" className="text-right">
        <IoReturnUpBackOutline className="w-48 text-5xl"/>
      </Link>
      <div className="flex flex-col gap-4 p-3 justify-center items-center mt-24">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s"
          alt=""
          className="w-24 h-24"
        />
        <h1 className="text-4xl font-bold">Forgot password?</h1>
        <span className="text-gray-500 font-semibold">
          Please enter your email to reset the password
        </span>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-72"
        >
          <input
            type="email"
            {...register("email")}
            placeholder="Enter your email"
            required
            className="mt-16 border-b border-gray-400 w-80 pb-1 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-80 rounded-lg bg-purple-600 hover:bg-purple-700 text-white h-10 font-semibold text-lg cursor-pointer flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <span className="loader border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
            ) : (
              "Send 6-digit code"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
