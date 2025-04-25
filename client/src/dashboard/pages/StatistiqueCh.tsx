import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import "moment/locale/ar"
import { AppDispatch, RootState } from "@/redux/store";
import { downloadRegistrationStats, fetchChauffeurs } from "@/redux/slice/chauffeurSlice";

moment.locale("ar");

interface ChartData {
  date: string;
  count: number;
}

const StatistiqueCh = () => {
  const {chauffeurs} = useSelector((state: RootState) => state.chauffeur);
  const dispatch = useDispatch<AppDispatch>();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [Page] = useState(1);
  const [searchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchChauffeurs({ search: searchQuery, page: Page }));
  }, [dispatch, searchQuery, Page]);

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
    <div className="p-4">
      <h2 className="text-2xl font-bold text-right mb-4">عدد السائقين حسب الفترة</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-end">
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

      <div className="flex gap-3">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-45} textAnchor="end" />
            <YAxis />
            <Tooltip
              contentStyle={{ textAlign: "right" }}
              formatter={(value: any) => [`${value}`, "عدد المسجلين"]}
              labelFormatter={(label) => `التاريخ: ${label}`}
            />
            <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" angle={-45} textAnchor="end" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip
              contentStyle={{ textAlign: "right" }}
              formatter={(value: any) => [`${value}`, "عدد المسجلين"]}
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
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatistiqueCh;
