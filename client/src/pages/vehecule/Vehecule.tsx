"use client"

import React from "react"
import type { ReactElement } from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Search,
  Download,
  Trash2,
  Edit3,
  Filter,
  RefreshCw,
  Truck,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AppDispatch, RootState } from "@/redux/store"
import { exportVihicules, fetchVihicules } from "@/redux/slice/vihiculeSlice"
import { logout } from "@/redux/slice/authSlice"
import MainContainer from "@/components/MainContainer"

const EnhancedVehicle = React.memo((): ReactElement => {
  const dispatch = useDispatch<AppDispatch>()
  const { vihicules, totalVc, loading, limit, error } = useSelector((state: RootState) => state.vihicule)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    dispatch(fetchVihicules({ search: searchQuery, page, limit: 10 }))
  }, [dispatch, searchQuery, page])

  const handleSignout = () => {
    dispatch(logout())
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await dispatch(exportVihicules({ search: searchQuery }))
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefresh = () => {
    dispatch(fetchVihicules({ search: searchQuery, page, limit: 10 }))
  }

  const handlePrev = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNext = () => {
    if (page < Math.ceil(totalVc / limit)) {
      setPage(page + 1)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-DZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      active: { variant: "default", label: "نشط" },
      inactive: { variant: "secondary", label: "غير نشط" },
      suspended: { variant: "destructive", label: "معلق" },
      stopped: { variant: "destructive", label: "متوقف" },
    }
    const statusInfo = statusMap[status] || { variant: "outline" as const, label: status || "غير محدد" }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (error) {
    return (
      <MainContainer>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center space-y-4">
            <div className="text-red-600 text-xl font-bold">حدث خطأ في تحميل البيانات</div>
            <Button onClick={handleSignout} variant="destructive">
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </MainContainer>
    )
  }

  return (
    <MainContainer>
      <Helmet>
        <title>مديرية النقل - قائمة المركبات</title>
        <meta name="description" content="إدارة وعرض بيانات المركبات في نظام مديرية النقل" />
        <link
          rel="icon"
          type="image/png"
          href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s"
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
        <div className="container mx-auto p-6 space-y-8">
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                قائمة المركبات
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              إدارة وعرض بيانات المركبات المسجلة في نظام مديرية النقل
            </p>
          </motion.div>

          {/* Controls Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  {/* Search Section */}
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="البحث في المركبات..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg text-right"
                      />
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={loading}
                      className="gap-2 bg-transparent"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                      تحديث
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Filter className="w-4 h-4" />
                      فلترة
                    </Button>
                    <Button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      {isExporting ? "جاري التصدير..." : "تصدير Excel"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Table Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="text-blue-800 text-xl flex items-center gap-2">
                  <Truck className="w-6 h-6" />
                  بيانات المركبات
                </CardTitle>
                <CardDescription className="text-blue-600">عرض تفصيلي لجميع المركبات المسجلة في النظام</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-right font-bold text-gray-700">رقم الولاية</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">رقم ملف المتعامل</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">اسم المتعامل (عربي)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">اسم المتعامل (فرنسي)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">النشاط</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">طبيعة النشاط</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">حالة النشاط</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">رقم تسجيل المركبة</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">الدائرة</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">البلدية</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">الطراز</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">الصنف</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">النوع</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">أول سنة استعمال</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">عدد المقاعد</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">الطاقة</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">رقم رخصة السير</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ رخصة السير</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">مدة صلاحية الرخصة</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ بداية نشاط الخط</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ بداية نشاط المركبة</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">نوع الخط</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">رمز الخط</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">نقطة الانطلاق</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">نقطة الوصول</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">نقطة المرور 1</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">نقطة المرور 2</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">نقطة المرور 3</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">نقطة المرور 4</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">نقطة المرور 5</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">توقيت بداية الخط</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">توقيت نهاية الخدمة</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">الوتيرة بالدقائق</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ الانطلاق 1</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ الانطلاق 2</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ الانطلاق 3</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ الانطلاق 4</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">حالة المركبة</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">نوع التوقف</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ التوقف</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ نهاية التوقف</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">ملاحظات</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">المعني بالتحديث</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">ملاحظات رئيس المصلحة</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">المسار</TableHead>
                        <TableHead className="text-center font-bold text-gray-700">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {loading ? (
                          // Loading Skeletons
                          Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={`skeleton-${index}`}>
                              {Array.from({ length: 45 }).map((_, cellIndex) => (
                                <TableCell key={cellIndex}>
                                  <Skeleton className="h-4 w-full" />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : vihicules.length > 0 ? (
                          vihicules.map((vihicule, index) => (
                            <motion.tr
                              key={vihicule._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-blue-50/50 transition-colors gap-2"
                            >
                              <TableCell className="font-medium">{vihicule.num_wilaya}</TableCell>
                              <TableCell>{vihicule.num_docier_client}</TableCell>
                              <TableCell className="font-medium text-blue-900">{vihicule.fullName_arabe}</TableCell>
                              <TableCell className="text-gray-600">{vihicule.fullName_francais}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{vihicule.activite}</Badge>
                              </TableCell>
                              <TableCell>{vihicule.nature_activite}</TableCell>
                              <TableCell>{getStatusBadge(vihicule.status_activite)}</TableCell>
                              <TableCell className="font-mono text-sm">{vihicule.num_bus_registration}</TableCell>
                              <TableCell>{vihicule.circle || ""}</TableCell>
                              <TableCell>{vihicule.Municipality || ""}</TableCell>
                              <TableCell>{vihicule.Style || ""}</TableCell>
                              <TableCell>{vihicule.category}</TableCell>
                              <TableCell>{vihicule.type}</TableCell>
                              <TableCell>{vihicule.First_year_of_use}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <span>{vihicule.Number_of_seats}</span>
                                  <span className="text-xs text-gray-500">مقعد</span>
                                </div>
                              </TableCell>
                              <TableCell>{vihicule.Energy}</TableCell>
                              <TableCell className="font-mono text-sm">{vihicule.num_driving_license}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm">{formatDate(vihicule.driving_license_history)}</span>
                                </div>
                              </TableCell>
                              <TableCell>{vihicule.driving_license_dure}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm">{formatDate(vihicule.line_activity_start_date)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm">{formatDate(vihicule.Vehicle_activity_start_date)}</span>
                                </div>
                              </TableCell>
                              <TableCell>{vihicule.font_type}</TableCell>
                              <TableCell className="font-mono">{vihicule.font_symbol}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-green-500" />
                                  <span className="text-sm">{vihicule.point_depart}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-red-500" />
                                  <span className="text-sm">{vihicule.point_arrive}</span>
                                </div>
                              </TableCell>
                              <TableCell>{vihicule.point_Traffic1}</TableCell>
                              <TableCell>{vihicule.point_Traffic2}</TableCell>
                              <TableCell>{vihicule.point_Traffic3}</TableCell>
                              <TableCell>{vihicule.point_Traffic4}</TableCell>
                              <TableCell>{vihicule.point_Traffic5}</TableCell>
                              <TableCell>{vihicule.line_start_time || ""}</TableCell>
                              <TableCell>{vihicule.line_end_time || ""}</TableCell>
                              <TableCell>{vihicule.Pace_per_minute || ""}</TableCell>
                              <TableCell>{vihicule.time_depart1}</TableCell>
                              <TableCell>{vihicule.time_depart2}</TableCell>
                              <TableCell>{vihicule.time_depart3 || ""}</TableCell>
                              <TableCell>{vihicule.time_depart4 || ""}</TableCell>
                              <TableCell>{getStatusBadge(vihicule.vihicile_parked || "")}</TableCell>
                              <TableCell>{vihicule.type_parked}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm">{formatDate(vihicule.hestoire_parked)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm">{formatDate(vihicule.hestoire_parked_end)}</span>
                                </div>
                              </TableCell>
                              <TableCell>{vihicule.comments}</TableCell>
                              <TableCell>{vihicule.person_concerned}</TableCell>
                              <TableCell>{vihicule.note_chef_departement || ""}</TableCell>
                              <TableCell>{vihicule.path}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 justify-center">
                                  <Button variant="destructive" size="sm" className="p-2">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="p-2 bg-transparent" asChild>
                                    <Link to={`/update-vihicule/${vihicule._id}`}>
                                      <Edit3 className="w-4 h-4 text-yellow-600" />
                                    </Link>
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={45} className="text-center py-12">
                              <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-gray-100 rounded-full">
                                  <Truck className="w-12 h-12 text-gray-400" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-700">لا توجد نتائج</h3>
                                  <p className="text-gray-500">لم يتم العثور على أي مركبات</p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pagination Section */}
          {vihicules.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      عرض <span className="font-medium">{(page - 1) * limit + 1}</span> إلى{" "}
                      <span className="font-medium">{Math.min(page * limit, totalVc)}</span> من{" "}
                      <span className="font-medium">{totalVc}</span> نتيجة
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNext}
                        disabled={page >= Math.ceil(totalVc / limit)}
                        className="gap-2 bg-transparent"
                      >
                        <ChevronRight className="w-4 h-4" />
                        التالي
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, Math.ceil(totalVc / limit)) }, (_, i) => {
                          const pageNum = i + 1
                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrev}
                        disabled={page === 1}
                        className="gap-2 bg-transparent"
                      >
                        السابق
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </MainContainer>
  )
})

export default EnhancedVehicle
