import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Loading = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <AiOutlineLoading3Quarters className="text-4xl text-pink-500 animate-spin" />
      <div className="text-lg text-gray-500 mt-2">جاري التحميل...</div>
    </div>
  );
};

export default Loading;
