import { useDispatch, useSelector } from "react-redux"
import MainContainer from "../../components/MainContainer"
import { AppDispatch, RootState } from "@/redux/store"
import React, { useEffect, useState } from "react";
import { exportVihicules, fetchVihicules } from "@/redux/slice/vihiculeSlice";
import { logout } from "@/redux/slice/authSlice";
import { Button } from "@/components/ui/button";
import { HiDownload, HiTrash } from "react-icons/hi";
import { RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";


const Vehecule = React.memo(() => {
  const { vihicules, totalVc, loading, limit, error } = useSelector((state: RootState) => state.vihicule);
  const dispatch = useDispatch<AppDispatch>()
  const [Page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    dispatch(fetchVihicules({ search: searchQuery, page: Page, limit: 10 }))
  }, [dispatch, searchQuery, Page])

  const handleSignout = () => {
    dispatch(logout());
  };

  const handleExport = () => {
    dispatch(exportVihicules({ search: searchQuery }));
  };

  const handlePrev = () => {
    if (Page > 1) {
      setPage(Page - 1)
    }
  }
  const handleNext = () => {
    if (Page !== Math.ceil(totalVc / limit)) {
      setPage(Page + 1)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <MainContainer>
      <Helmet>
        <title>قائمة المركبات</title>
        <meta name="description" content="مرحبا بك في Finissio" />
        <link rel="icon" type="image/png" href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s" />
      </Helmet>
      {
        error ? (
          <div className="flex justify-center items-center h-screen">
            <Button onClick={handleSignout} >Logout</Button>
          </div>
        ) : (
          <div className="w-full p-4">
            <div className="text-center text-3xl font-bold mb-4">قائمة المركبة</div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  className="border p-2 rounded"
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <Button onClick={handleExport} variant="destructive" disabled={loading} className="lg:w-[170px] cursor-pointer">
                {loading ? "جاري التصدير..." : `📥 تحميل ملف Excel`} <HiDownload className="ml-2" />
              </Button>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100">
                  <tr className="flex">
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم الولاية</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم ملف المتعامل في سجل الناقلين</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">اسم ولقب المتعامل (بالعربية)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">اسم ولقب المتعامل (بالفرنسية)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">النشاط</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">العمود 1</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">طبيعة النشاط</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">العمود 2</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">حالة النشاط</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">العمود 3</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم تسجيل الحافلة او الشاحنة</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">الدائرة</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">البلدية</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">الطراز</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">الصنف</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">النوع</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">اول سنة استعمال</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">عدد المقاعد</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">الطاقة</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم رخصة سير المركبة</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ رخصة السير</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">مدة صلاحية الرخصة</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ بداية نشاط الخط</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ بداية نشاط المركبة</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">نوع الخط</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">العمود 4</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رمز الخط</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">نقطة الانطلاق</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">نقطة الوصول</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">نقطة المرور 1</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">نقطة المرور 2</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">نقطة المرور 3</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">نقطة المرور 4</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">نقطة المرور 5</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">توقيت بداية الخط</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">توقيت نهاية الخدمة</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">الوتيرة بالدقائق بالنسبة للحضري</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ الانطلاق 1</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ الانطلاق 2</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ الانطلاق 3</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ الانطلاق 4</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">لمركبة (متوقفة أم لا)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">نوع التوقف</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ التوقف</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ نهاية توقيف مؤقت</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">ملاحظات</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">المعني بالتحديث</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">ملاحظات رئيس المصلحة</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">المسار</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {vihicules.length ? (
                    vihicules.map((vihicule) => (
                      <tr key={vihicule._id} className="flex">
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.num_wilaya}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.num_docier_client}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.fullName_arabe}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.fullName_francais}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.activite}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.colonne1 || ''}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.nature_activite}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.colonne2 || ''}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.status_activite}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.colonne3 || ''}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.num_bus_registration}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.circle || ''}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.Municipality || ''}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.Style || ''}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.category}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.type}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.First_year_of_use}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.Number_of_seats}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.Energy}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.num_driving_license}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                          {new Date(vihicule.driving_license_history).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.driving_license_dure}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                          {new Date(vihicule.line_activity_start_date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                          {new Date(vihicule.Vehicle_activity_start_date).toLocaleDateString('fr-FR')}

                        </td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.font_type}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.colonne4}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.font_symbol}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.point_depart}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.point_arrive}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.point_Traffic1}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.point_Traffic2}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.point_Traffic3}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.point_Traffic4}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.point_Traffic5}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.line_start_time || ''}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.line_end_time || ''}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.Pace_per_minute || ''}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.time_depart1}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.time_depart2}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.time_depart3 || ''}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.time_depart4 || ''}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.vihicile_parked || ''}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.type_parked}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                          {new Date(vihicule.hestoire_parked).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                          {new Date(vihicule.hestoire_parked_end).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.comments}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.person_concerned}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.note_chef_departement || ''}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vihicule.path}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center gap-2 border-r border-b">
                          <Button variant="destructive">
                            <HiTrash />
                          </Button>
                          <Button variant="default" className="cursor-pointer">
                            <Link to={`/update-vihicule/${vihicule._id}`}>
                              <RotateCcw className="w-4 h-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>

                    ))
                  ) : (
                    <tr>
                      <td colSpan={40} className="px-4 py-2 text-center">لا توجد نتائج.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>



            <div className="flex justify-between items-center py-4">
              <span className="text-sm">صفحة {Page} من {Math.ceil(totalVc / limit)}</span>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={Page === 1}
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={Page >= Math.ceil(totalVc / limit)}
                >
                  التالي
                </Button>
              </div>
            </div>
          </div >
        )
      }
    </MainContainer>
  )
});

export default Vehecule
