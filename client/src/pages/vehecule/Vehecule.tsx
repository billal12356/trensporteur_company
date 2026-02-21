"use client";

import React, { useEffect } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  RefreshCw,
  Truck,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  deleteVihicules,
  ExportLines,
  exportVihicules,
  fetchVihicules,
} from "@/redux/slice/vihiculeSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import MainContainer from "@/components/MainContainer";

import { useListPage } from "@/hooks/useListPage";
import { ListTable, useTableColumns, useTableActions } from "@/components";
import { formatters } from "@/lib/formatters";

const EnhancedVehicle = React.memo((): ReactElement => {
  const navigate = useNavigate();
  const [searchQueryLine, setSearchQueryLine] = React.useState("");
  const [isExportingLine, setIsExportingLine] = React.useState(false);

  const {
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    loading,
    isExporting,
    data: vihicules,
    total: totalVc,
    limit,
    handleDelete,
    handleExport,
    handleRefresh,
  } = useListPage({
    fetchThunk: fetchVihicules,
    deleteThunk: deleteVihicules,
    exportThunk: exportVihicules,
    stateSelector: (state) => ({
      data: state.vihicule.vihicules,
      total: state.vihicule.totalVc,
      loading: state.vihicule.loading,
      limit: 10,
    }),
    limit: 10,
  });

  const dispatch = useDispatch<AppDispatch>();

  const handleExportLine = async () => {
    setIsExportingLine(true);
    try {
      // dispatch the thunk and unwrap to throw on rejection
      // @ts-ignore - keep types lenient for now
      await dispatch(ExportLines({ search: searchQueryLine })).unwrap();
      setSearchQueryLine("");
    } catch (err) {
      console.error("ExportLines error:", err);
    } finally {
      setIsExportingLine(false);
    }
  };

  const colsBuilder = useTableColumns<any>();

  useEffect(() => {
    // Scroll to the top of the page when the component is mounted
    window.scrollTo(0, 0);
  }, []);

  const columnDefinitions: Array<[keyof any, string]> = [
    ["num_wilaya", "رقم الولاية"],
    ["num_docier_client", "رقم ملف المتعامل"],
    ["fullName_arabe", "اسم المتعامل (عربي)"],
    ["fullName_francais", "اسم المتعامل (فرنسي)"],
    ["activite", "النشاط"],
    ["nature_activite", "طبيعة النشاط"],
    ["status_activite", "حالة النشاط"],
    ["num_bus_registration", "رقم تسجيل المركبة"],
    ["circle", "الدائرة"],
    ["Municipality", "البلدية"],
    ["Style", "الطراز"],
    ["category", "الصنف"],
    ["type", "النوع"],
    ["First_year_of_use", "أول سنة استعمال"],
    ["total_load_trucks", "جملة الحمولة (للشاحنات)"],
    ["restricted_load", "الحمولة المقيدة"],
    ["Number_of_seats", "عدد المقاعد"],
    ["Energy", "الطاقة"],
    ["num_driving_license", "رقم رخصة السير"],
    ["driving_license_history", "تاريخ رخصة السير"],
    ["driving_license_dure", "مدة صلاحية الرخصة"],
    ["line_activity_start_date", "تاريخ بداية نشاط الخط"],
    ["Vehicle_activity_start_date", "تاريخ بداية نشاط المركبة"],
    ["font_type", "نوع الخط"],
    ["font_symbol", "رمز الخط"],
    ["point_depart", "نقطة الانطلاق"],
    ["point_arrive", "نقطة الوصول"],
    ["point_Traffic1", "نقطة المرور 1"],
    ["point_Traffic2", "نقطة المرور 2"],
    ["point_Traffic3", "نقطة المرور 3"],
    ["point_Traffic4", "نقطة المرور 4"],
    ["point_Traffic5", "نقطة المرور 5"],
    ["line_start_time", "توقيت بداية الخط"],
    ["line_end_time", "توقيت نهاية الخدمة"],
    ["Pace_per_minute", "الوتيرة بالدقائق"],
    ["time_depart1", "تاريخ الانطلاق 1"],
    ["time_depart2", "تاريخ الانطلاق 2"],
    ["time_depart3", "تاريخ الانطلاق 3"],
    ["time_depart4", "تاريخ الانطلاق 4"],
    ["vihicile_parked", "حالة المركبة"],
    ["type_parked", "نوع التوقف"],
    ["hestoire_parked", "تاريخ التوقف"],
    ["hestoire_parked_end", "تاريخ نهاية التوقف"],
    ["comments", "ملاحظات"],
    ["person_concerned", "المعني بالتحديث"],
    ["note_chef_departement", "ملاحظات رئيس المصلحة"],
    ["path", "المسار"],
  ];

  const columns = columnDefinitions.map(([key, label]) => {
    const keyStr = String(key);
    if (
      keyStr.toLowerCase().includes("date") ||
      keyStr.toLowerCase().includes("history") ||
      keyStr.toLowerCase().includes("_start_") ||
      keyStr.toLowerCase().includes("_end_") ||
      keyStr.toLowerCase().includes("depart") ||
      keyStr.toLowerCase().includes("dure")
    ) {
      return colsBuilder.date(key, label, true);
    }
    if (keyStr.includes("status_activite") || keyStr.includes("vihicile_parked")) {
      return colsBuilder.custom(key, label, (val: any) => {
        const badge = formatters.status(val);
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${badge.variant === "default"
              ? "bg-green-100 text-green-800"
              : badge.variant === "secondary"
                ? "bg-yellow-100 text-yellow-800"
                : badge.variant === "destructive"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
          >
            {badge.label}
          </span>
        );
      });
    }
    if (keyStr.includes("activite")) {
      return colsBuilder.custom(key, label, (val: any) => (
        <Badge variant="secondary">{val}</Badge>
      ));
    }
    if (keyStr.includes("point_depart") || keyStr.includes("point_arrive")) {
      return colsBuilder.custom(key, label, (val: any) => (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-green-500" />
          <span className="text-sm">{val}</span>
        </div>
      ));
    }
    if (keyStr.includes("Number_of_seats")) {
      return colsBuilder.custom(key, label, (val: any) => (
        <div className="flex items-center gap-1">
          <span>{val}</span>
          <span className="text-xs text-gray-500">مقعد</span>
        </div>
      ));
    }
    if (
      keyStr.includes("total_load_trucks") ||
      keyStr.includes("restricted_load")
    ) {
      return colsBuilder.custom(key, label, (val: any) => (
        <div className="flex items-center gap-1">
          <span>{val}</span>
          <span className="text-xs text-gray-500">كغ</span>
        </div>
      ));
    }
    return colsBuilder.text(key, label, true);
  });

  const actions = useTableActions<any>(
    (item) => navigate(`/update-vihicule/${item._id}`),
    undefined,
    (item) => handleDelete(item._id)
  );

  return (
    <MainContainer>
      <Helmet>
        <title>مديرية النقل - قائمة المركبات</title>
        <meta
          name="description"
          content="إدارة وعرض بيانات المركبات في نظام مديرية النقل"
        />
        <link
          rel="icon"
          type="image/png"
          href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s"
        />
      </Helmet>

      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
        dir="rtl"
      >
        <div className="container mx-auto p-6 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
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
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={loading}
                      className="gap-2 bg-transparent"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                      />
                      تحديث
                    </Button>
                    <Button
                      onClick={handleExport}
                      disabled={isExporting || vihicules.length === 0}
                      className="gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      {isExporting ? "جاري التصدير..." : "تصدير Excel"}
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mt-4">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="البحث في المركبات على المسار..."
                        value={searchQueryLine}
                        onChange={(e) => setSearchQueryLine(e.target.value)}
                        className="pl-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg text-right"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleExportLine}
                      disabled={isExportingLine || !searchQueryLine}
                      className="gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      {isExportingLine
                        ? "جاري التصدير..."
                        : " تصدير فلترة المسار  "}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="text-blue-800 text-xl flex items-center gap-2">
                  <Truck className="w-6 h-6" />
                  بيانات المركبات
                </CardTitle>
                <CardDescription className="text-blue-600">
                  عرض تفصيلي لجميع المركبات المسجلة في النظام
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <ListTable
                    columns={columns}
                    data={vihicules}
                    isLoading={loading}
                    isEmpty={!loading && vihicules.length === 0}
                    emptyMessage="لم يتم العثور على أي مركبات"
                    actions={actions}
                    pagination={{ page, total: totalVc, limit, onPageChange: setPage }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainContainer>
  );
});

export default EnhancedVehicle;
