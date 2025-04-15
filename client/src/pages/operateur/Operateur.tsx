import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { HiDownload, HiTrash } from "react-icons/hi";
import { AppDispatch, RootState } from "@/redux/store";
import { deleteOperateur, exportOperateurs, fetchOperateurs } from "@/redux/slice/operateurSlice";
import MainContainer from "@/components/MainContainer";
import { logout } from "@/redux/slice/authSlice";
import type { Operateur } from "@/components/types/OperateurTypes";

const Operateur = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { operateurs, loading, total, limit, error } = useSelector((state: RootState) => state.operateur);
  const [Page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchOperateurs({ search: searchQuery, page: Page, limit: 10 }));
  }, [dispatch, searchQuery, Page]);

  const handleDelete = (id: string) => {
    dispatch(deleteOperateur(id));
  };

  const handleSignout = () => {
    dispatch(logout());
  };

  const handleExport = () => {
    dispatch(exportOperateurs({ search: searchQuery }));
  };


  const handlePrev = () => {
    if (Page > 1) {
      setPage(Page - 1)
    }
  }
  const handleNext = () => {
    if (Page !== Math.ceil(total / limit)) {
      setPage(Page + 1)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <MainContainer>
      {
        error ? (
          <div className="flex justify-center items-center h-screen">
            <Button onClick={handleSignout} >Logout</Button>
          </div>
        ) : (
          <div className="w-full p-4">
            <div className="text-center text-3xl font-bold mb-4">قائمة المتعاملين</div>
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
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم ملف المتعامل</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">اسم ولقب المتعامل (بالعربية)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">اسم ولقب المتعامل (بالفرنسية)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ انتهاء الصلاحية</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ المقررة</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم المقررة</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم بطاقة القيد</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">النشاط</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">العمود 1</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">طبيعة النشاط</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">العمود 2</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">حالة النشاط</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">العمود 3</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">نوع المتعامل</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">العمود 4</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">شكل الشركة أو المؤسسة</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">اسم ولقب المسير</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم شهادة الميلاد</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">الرقم الوطني للتعريف (NIN)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ الميلاد</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">مكان الميلاد (بالعربية)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">مكان الميلاد (بالفرنسية)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">اسم الأب (بالعربية)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">اسم الأب (بالفرنسية)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">اسم ولقب الأم (بالعربية)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">اسم ولقب الأم (بالفرنسية)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">بلدية الميلاد (بالعربية)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">بلدية الميلاد (بالفرنسية)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">العنوان (بالعربية)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">العنوان (بالفرنسية)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">بلدية العنوان (بالعربية)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">بلدية العنوان (بالفرنسية)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم السجل التجاري</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">الرقم الفرعي للسجل التجاري</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ السجل التجاري</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ تعديل السجل التجاري</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ بدء النشاط</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم الانتساب إلى الصندوق الوطني للعمال غير الأجراء</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">حالة النشاط (متوقف أم لا)</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">نوع التوقف</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ التوقف المؤقت عن النشاط</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ التوقف النهائي عن النشاط</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم هاتف المتعامل</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">المعني بالتحديث</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">ملاحظات رئيس المصلحة</th>
                    <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {operateurs.length ? (
                    operateurs.map((operateur) => (
                      <tr key={operateur._id} className="flex">
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.num_wilaya}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.num_docier_client}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.fullName_arabe}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.fullName_francais}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                          {new Date(operateur.date_expiration).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                          {new Date(operateur.date_prévue).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.num_dhoraire}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.num_cate_enregistement}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.activite}</td>

                        {/* Conditionally render columns if they exist */}
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.colonne1 || ''}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.nature_activite}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.colonne2 || ''}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.status_activite}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.colonne3 || ''}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.type_client}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.colonne4 || ''}</td>

                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.institution_person_moral}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.fullName_gerent_person_moral}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.num_dacte_naissance}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.num_didentification_national_NIN}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                          {new Date(operateur.date_naissance).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.lieu_naissance_arabe}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.lieu_naissance_francais}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.nom_pere_arabe}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.nom_pere_francais}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.fullName_mere_arabe}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.fullName_mere_francais}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.communes_naissance_arabe}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.communes_naissance_francais}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.address_arabe}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.address_francais}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.address_municipalité_arabe}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.address_municipalité_francais}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.num_registre_commerce}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.num_registre_commerce_n5}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.hestoire_registre_commerce}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.modifier_hestoire_registre_commerce}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                          {new Date(operateur.date_debut_activite).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.num_adherent_caise_national_non_salaire}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.depend_activite}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.type_depend}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                          {new Date(operateur.date_arret_activite_temporaire).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                          {new Date(operateur.date_arret_activite_permanent).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.num_telephone_client}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.soccupe}</td>
                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{operateur.note_chef_departement}</td>

                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                          <Button variant="destructive" onClick={() => handleDelete(operateur._id)}>
                            <HiTrash />
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
              <span className="text-sm">صفحة {Page} من {Math.ceil(total / limit)}</span>
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
                  disabled={Page >= Math.ceil(total / limit)}
                >
                  التالي
                </Button>
              </div>
            </div>
          </div >
        )
      }
    </MainContainer >
  );
};

export default Operateur;
