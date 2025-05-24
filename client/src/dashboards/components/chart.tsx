import { fetchAllStats } from "@/redux/slice/stateSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Chart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector((state:RootState) => state.stats);

  useEffect(() => {
    dispatch(fetchAllStats());
  }, [dispatch]);

  if (loading) return <div>تحميل...</div>;

  const chartData = [
    {
      type: "اليوم",
      Operateurs: data.operateurs.today,
      Chauffeurs: data.chauffeurs.today,
      Vehicules: data.vehicules.today,
    },
    {
      type: "الشهر",
      Operateurs: data.operateurs.thisMonth,
      Chauffeurs: data.chauffeurs.thisMonth,
      Vehicules: data.vehicules.thisMonth,
    },
    {
      type: "السنة",
      Operateurs: data.operateurs.thisYear,
      Chauffeurs: data.chauffeurs.thisYear,
      Vehicules: data.vehicules.thisYear,
    },
  ];

  return (
    <div className="w-full h-[400px] bg-white rounded-xl p-4  shadow">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Operateurs" fill="#8884d8" />
          <Bar dataKey="Chauffeurs" fill="#82ca9d" />
          <Bar dataKey="Vehicules" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
