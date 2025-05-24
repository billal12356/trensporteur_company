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
import { downloadRegistrationStats, fetchChauffeurs } from "@/redux/slice/chauffeurSlice";

moment.locale("ar");

interface ChartData {
  date: string;
  count: number;
}

const DriverStats = () => {
  const { chauffeurs } = useSelector((state: RootState) => state.chauffeur);
  const dispatch = useDispatch<AppDispatch>();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"bar" | "line">("bar");

  useEffect(() => {
    dispatch(fetchChauffeurs({ search: "", page: 1 }));
  }, [dispatch]);

  const filteredData = useMemo(() => {
    return chauffeurs.filter((ch) => {
      const date = new Date(ch.createdAt);
      return (!startDate || date >= startDate) && (!endDate || date <= endDate);
    });
  }, [chauffeurs, startDate, endDate]);

  const groupedData = filteredData.reduce((acc: Record<string, number>, ch) => {
    const key = moment(ch.createdAt).format("YYYY-MM-DD");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const chartData: ChartData[] = Object.entries(groupedData).map(([date, count]) => ({
    date: moment(date).format("D MMMM"),
    count,
  }));

  const handleDownload = () => {
    if (!startDate || !endDate) {
      alert("يرجى تحديد الفترة أولاً");
      return;
    }

    const formattedStart = moment(startDate).format("YYYY-MM-DD");
    const formattedEnd = moment(endDate).format("YYYY-MM-DD");

    dispatch(downloadRegistrationStats({ startDate: formattedStart, endDate: formattedEnd }));
  };

  return (
    <div className="p-4 mt-14 text-right">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 عدد السائقين حسب الفترة</h2>

      {/* ✅ Date Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
        <div className="flex flex-col">
          <label className="mb-1 text-sm">من تاريخ</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="اختر تاريخ البدء"
            dateFormat="yyyy-MM-dd"
            className="border px-3 py-2 rounded-md shadow-sm"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm">إلى تاريخ</label>
          <DatePicker
            selected={endDate ?? undefined}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate ?? undefined}
            endDate={endDate ?? undefined}
            minDate={startDate ?? undefined}
            placeholderText="اختر تاريخ الانتهاء"
            dateFormat="yyyy-MM-dd"
            className="border px-3 py-2 rounded-md shadow-sm"
          />
        </div>
        <button
          onClick={handleDownload}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition text-sm"
        >
          تحميل البيانات
        </button>
      </div>

      {/* ✅ Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("bar")}
          className={`px-4 py-2 text-sm font-medium rounded-t-md ${
            activeTab === "bar"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          📦 رسم بياني بالأعمدة
        </button>
        <button
          onClick={() => setActiveTab("line")}
          className={`px-4 py-2 text-sm font-medium rounded-t-md ml-2 ${
            activeTab === "line"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          📈 رسم بياني بالخط
        </button>
      </div>

      {/* ✅ Chart Content */}
      {chartData.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">لا توجد بيانات لعرضها في الفترة المحددة.</div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <ResponsiveContainer width="100%" height={400}>
            {activeTab === "bar" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" />
                <YAxis />
                <Tooltip
                  contentStyle={{ textAlign: "right" }}
                  formatter={(value: any) => [`${value}`, "عدد المسجلين"]}
                  labelFormatter={(label) => `📅 ${label}`}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  contentStyle={{ textAlign: "right" }}
                  formatter={(value: any) => [`${value}`, "عدد المسجلين"]}
                  labelFormatter={(label) => `📅 ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
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

export default DriverStats;
