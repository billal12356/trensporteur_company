"use client"

import React, { useEffect } from "react"
import type { ReactElement } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Download, RefreshCw, UserCheck, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { Helmet } from "react-helmet-async"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import MainContainer from "@/components/MainContainer"
import logo from "@/assets/images.png"

import { useListPage } from "@/hooks/useListPage"
import { ListTable, useTableColumns, useTableActions } from "@/components"
import { deleteChauffeurs, exportChauffeurs, fetchChauffeurs } from "@/redux/slice/chauffeurSlice"
import { formatters } from "@/lib/formatters"
import { useUser } from "@/hooks/context/userContext/UserProvider"

const EnhancedChauffeur = React.memo((): ReactElement => {
  const navigate = useNavigate()
  const { userData } = useUser()

  const {
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    loading,
    isExporting,
    data: chauffeurs,
    total: totalCh,
    limit,
    handleDelete,
    handleExport,
    handleRefresh,
  } = useListPage({
    fetchThunk: fetchChauffeurs,
    deleteThunk: deleteChauffeurs,
    exportThunk: exportChauffeurs,
    stateSelector: (state) => ({
      data: state.chauffeur.chauffeurs,
      total: state.chauffeur.totalCh,
      loading: state.chauffeur.loading,
      limit: 10,
    }),
    limit: 10,
  })

  const colsBuilder = useTableColumns<any>()
  useEffect(() => {
    // Scroll to the top of the page when the component is mounted
    window.scrollTo(0, 0);
  }, []);

  const columnDefinitions: Array<[keyof any, string]> = [
    ["num_chauffeur", "رقم المستخدم"],
    ["num_demende", "رقم الطلب"],
    ["hestoire_demende", "تاريخ الطلب"],
    ["num_enregistrement_du_transporteur", "رقم القيد للناقل"],
    ["operateur", "المتعامل"],
    ["ligne_exploitée", "الخط المستغل"],
    ["num_vehicule", "ترقيم المركبة"],
    ["nature_ligne", "طبيعة الخط"],
    ["nom_prenom_chauffeur", "اسم و لقب السائق"],
    ["nature_utilisateur", "طبيعة المستخدم"],
    ["num_didentification_national_NIN", "رقم التعريف الوطني NIN"],
    ["num_permis_conduire", "رقم رخصة السياقة"],
    ["date_sortie", "تاريخ الاصدار"],
    ["date_expiration_article", "نهاية صلاحية الصنف"],
    ["municipalite_emettrice", "بلدية الاصدار"],
    ["date_naissance", "تاريخ الميلاد"],
    ["lieu_naissance", "مكان الميلاد"],
    ["address", "العنوان"],
    ["Num_certificat_compétence_professionnelle", "رقم شهادة الكفائة المهنية"],
    ["date_obtention_certificat_aptitude_professionnelle", "تاريخ الحصول على شهادة الكفاءة"],
    ["wilaya", "الولاية"],
    ["num_serie", "الرقم التسلسلي"],
    ["num_membre_fonds_national", "رقم الانتساب الى الصندوق الوطني"],
    ["vihicile_parked", "المركبة (موقفة او لا)"],
    ["type_parked", "نوع التوقف"],
    ["comments", "ملاحظة"],
    ["createdAt", "تاريخ الإنشاء"],
    ["createdBy", "أنشئ بواسطة"],
  ]

  let filteredColumnDefinitions = columnDefinitions
  if (userData?.role !== "admin" && userData?.role !== "manager") {
    filteredColumnDefinitions = filteredColumnDefinitions.filter(([key]) => key !== "createdBy")
  }

  const columns = filteredColumnDefinitions.map(([key, label]) => {
    const keyStr = String(key)
    // Special-case: treat request history field as a date
    if (keyStr === 'hestoire_demende' || keyStr.includes('hestoire') || keyStr.includes('histoire')) {
      return colsBuilder.date(key, label, true)
    }

    if (keyStr.toLowerCase().includes("date") || keyStr === "createdAt" || keyStr === "updatedAt") {
      return colsBuilder.date(key, label, true)
    }
    if (keyStr === "createdBy") {
      return colsBuilder.custom(key, label, (val: any) => {
        if (!val) return <span className="text-gray-400">-</span>
        const name = typeof val === "object" ? val.fullName || val.email : val
        return <span className="text-blue-600 font-medium">{name}</span>
      })
    }
    if (keyStr.includes("vihicile_parked") || keyStr.includes("parked")) {
      return colsBuilder.custom(key, label, (val: any) => {
        const badge = formatters.status(val)
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.variant === "default"
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
    if (keyStr.includes("nature_ligne")) {
      return colsBuilder.custom(key, label, (val: any) => <Badge variant="secondary">{val}</Badge>)
    }
    if (keyStr.includes("num_") && keyStr.includes("telephone")) {
      return colsBuilder.custom(key, label, (val: any) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{val}</span>
        </div>
      ))
    }
    return colsBuilder.text(key, label, true)
  })

  const actions = useTableActions<any>(
    (item) => navigate(`/update-chauffeur/${item._id}`),
    undefined,
    (item) => handleDelete(item._id)
  )

  return (
    <MainContainer>
      <Helmet>
        <title>مديرية النقل - قائمة السائقين</title>
        <meta name="description" content="إدارة وعرض بيانات السائقين في نظام مديرية النقل" />
        <link rel="icon" type="image/png" href={logo} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
        <div className="container mx-auto p-6 space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                قائمة السائقين
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">إدارة وعرض بيانات السائقين المسجلين في نظام مديرية النقل</p>
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
                        placeholder="البحث في السائقين..."
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
                    <Button onClick={handleExport} disabled={isExporting || chauffeurs.length === 0} className="gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
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
                  <UserCheck className="w-6 h-6" /> بيانات السائقين
                </CardTitle>
                <CardDescription className="text-blue-600">عرض تفصيلي لجميع السائقين المسجلين في النظام</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <ListTable
                    columns={columns}
                    data={chauffeurs}
                    isLoading={loading}
                    isEmpty={!loading && chauffeurs.length === 0}
                    emptyMessage="لا توجد نتائج"
                    actions={actions}
                    pagination={{ page, total: totalCh, limit, onPageChange: setPage }}
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

export default EnhancedChauffeur
