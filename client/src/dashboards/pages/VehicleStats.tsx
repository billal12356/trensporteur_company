import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import "moment/locale/ar";
import { AppDispatch, RootState } from "@/redux/store";
import { downloadRegistrationStats, fetchVihicules } from "@/redux/slice/vihiculeSlice";

moment.locale("ar");

interface ChartData {
  date: string;
  count: number;
}

const VehicleStats = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { vihicules } = useSelector((state: RootState) => state.vihicule);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"bar" | "line">("bar");

  useEffect(() => {
    dispatch(fetchVihicules({ search: "" }));
  }, [dispatch]);

  
  const filteredData = useMemo(() => {
    return vihicules.filter((vh) => {
      const date = new Date(vh.createdAt);
      return (!startDate || date >= startDate) && (!endDate || date <= endDate);
    });
  }, [vihicules, startDate, endDate]);

  const groupedData = useMemo(() => {
    return filteredData.reduce((acc: Record<string, number>, vh) => {
      const dateKey = moment(vh.createdAt).format("YYYY-MM-DD");
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});
  }, [filteredData]);

  const chartData: ChartData[] = Object.entries(groupedData).map(([date, count]) => ({
    date: moment(date).format("D MMMM"),
    count,
  }));

  const handleDownload = () => {
    if (!startDate || !endDate) {
      alert("يرجى تحديد الفترة أولاً");
      return;
    }

    dispatch(
      downloadRegistrationStats({
        startDate: moment(startDate).format("YYYY-MM-DD"),
        endDate: moment(endDate).format("YYYY-MM-DD"),
      })
    );
  };

  return (
    <div className="p-4 mt-14">
      <h2 className="text-2xl font-bold text-right mb-4">عدد المركبات حسب الفترة</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-end items-center">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="من تاريخ"
          dateFormat="yyyy-MM-dd"
          className="border px-3 py-2 rounded-md"
        />
        <DatePicker
          selected={endDate ?? undefined}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate ?? undefined}
          endDate={endDate ?? undefined}
          minDate={startDate ?? undefined}
          placeholderText="إلى تاريخ"
          dateFormat="yyyy-MM-dd"
          className="border px-3 py-2 rounded-md"
        />
        <button
          onClick={handleDownload}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          تحميل النتائج
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex justify-center space-x-4 rtl:space-x-reverse">
        <button
          onClick={() => setActiveTab("bar")}
          className={`px-4 py-2 rounded-t-md border-b-2 transition ${
            activeTab === "bar" ? "border-blue-600 text-blue-600 font-semibold" : "border-transparent text-gray-500"
          }`}
        >
          رسم عمودي
        </button>
        <button
          onClick={() => setActiveTab("line")}
          className={`px-4 py-2 rounded-t-md border-b-2 transition ${
            activeTab === "line" ? "border-blue-600 text-blue-600 font-semibold" : "border-transparent text-gray-500"
          }`}
        >
          رسم خطي
        </button>
      </div>

      {/* Chart Section */}
      {chartData.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">لا توجد بيانات لعرضها.</p>
      ) : (
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === "bar" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" />
                <YAxis />
                <Tooltip
                  contentStyle={{ textAlign: "right" }}
                  formatter={(value) => [`${value}`, "عدد المركبات"]}
                  labelFormatter={(label) => `التاريخ: ${label}`}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  contentStyle={{ textAlign: "right" }}
                  formatter={(value) => [`${value}`, "عدد المركبات"]}
                  labelFormatter={(label) => `التاريخ: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default VehicleStats;
