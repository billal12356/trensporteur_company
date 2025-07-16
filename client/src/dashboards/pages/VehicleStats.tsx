"use client"

import { useState, useMemo, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { CalendarIcon, Download, TrendingUp, Car, Calendar, BarChart3, Activity } from "lucide-react"
import moment from "moment"
import "moment/locale/ar"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import type { AppDispatch, RootState } from "@/redux/store"
import { downloadRegistrationStats, fetchVihicules } from "@/redux/slice/vihiculeSlice"

moment.locale("ar")

interface ChartData {
  date: string
  count: number
  formattedDate: string
}

// Enhanced Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <p className="text-sm font-semibold text-gray-800">{`📅 ${label}`}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-4 h-4 rounded-full shadow-sm"
            style={{ backgroundColor: payload[0].color }}
          ></span>
          <p className="text-sm text-gray-600 font-medium">{`عدد المركبات: ${payload[0].value.toLocaleString()}`}</p>
        </div>
      </div>
    )
  }
  return null
}

// Date picker styles
const datePickerStyles = `
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker__input-container input {
    width: 100%;
  }
  .react-datepicker {
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  .react-datepicker__header {
    background: linear-gradient(to right, #dbeafe, #e0e7ff);
    border-bottom: 1px solid #d1d5db;
    border-radius: 10px 10px 0 0;
  }
  .react-datepicker__day--selected {
    background: linear-gradient(to right, #3b82f6, #8b5cf6);
    color: white;
  }
  .react-datepicker__day:hover {
    background: #dbeafe;
  }
`

