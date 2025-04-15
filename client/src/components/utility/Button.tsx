import React from "react";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  loading?: boolean;
}

export const ButtonForm: React.FC<ButtonProps> = ({ label, onClick, loading }) => {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={loading}
      className={`w-full py-2 rounded-md text-white font-semibold transition ${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-pink-500 hover:bg-pink-600"
      }`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          جاري التحميل...
        </div>
      ) : (
        label
      )}
    </button>
  );
};
