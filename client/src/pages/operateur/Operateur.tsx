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
  Users,
  ChevronLeft,
  ChevronRight,
  Phone,
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
import { deleteOperateur, exportOperateurs, fetchOperateurs } from "@/redux/slice/operateurSlice"
import MainContainer from "@/components/MainContainer"

const EnhancedOperateur = React.memo((): ReactElement => {
  const dispatch = useDispatch<AppDispatch>()
  const { operateurs, loading, total, limit } = useSelector((state: RootState) => state.operateur)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    dispatch(fetchOperateurs({ search: searchQuery, page, limit: 10 }))
  }, [dispatch, searchQuery, page])

  const handleDelete = async (id: string) => {
    await dispatch(deleteOperateur(id))
    // Refresh the data after deletion
    dispatch(fetchOperateurs({ search: searchQuery, page, limit: 10 }))
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await dispatch(exportOperateurs({ search: searchQuery }))
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefresh = () => {
    dispatch(fetchOperateurs({ search: searchQuery, page, limit: 10 }))
  }

  const handlePrev = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNext = () => {
    if (page < Math.ceil(total / limit)) {
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
    }
    const statusInfo = statusMap[status] || { variant: "outline" as const, label: status || "غير محدد" }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  return (
    <MainContainer>
      <Helmet>
        <title>مديرية النقل - قائمة المتعاملين</title>
        <meta name="description" content="إدارة وعرض بيانات المتعاملين في نظام مديرية النقل" />
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
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                قائمة المتعاملين
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              إدارة وعرض بيانات المتعاملين المسجلين في نظام مديرية النقل
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
                        placeholder="البحث في المتعاملين..."
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
                  <Users className="w-6 h-6" />
                  بيانات المتعاملين
                </CardTitle>
                <CardDescription className="text-blue-600">
                  عرض تفصيلي لجميع المتعاملين المسجلين في النظام
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-right font-bold text-gray-700">رقم الولاية</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">رقم ملف المتعامل</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">
                          اسم ولقب المتعامل (بالعربية)
                        </TableHead>
                        <TableHead className="text-right font-bold text-gray-700">
                          اسم ولقب المتعامل (بالفرنسية)
                        </TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ انتهاء الصلاحية</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ المقررة</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">رقم المقررة</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">رقم بطاقة القيد</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">النشاط</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">العمود 1</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">طبيعة النشاط</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">العمود 2</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">حالة النشاط</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">العمود 3</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">نوع المتعامل</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">العمود 4</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">شكل الشركة أو المؤسسة</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">اسم ولقب المسير</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">رقم شهادة الميلاد</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">الرقم الوطني للتعريف (NIN)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ الميلاد</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">مكان الميلاد (بالعربية)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">مكان الميلاد (بالفرنسية)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">اسم الأب (بالعربية)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">اسم الأب (بالفرنسية)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">اسم ولقب الأم (بالعربية)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">اسم ولقب الأم (بالفرنسية)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">بلدية الميلاد (بالعربية)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">بلدية الميلاد (بالفرنسية)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">العنوان (بالعربية)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">العنوان (بالفرنسية)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">بلدية العنوان (بالعربية)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">بلدية العنوان (بالفرنسية)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">رقم السجل التجاري</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">الرقم الفرعي للسجل التجاري</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ السجل التجاري</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ تعديل السجل التجاري</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">تاريخ بدء النشاط</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">
                          رقم الانتساب إلى الصندوق الوطني للعمال غير الأجراء
                        </TableHead>
                        <TableHead className="text-right font-bold text-gray-700">حالة النشاط (متوقف أم لا)</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">نوع التوقف</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">
                          تاريخ التوقف المؤقت عن النشاط
                        </TableHead>
                        <TableHead className="text-right font-bold text-gray-700">
                          تاريخ التوقف النهائي عن النشاط
                        </TableHead>
                        <TableHead className="text-right font-bold text-gray-700">رقم هاتف المتعامل</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">المعني بالتحديث</TableHead>
                        <TableHead className="text-right font-bold text-gray-700">ملاحظات رئيس المصلحة</TableHead>
                        <TableHead className="text-center font-bold text-gray-700">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {loading ? (
                          // Loading Skeletons
                          Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={`skeleton-${index}`}>
                              {Array.from({ length: 46 }).map((_, cellIndex) => (
                                <TableCell key={cellIndex}>
                                  <Skeleton className="h-4 w-full" />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : operateurs.length > 0 ? (
                          operateurs.map((operateur, index) => (
                            <motion.tr
                              key={operateur._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-blue-50/50 transition-colors"
                            >
                              <TableCell className="font-medium">{operateur.num_wilaya}</TableCell>
                              <TableCell>{operateur.num_docier_client}</TableCell>
                              <TableCell className="font-medium text-blue-900">{operateur.fullName_arabe}</TableCell>
                              <TableCell className="text-gray-600">{operateur.fullName_francais}</TableCell>
                              <TableCell>{formatDate(operateur.date_expiration)}</TableCell>
                              <TableCell>{formatDate(operateur.date_prévue)}</TableCell>
                              <TableCell>{operateur.num_dhoraire}</TableCell>
                              <TableCell>{operateur.num_cate_enregistement}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{operateur.activite}</Badge>
                              </TableCell>
                              <TableCell>{operateur.colonne1 || ""}</TableCell>
                              <TableCell>{operateur.nature_activite}</TableCell>
                              <TableCell>{operateur.colonne2 || ""}</TableCell>
                              <TableCell>{getStatusBadge(operateur.status_activite)}</TableCell>
                              <TableCell>{operateur.colonne3 || ""}</TableCell>
                              <TableCell>{operateur.type_client}</TableCell>
                              <TableCell>{operateur.colonne4 || ""}</TableCell>
                              <TableCell>{operateur.institution_person_moral}</TableCell>
                              <TableCell>{operateur.fullName_gerent_person_moral}</TableCell>
                              <TableCell>{operateur.num_dacte_naissance}</TableCell>
                              <TableCell>{operateur.num_didentification_national_NIN}</TableCell>
                              <TableCell>{formatDate(operateur.date_naissance)}</TableCell>
                              <TableCell>{operateur.lieu_naissance_arabe}</TableCell>
                              <TableCell>{operateur.lieu_naissance_francais}</TableCell>
                              <TableCell>{operateur.nom_pere_arabe}</TableCell>
                              <TableCell>{operateur.nom_pere_francais}</TableCell>
                              <TableCell>{operateur.fullName_mere_arabe}</TableCell>
                              <TableCell>{operateur.fullName_mere_francais}</TableCell>
                              <TableCell>{operateur.communes_naissance_arabe}</TableCell>
                              <TableCell>{operateur.communes_naissance_francais}</TableCell>
                              <TableCell>{operateur.address_arabe}</TableCell>
                              <TableCell>{operateur.address_francais}</TableCell>
                              <TableCell>{operateur.address_municipalité_arabe}</TableCell>
                              <TableCell>{operateur.address_municipalité_francais}</TableCell>
                              <TableCell>{operateur.num_registre_commerce}</TableCell>
                              <TableCell>{operateur.num_registre_commerce_n5}</TableCell>
                              <TableCell>{formatDate(operateur.hestoire_registre_commerce)}</TableCell>
                              <TableCell>{formatDate(operateur.modifier_hestoire_registre_commerce)}</TableCell>
                              <TableCell>{formatDate(operateur.date_debut_activite)}</TableCell>
                              <TableCell>{operateur.num_adherent_caise_national_non_salaire}</TableCell>
                              <TableCell>{operateur.depend_activite}</TableCell>
                              <TableCell>{operateur.type_depend}</TableCell>
                              <TableCell>{formatDate(operateur.date_arret_activite_temporaire)}</TableCell>
                              <TableCell>{formatDate(operateur.date_arret_activite_permanent)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm">{operateur.num_telephone_client}</span>
                                </div>
                              </TableCell>
                              <TableCell>{operateur.soccupe}</TableCell>
                              <TableCell>{operateur.note_chef_departement}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 justify-center">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(operateur._id)}
                                    className="p-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  <Button variant="default" size="sm" className="p-2" asChild>
                                    <Link to={`/details-operateur/${operateur._id}`}>
                                      <Eye className="w-4 h-4" />
                                    </Link>
                                  </Button>
                                  <Button variant="outline" size="sm" className="p-2 bg-transparent" asChild>
                                    <Link to={`/update-operateur/${operateur._id}`}>
                                      <Edit3 className="w-4 h-4 text-yellow-600" />
                                    </Link>
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={46} className="text-center py-12">
                              <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-gray-100 rounded-full">
                                  <Users className="w-12 h-12 text-gray-400" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-700">لا توجد نتائج</h3>
                                  <p className="text-gray-500">لم يتم العثور على أي مشغلين</p>
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
          {operateurs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      عرض <span className="font-medium">{(page - 1) * limit + 1}</span> إلى{" "}
                      <span className="font-medium">{Math.min(page * limit, total)}</span> من{" "}
                      <span className="font-medium">{total}</span> نتيجة
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNext}
                        disabled={page >= Math.ceil(total / limit)}
                        className="gap-2 bg-transparent"
                      >
                        <ChevronRight className="w-4 h-4" />
                        التالي
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, Math.ceil(total / limit)) }, (_, i) => {
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

export default EnhancedOperateur
