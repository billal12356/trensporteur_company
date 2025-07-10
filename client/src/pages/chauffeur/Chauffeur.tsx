"use client"

import React from "react"
import type { ReactElement } from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Search,
  Download,
  Trash2,
  Eye,
  Edit3,
  Filter,
  RefreshCw,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Car,
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
import { deleteChauffeurs, exportChauffeurs, fetchChauffeurs } from "@/redux/slice/chauffeurSlice"
import MainContainer from "@/components/MainContainer"
import logo from "@/assets/images.png"

const EnhancedChauffeur = React.memo((): ReactElement => {
  const dispatch = useDispatch<AppDispatch>()
  const { chauffeurs, loading, totalCh, limit } = useSelector((state: RootState) => state.chauffeur)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    dispatch(fetchChauffeurs({ search: searchQuery, page, limit: 10 }))
  }, [dispatch, searchQuery, page])

  const handleDelete = async (id: string) => {
    await dispatch(deleteChauffeurs(id))
    // Refresh the data after deletion
    dispatch(fetchChauffeurs({ search: searchQuery, page, limit: 10 }))
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await dispatch(exportChauffeurs({ search: searchQuery }))
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefresh = () => {
    dispatch(fetchChauffeurs({ search: searchQuery, page, limit: 10 }))
  }

  const handlePrev = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNext = () => {
    if (page < Math.ceil(totalCh / limit)) {
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

  return (
    <MainContainer>
      <Helmet>
        <title>مديرية النقل - قائمة السائقين</title>
        <meta name="description" content="إدارة وعرض بيانات السائقين في نظام مديرية النقل" />
        <link rel="icon" type="image/png" href={logo} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
        <div className="container mx-auto p-6 space-y-8">
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                قائمة السائقين
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              إدارة وعرض بيانات السائقين المسجلين في نظام مديرية النقل
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
                        placeholder="البحث في السائقين..."
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
                  <UserCheck className="w-6 h-6" />
                  بيانات السائقين
                </CardTitle>
                <CardDescription className="text-blue-600">
                  عرض تفصيلي لجميع السائقين المسجلين في النظام
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-right font-bold text-gray-700">رقم المستخدم</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">رقم الطلب</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ الطلب</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">رقم القيد للناقل</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">المتعامل</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">الخط المستغل</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">ترقيم المركبة</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">طبيعة الخط</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">اسم و لقب السائق</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">طبيعة المستخدم</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">رقم التعريف الوطني NIN</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">رقم رخصة السياقة</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ الاصدار</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">نهاية صلاحية الصنف</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">بلدية الاصدار</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ الميلاد</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">مكان الميلاد</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">العنوان</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">رقم شهادة الكفائة المهنية</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">
                          تاريخ الحصول على شهادة الكفاءة
                        </TableHead>
                        <TableHead className="text-right font-bold text-gray-700">الولاية</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">الرقم التسلسلي</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">
                          رقم الانتساب الى الصندوق الوطني
                        </TableHead>
                        <TableHead className="text-right font-bold text-gray-700">المركبة (موقفة او لا)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">نوع التوقف</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">ملاحظة</TableHead>
                        <TableHead className="text-center font-bold text-gray-700">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {loading ? (
                          // Loading Skeletons
                          Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={`skeleton-${index}`}>
                              {Array.from({ length: 27 }).map((_, cellIndex) => (
                                <TableCell key={cellIndex}>
                                  <Skeleton className="h-4 w-full" />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : chauffeurs.length > 0 ? (
                          chauffeurs.map((chauffeur, index) => (
                            <motion.tr
                              key={chauffeur._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-blue-50/50 transition-colors"
                            >
                              <TableCell className="font-medium">{chauffeur.num_chauffeur}</TableCell>
                              <TableCell>{chauffeur.num_demende}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm">{formatDate(chauffeur.hestoire_demende)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {chauffeur.num_enregistrement_du_transporteur}
                              </TableCell>
                              <TableCell className="font-medium text-blue-900">{chauffeur.operateur}</TableCell>
                              <TableCell>{chauffeur.ligne_exploitée}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Car className="w-3 h-3 text-gray-400" />
                                  <span className="font-mono text-sm">{chauffeur.num_vehicule}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{chauffeur.nature_ligne}</Badge>
                              </TableCell>
                              <TableCell className="font-medium text-blue-900">
                                {chauffeur.nom_prenom_chauffeur}
                              </TableCell>
                              <TableCell>{chauffeur.nature_utilisateur}</TableCell>
                              <TableCell className="font-mono text-sm">
                                {chauffeur.num_didentification_national_NIN}
                              </TableCell>
                              <TableCell className="font-mono text-sm">{chauffeur.num_permis_conduire}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm">{formatDate(chauffeur.date_sortie)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-red-400" />
                                  <span className="text-sm">{formatDate(chauffeur.date_expiration_article)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm">{chauffeur.municipalite_emettrice}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm">{formatDate(chauffeur.date_naissance)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-green-500" />
                                  <span className="text-sm">{chauffeur.lieu_naissance}</span>
                                </div>
                              </TableCell>
                              <TableCell>{chauffeur.address}</TableCell>
                              <TableCell className="font-mono text-sm">
                                {chauffeur.Num_certificat_compétence_professionnelle}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-blue-400" />
                                  <span className="text-sm">
                                    {formatDate(chauffeur.date_obtention_certificat_aptitude_professionnelle)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{chauffeur.wilaya}</TableCell>
                              <TableCell className="font-mono text-sm">{chauffeur.num_serie}</TableCell>
                              <TableCell className="font-mono text-sm">{chauffeur.num_membre_fonds_national}</TableCell>
                              <TableCell>{getStatusBadge(chauffeur.vihicile_parked)}</TableCell>
                              <TableCell>{chauffeur.type_parked}</TableCell>
                              <TableCell>{chauffeur.comments}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 justify-center">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(chauffeur._id)}
                                    className="p-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  <Button variant="default" size="sm" className="p-2" asChild>
                                    <Link to={`/details-chauffeur/${chauffeur._id}`}>
                                      <Eye className="w-4 h-4" />
                                    </Link>
                                  </Button>
                                  <Button variant="outline" size="sm" className="p-2 bg-transparent" asChild>
                                    <Link to={`/update-chauffeur/${chauffeur._id}`}>
                                      <Edit3 className="w-4 h-4 text-yellow-600" />
                                    </Link>
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={27} className="text-center py-12">
                              <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-gray-100 rounded-full">
                                  <UserCheck className="w-12 h-12 text-gray-400" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-700">لا توجد نتائج</h3>
                                  <p className="text-gray-500">لم يتم العثور على أي سائقين</p>
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
          {chauffeurs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      عرض <span className="font-medium">{(page - 1) * limit + 1}</span> إلى{" "}
                      <span className="font-medium">{Math.min(page * limit, totalCh)}</span> من{" "}
                      <span className="font-medium">{totalCh}</span> نتيجة
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNext}
                        disabled={page >= Math.ceil(totalCh / limit)}
                        className="gap-2 bg-transparent"
                      >
                        <ChevronRight className="w-4 h-4" />
                        التالي
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, Math.ceil(totalCh / limit)) }, (_, i) => {
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

export default EnhancedChauffeur
