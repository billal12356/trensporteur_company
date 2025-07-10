"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { TrendingUp, Users, Car, UserCheck, BarChart3 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts"

import { fetchAllStats } from "@/redux/slice/stateSlice"
import type { AppDispatch, RootState } from "@/redux/store"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-800">{`📊 ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-gray-600">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Custom Pie Tooltip
const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-800">{data.name}</p>
        <p className="text-sm text-gray-600">{`العدد: ${data.value}`}</p>
        <p className="text-sm text-gray-600">{`النسبة: ${((data.value / data.total) * 100).toFixed(1)}%`}</p>
      </div>
    )
  }
  return null
}

export default function EnhancedChart() {
  const dispatch = useDispatch<AppDispatch>()
  const { data, loading } = useSelector((state: RootState) => state.stats)

  useEffect(() => {
    dispatch(fetchAllStats())
  }, [dispatch])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-0 shadow-lg">
          <CardContent className="flex items-center justify-center h-[400px]">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg">جاري التحميل...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const barChartData = [
    {
      period: "اليوم",
      المشغلين: data.operateurs.today,
      السائقين: data.chauffeurs.today,
      المركبات: data.vehicules.today,
    },
    {
      period: "الشهر",
      المشغلين: data.operateurs.thisMonth,
      السائقين: data.chauffeurs.thisMonth,
      المركبات: data.vehicules.thisMonth,
    },
    {
      period: "السنة",
      المشغلين: data.operateurs.thisYear,
      السائقين: data.chauffeurs.thisYear,
      المركبات: data.vehicules.thisYear,
    },
  ]

  const totalThisMonth = data.operateurs.thisMonth + data.chauffeurs.thisMonth + data.vehicules.thisMonth

  const pieChartData = [
    {
      name: "المشغلين",
      value: data.operateurs.thisMonth,
      color: COLORS[0],
      total: totalThisMonth,
    },
    {
      name: "السائقين",
      value: data.chauffeurs.thisMonth,
      color: COLORS[1],
      total: totalThisMonth,
    },
    {
      name: "المركبات",
      value: data.vehicules.thisMonth,
      color: COLORS[2],
      total: totalThisMonth,
    },
  ]

  return (
    <div className="space-y-2">


      {/* Charts */}
      <Tabs defaultValue="bar" className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="grid grid-cols-3 w-[600px] h-14 bg-white shadow-lg border-0 rounded-xl">
            <TabsTrigger
              value="bar"
              className="text-lg font-semibold gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              <BarChart3 className="w-5 h-5" />📊 الأعمدة
            </TabsTrigger>
            <TabsTrigger
              value="line"
              className="text-lg font-semibold gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              <TrendingUp className="w-5 h-5" />📈 الخط البياني
            </TabsTrigger>
            <TabsTrigger
              value="pie"
              className="text-lg font-semibold gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              <Users className="w-5 h-5" />🥧 الدائري
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="bar" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex items-center gap-2 text-blue-800 text-xl">
                <BarChart3 className="h-6 w-6" />
                مقارنة الإحصائيات
              </CardTitle>
              <CardDescription className="text-blue-600 text-base">
                مقارنة أعداد المشغلين والسائقين والمركبات عبر الفترات الزمنية
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" tick={{ fontSize: 14, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 14, fill: "#6b7280" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="المشغلين" fill={COLORS[0]} radius={[6, 6, 0, 0]} name="المشغلين" />
                  <Bar dataKey="السائقين" fill={COLORS[1]} radius={[6, 6, 0, 0]} name="السائقين" />
                  <Bar dataKey="المركبات" fill={COLORS[2]} radius={[6, 6, 0, 0]} name="المركبات" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="line" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardTitle className="flex items-center gap-2 text-green-800 text-xl">
                <TrendingUp className="h-6 w-6" />
                اتجاه النمو
              </CardTitle>
              <CardDescription className="text-green-600 text-base">
                تتبع نمو الأعداد عبر الفترات الزمنية
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" tick={{ fontSize: 14, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 14, fill: "#6b7280" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="المشغلين"
                    stroke={COLORS[0]}
                    strokeWidth={4}
                    dot={{ r: 6, fill: COLORS[0], strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 8, fill: COLORS[0], strokeWidth: 2, stroke: "#fff" }}
                    name="المشغلين"
                  />
                  <Line
                    type="monotone"
                    dataKey="السائقين"
                    stroke={COLORS[1]}
                    strokeWidth={4}
                    dot={{ r: 6, fill: COLORS[1], strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 8, fill: COLORS[1], strokeWidth: 2, stroke: "#fff" }}
                    name="السائقين"
                  />
                  <Line
                    type="monotone"
                    dataKey="المركبات"
                    stroke={COLORS[2]}
                    strokeWidth={4}
                    dot={{ r: 6, fill: COLORS[2], strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 8, fill: COLORS[2], strokeWidth: 2, stroke: "#fff" }}
                    name="المركبات"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pie" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2 text-purple-800 text-xl">
                <Users className="h-6 w-6" />
                التوزيع الشهري
              </CardTitle>
              <CardDescription className="text-purple-600 text-base">
                توزيع الأعداد لهذا الشهر - المجموع: {totalThisMonth.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