export default function EnhancedVehicleStats() {
  const dispatch = useDispatch<AppDispatch>()
  const { vihicules } = useSelector((state: RootState) => state.vihicule)

  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [loading, setLoading] = useState(false)
  const [Limit] = useState(10000)

  useEffect(() => {
    setLoading(true)
    dispatch(fetchVihicules({ search: "", limit: Limit })).finally(() => setLoading(false))
  }, [dispatch, Limit])

  const filteredData = useMemo(() => {
    return vihicules.filter((vh) => {
      const date = new Date(vh.createdAt)
      return (!startDate || date >= startDate) && (!endDate || date <= endDate)
    })
  }, [vihicules, startDate, endDate])

  const { chartData, totalVehicles, averagePerDay, peakDay } = useMemo(() => {
    const groupedData = filteredData.reduce((acc: Record<string, number>, vh) => {
      const key = moment(vh.createdAt).format("YYYY-MM-DD")
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const data: ChartData[] = Object.entries(groupedData)
      .map(([date, count]) => ({
        date: moment(date).format("D MMMM"),
        formattedDate: date,
        count,
      }))
      .sort((a, b) => moment(a.formattedDate).diff(moment(b.formattedDate)))

    const total = data.reduce((sum, item) => sum + item.count, 0)
    const average = data.length > 0 ? Math.round(total / data.length) : 0
    const peak = data.reduce((max, item) => (item.count > max.count ? item : max), { count: 0, date: "" })

    return {
      chartData: data,
      totalVehicles: total,
      averagePerDay: average,
      peakDay: peak,
    }
  }, [filteredData])

  const handleDownload = () => {
    if (!startDate || !endDate) {
      alert("يرجى تحديد الفترة أولاً")
      return
    }
    dispatch(
      downloadRegistrationStats({
        startDate: moment(startDate).format("YYYY-MM-DD"),
        endDate: moment(endDate).format("YYYY-MM-DD"),
      }),
    )
  }

  return (
    <>
      <style>{datePickerStyles}</style>
      <div className="space-y-8 p-6 mt-9 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        {/* Enhanced Header */}
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  إحصائيات المركبات
                </h1>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl">
                تتبع وتحليل بيانات تسجيل المركبات عبر الفترات الزمنية مع رؤى تحليلية متقدمة
              </p>
            </div>
            <Badge
              variant="secondary"
              className="text-base px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 shadow-sm"
            >
              <Car className="w-5 h-5 mr-2" />
              {vihicules.length.toLocaleString()} مركبة
            </Badge>
          </div>

          {/* Enhanced Date Range Picker */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-white via-blue-50 to-white backdrop-blur-sm">
            <CardContent className="pt-8 pb-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
                <div className="flex gap-4">
                  <div className="relative">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date ?? undefined)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      placeholderText="     من تاريخ"
                      dateFormat="yyyy-MM-dd"
                      className="w-[280px] px-4 py-3 text-left font-medium border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date ?? undefined)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      placeholderText="     إلى تاريخ"
                      dateFormat="yyyy-MM-dd"
                      className="w-[280px] px-4 py-3 text-left font-medium border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <Button
                  onClick={handleDownload}
                  disabled={!startDate || !endDate}
                  className="gap-3 px-6 py-3 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  تحميل النتائج
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Stats Cards */}
        {chartData.length > 0 && (
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-blue-800">إجمالي المركبات</CardTitle>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Car className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 mb-2">{totalVehicles.toLocaleString()}</div>
                <p className="text-sm text-blue-600 font-medium">في الفترة المحددة</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 via-green-100 to-green-50 hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-green-800">المتوسط اليومي</CardTitle>
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900 mb-2">{averagePerDay.toLocaleString()}</div>
                <p className="text-sm text-green-600 font-medium">مركبة يومياً</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-purple-800">أعلى يوم</CardTitle>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900 mb-2">{peakDay.count.toLocaleString()}</div>
                <p className="text-sm text-purple-600 font-medium">{peakDay.date}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Charts */}
        {loading ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="flex items-center justify-center h-[500px]">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                </div>
                <span className="text-xl font-medium text-gray-600">جاري التحميل...</span>
              </div>
            </CardContent>
          </Card>
        ) : chartData.length === 0 ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="flex items-center justify-center h-[500px]">
              <div className="text-center space-y-4">
                <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto">
                  <Car className="mx-auto h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-700">لا توجد بيانات</h3>
                <p className="text-gray-500 text-lg">لا توجد بيانات لعرضها في الفترة المحددة</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="area" className="space-y-6">
            <div className="flex justify-center">
              <TabsList className="grid grid-cols-3 w-[700px] h-16 bg-white shadow-xl border-0 rounded-2xl p-2">
                <TabsTrigger
                  value="area"
                  className="text-lg font-semibold gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300 data-[state=active]:shadow-lg"
                >
                  <Activity className="w-5 h-5" />📊 المساحة
                </TabsTrigger>
                <TabsTrigger
                  value="bar"
                  className="text-lg font-semibold gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-300 data-[state=active]:shadow-lg"
                >
                  <BarChart3 className="w-5 h-5" />📈 الأعمدة
                </TabsTrigger>
                <TabsTrigger
                  value="line"
                  className="text-lg font-semibold gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-xl transition-all duration-300 data-[state=active]:shadow-lg"
                >
                  <TrendingUp className="w-5 h-5" />📉 الخط
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="area" className="space-y-4">
              <Card className="border-0 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border-b">
                  <CardTitle className="text-blue-800 text-2xl font-bold flex items-center gap-3">
                    <Activity className="w-7 h-7" />
                    إحصائيات المركبات - عرض المساحة
                  </CardTitle>
                  <CardDescription className="text-blue-600 text-lg">
                    عرض تدفق تسجيل المركبات عبر الوقت مع تمييز الاتجاهات والأنماط
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <ResponsiveContainer width="100%" height={500}>
                    <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <defs>
                        <linearGradient id="vehicleAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                          <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.7} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 14, fill: "#6b7280", fontWeight: 500 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis tick={{ fontSize: 14, fill: "#6b7280", fontWeight: 500 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#vehicleAreaGradient)"
                        strokeWidth={4}
                        dot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 8, fill: "#3b82f6", strokeWidth: 3, stroke: "#fff" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bar" className="space-y-4">
              <Card className="border-0 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 via-blue-50 to-green-50 border-b">
                  <CardTitle className="text-green-800 text-2xl font-bold flex items-center gap-3">
                    <BarChart3 className="w-7 h-7" />
                    إحصائيات المركبات - الأعمدة
                  </CardTitle>
                  <CardDescription className="text-green-600 text-lg">
                    مقارنة أعداد المركبات المسجلة يومياً مع تمييز الفترات الأكثر نشاطاً
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <defs>
                        <linearGradient id="vehicleBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.7} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 14, fill: "#6b7280", fontWeight: 500 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis tick={{ fontSize: 14, fill: "#6b7280", fontWeight: 500 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="count"
                        fill="url(#vehicleBarGradient)"
                        radius={[8, 8, 0, 0]}
                        className="hover:opacity-80 transition-opacity duration-300"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="line" className="space-y-4">
              <Card className="border-0 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-b">
                  <CardTitle className="text-purple-800 text-2xl font-bold flex items-center gap-3">
                    <TrendingUp className="w-7 h-7" />
                    إحصائيات المركبات - الخط البياني
                  </CardTitle>
                  <CardDescription className="text-purple-600 text-lg">
                    تتبع اتجاه تسجيل المركبات عبر الوقت مع إظهار الاتجاهات والتغيرات
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <ResponsiveContainer width="100%" height={500}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <defs>
                        <linearGradient id="vehicleLineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="50%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.7} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 14, fill: "#6b7280", fontWeight: 500 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis tick={{ fontSize: 14, fill: "#6b7280", fontWeight: 500 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="url(#vehicleLineGradient)"
                        strokeWidth={5}
                        dot={{ r: 7, fill: "#8b5cf6", strokeWidth: 3, stroke: "#fff" }}
                        activeDot={{ r: 10, fill: "#8b5cf6", strokeWidth: 3, stroke: "#fff" }}
                        className="drop-shadow-lg"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  )
}
