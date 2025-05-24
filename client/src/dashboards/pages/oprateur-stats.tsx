import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export const StatCard = ({ title, value, icon }: StatCardProps) => (
  <div className="bg-white rounded-2xl shadow p-5 flex items-center justify-between mt-14">
    <div>
      <p className="text-xl font-bold text-gray-500">{title}</p>
      <h3 className="text-xl font-bold">{value}</h3>
    </div>
    <div className="text-3xl text-blue-500">{icon}</div>
  </div>
);
