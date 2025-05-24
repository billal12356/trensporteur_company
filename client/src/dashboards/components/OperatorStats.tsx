import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import "moment/locale/ar";
import { AppDispatch, RootState } from "@/redux/store";
import {
  downloadRegistrationStats,
  fetchOperateurs,
} from "@/redux/slice/operateurSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


moment.locale("ar");

interface ChartData {
  date: string;
  count: number;
}

const OperatorStats = () => {
  const dispatch = useDispatch<AppDispatch>();
  const operateurs = useSelector((state: RootState) => state.operateur.operateurs);
  const [Page] = useState()
  const [searchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchOperateurs({ search: searchQuery, page: Page }))
      .finally(() => setLoading(false));
  }, [dispatch]);

  console.log(operateurs);

  const filteredData = useMemo(() => {
    return operateurs.filter((op) => {
      const date = new Date(op.createdAt);
      return (!startDate || date >= startDate) && (!endDate || date <= endDate);
    });
  }, [operateurs, startDate, endDate]);

  const groupedData = filteredData.reduce((acc: Record<string, number>, op) => {
    const key = moment(op.createdAt).format("YYYY-MM-DD");
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
    dispatch(downloadRegistrationStats({
      startDate: moment(startDate).format("YYYY-MM-DD"),
      endDate: moment(endDate).format("YYYY-MM-DD"),
    }));
  };

  return (
    <div className="p-4 mt-14">
      <h2 className="text-2xl font-bold text-right mb-4">
        عدد المسجلين حسب الفترة
      </h2>

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

      {loading ? (
        <p className="text-center text-gray-500">جاري التحميل...</p>
      ) : chartData.length === 0 ? (
        <p className="text-center text-gray-500">لا توجد بيانات لعرضها</p>
      ) : (
        <Tabs defaultValue="bar" className="w-full">
          <TabsList className="mb-4 flex justify-center gap-4 bg-gray-100 p-2 rounded-md">
            <TabsTrigger value="bar">📊 الرسم العمودي</TabsTrigger>
            <TabsTrigger value="line">📈 الرسم البياني</TabsTrigger>
          </TabsList>

          <TabsContent value="bar">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" />
                <YAxis />
                <Tooltip
                  contentStyle={{ textAlign: "right" }}
                  formatter={(value) => [`${value}`, "عدد المسجلين"]}
                  labelFormatter={(label) => `📅 التاريخ: ${label}`}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="line">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  contentStyle={{ textAlign: "right" }}
                  formatter={(value) => [`${value}`, "عدد المسجلين"]}
                  labelFormatter={(label) => `📅 التاريخ: ${label}`}
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
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default OperatorStats;
