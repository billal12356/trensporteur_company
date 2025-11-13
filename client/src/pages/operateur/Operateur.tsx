"use client"

import React from "react"
import type { ReactElement } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Download, RefreshCw, Users, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { Helmet } from "react-helmet-async"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MainContainer from "@/components/MainContainer"

import { useListPage } from "@/hooks/useListPage"
import { ListTable, useTableColumns, useTableActions } from "@/components"
import { deleteOperateur, exportOperateurs, fetchOperateurs } from "@/redux/slice/operateurSlice"
import { formatters } from "@/lib/formatters"

const EnhancedOperateur = React.memo((): ReactElement => {
  const navigate = useNavigate()

  const {
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    loading,
    isExporting,
    data: operateurs,
    total,
    limit,
  // pagination returned by the hook is available if needed later
    handleDelete,
    handleExport,
    handleRefresh,
  } = useListPage({
    fetchThunk: fetchOperateurs,
    deleteThunk: deleteOperateur,
    exportThunk: exportOperateurs,
    stateSelector: (state) => ({
      data: state.operateur.operateurs,
      total: state.operateur.total,
      loading: state.operateur.loading,
      limit: 10,
    }),
    limit: 10,
  })

  const colsBuilder = useTableColumns<any>()

  // Define columns using a mapping to keep file compact and maintainable
  const columnDefinitions: Array<[keyof any, string]> = [
    ["num_wilaya", "رقم الولاية"],
    ["num_docier_client", "رقم ملف المتعامل"],
    ["fullName_arabe", "اسم ولقب المتعامل (بالعربية)"],
    ["fullName_francais", "اسم ولقب المتعامل (بالفرنسية)"],
    ["date_expiration", "تاريخ انتهاء الصلاحية"],
    ["date_prévue", "تاريخ المقررة"],
    ["num_dhoraire", "رقم المقررة"],
    ["num_cate_enregistement", "رقم بطاقة القيد"],
    ["activite", "النشاط"],
    ["colonne1", "عمود 1"],
    ["nature_activite", "طبيعة النشاط"],
    ["colonne2", "عمود 2"],
    ["status_activite", "حالة النشاط"],
    ["colonne3", "عمود 3"],
    ["type_client", "نوع المتعامل"],
    ["colonne4", "عمود 4"],
    ["institution_person_moral", "شكل الشركة أو المؤسسة"],
    ["fullName_gerent_person_moral", "اسم ولقب المسير"],
    ["num_dacte_naissance", "رقم شهادة الميلاد"],
    ["num_didentification_national_NIN", "رقم التعريف الوطني NIN"],
    ["date_naissance", "تاريخ الميلاد"],
    ["lieu_naissance_arabe", "مكان الميلاد (عربي)"],
    ["lieu_naissance_francais", "مكان الميلاد (فرنسي)"],
    ["nom_pere_arabe", "اسم الأب (عربي)"],
    ["nom_pere_francais", "اسم الأب (فرنسي)"],
    ["fullName_mere_arabe", "اسم الأم (عربي)"],
    ["fullName_mere_francais", "اسم الأم (فرنسي)"],
    ["communes_naissance_arabe", "بلدية الميلاد (عربي)"],
    ["communes_naissance_francais", "بلدية الميلاد (فرنسي)"],
    ["address_arabe", "العنوان (عربي)"],
    ["address_francais", "العنوان (فرنسي)"],
    ["address_municipalité_arabe", "بلدية العنوان (عربي)"],
    ["address_municipalité_francais", "بلدية العنوان (فرنسي)"],
    ["num_registre_commerce", "رقم السجل التجاري"],
    ["num_registre_commerce_n5", "رقم السجل التجاري الفرعي"],
    ["hestoire_registre_commerce", "تاريخ تسجيل السجل التجاري"],
    ["modifier_hestoire_registre_commerce", "تاريخ تحديث السجل التجاري"],
    ["date_debut_activite", "تاريخ بدء النشاط"],
    ["num_adherent_caise_national_non_salaire", "رقم الانتساب للصندوق الوطني"],
    ["depend_activite", "هل يعتمد النشاط"],
    ["type_depend", "نوع الاعتماد"],
    ["date_arret_activite_temporaire", "تاريخ إيقاف النشاط مؤقتاً"],
    ["date_arret_activite_permanent", "تاريخ إيقاف النشاط نهائياً"],
    ["num_telephone_client", "رقم هاتف المتعامل"],
    ["soccupe", "المعني بالتحديث"],
    ["note_chef_departement", "ملاحظات رئيس المصلحة"],
  ]

  const columns = columnDefinitions.map(([key, label]) => {
    const keyStr = String(key)
    if (keyStr.toLowerCase().includes("date") || keyStr.toLowerCase().includes("hestoire")) {
      return colsBuilder.date(key, label, true)
    }
    if (keyStr.includes("status")) {
      return colsBuilder.custom(key, label, (val: any) => {
        const badge = formatters.status(val)
        // formatters.status returns an object { variant, label }
        // convert to a Badge UI element here to satisfy ListTable render requirement
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            badge.variant === "default"
              ? "bg-green-100 text-green-800"
              : badge.variant === "secondary"
              ? "bg-yellow-100 text-yellow-800"
              : badge.variant === "destructive"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}>
            {badge.label}
          </span>
        )
      })
    }
    if (keyStr.includes("num_telephone")) {
      return colsBuilder.custom(key, label, (val: any) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{val}</span>
        </div>
      ))
    }
    // Default to text column
    return colsBuilder.text(key, label, true)
  })

  const actions = useTableActions<any>(
    (item) => navigate(`/update-operateur/${item._id}`),
    (item) => navigate(`/details-operateur/${item._id}`),
    (item) => handleDelete(item._id)
  )

  return (
    <MainContainer>
      <Helmet>
        <title>مديرية النقل - قائمة المتعاملين</title>
        <meta name="description" content="إدارة وعرض بيانات المتعاملين في نظام مديرية النقل" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
        <div className="container mx-auto p-6 space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                قائمة المتعاملين
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">إدارة وعرض بيانات المتعاملين المسجلين في نظام مديرية النقل</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
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
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="gap-2 bg-transparent">
                      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                      تحديث
                    </Button>
                    <Button onClick={handleExport} disabled={isExporting} className="gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                      <Download className="w-4 h-4" />
                      {isExporting ? "جاري التصدير..." : "تصدير Excel"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="text-blue-800 text-xl flex items-center gap-2">
                  <Users className="w-6 h-6" /> بيانات المتعاملين
                </CardTitle>
                <CardDescription className="text-blue-600">عرض تفصيلي لجميع المتعاملين المسجلين في النظام</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  {/* Use the generic ListTable component */}
                  <ListTable
                    columns={columns}
                    data={operateurs}
                    isLoading={loading}
                    isEmpty={!loading && operateurs.length === 0}
                    emptyMessage="لا توجد نتائج"
                    actions={actions}
                    pagination={{ page, total, limit, onPageChange: setPage }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainContainer>
  )
})

export default EnhancedOperateur
