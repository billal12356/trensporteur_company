import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { HiDownload, HiTrash } from "react-icons/hi";
import { AppDispatch, RootState } from "@/redux/store";
import MainContainer from "@/components/MainContainer";
//import { logout } from "@/redux/slice/authSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteChauffeurs, exportChauffeurs, fetchChauffeurs } from "@/redux/slice/chauffeurSlice";
import { Link } from "react-router-dom";
import { Edit3 } from "lucide-react";

const Chauffeur = React.memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const { chauffeurs, loading, totalCh, limit } = useSelector((state: RootState) => state.chauffeur);
  const [Page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchChauffeurs({ search: searchQuery, page: Page, limit: 10 }));
  }, [dispatch, searchQuery, Page]);

  const handleDelete = (id: string) => {
    dispatch(deleteChauffeurs(id));
  };

  //const handleSignout = () => {
  //dispatch(logout());
  //};

  const handleExport = () => {
    dispatch(exportChauffeurs({ search: searchQuery }));
  };


  const handlePrev = () => {
    if (Page > 1) {
      setPage(Page - 1)
    }
  }
  const handleNext = () => {
    if (Page !== Math.ceil(totalCh / limit)) {
      setPage(Page + 1)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <MainContainer>


      <div className="w-full p-4">
        <div className="text-center text-3xl font-bold mb-4">قائمة السائقين</div>
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
          <Button onClick={handleExport} variant="destructive" disabled={loading} className="lg:w-[170px] w-[150px] cursor-pointer">
            {loading ? "جاري التصدير..." : ` تحميل ملف Excel`} <HiDownload className="ml-2" />
          </Button>
        </div>
        <div className="overflow-x-auto rounded-md border">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr className="flex">
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم المستخدم</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم الطلب</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ الطلب</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم القيد للناقل</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">المتعامل</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">الخط المستغل</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">ترقيم المركبة</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">طبيعة الخط</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">اسم و لقب السائق</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">طبيعة المستخدم</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم التعريف الوطني NIN</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم رخصة السياقة</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ الاصدار</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">نهاية صلاحية الصنف</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">بلدية الاصدار</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ الميلاد</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">العنوان</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم شهادة الكفائة المهنية</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">تاريخ الحصول على شهادة الكفاءة</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">الولاية</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">الرقم التسلسلي</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">رقم الانتساب الى الصندوق الوطني</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">المركبة (موقفة او لا)</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">نوع التوقف</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">ملاحظة</th>
                <th className="px-4 py-2 text-right font-bold w-48 flex items-center justify-center border-r">إجراءات</th>
              </tr>

            </thead>

            <tbody>
              {chauffeurs.length ? (
                chauffeurs.map((chauffeur) => (
                  <tr key={chauffeur._id} className="flex">
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.num_chauffeur}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.num_demende}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                      {new Date(chauffeur.hestoire_demende).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.operateur}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.ligne_exploitée}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.num_vehicule}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.nature_ligne}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.nom_prenom_chauffeur}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.nature_utilisateur}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.num_didentification_national_NIN}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.num_permis_conduire}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                      {new Date(chauffeur.date_sortie).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                      {new Date(chauffeur.date_expiration_article).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.municipalite_emettrice}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                      {new Date(chauffeur.date_naissance).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.lieu_naissance}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.address}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.Num_certificat_compétence_professionnelle}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                      {new Date(chauffeur.date_obtention_certificat_aptitude_professionnelle).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.wilaya}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.num_serie}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.num_membre_fonds_national}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.vihicile_parked}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.type_parked}</td>
                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{chauffeur.comments}</td>

                    <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">
                      <Button variant="destructive" onClick={() => handleDelete(chauffeur._id)}>
                        <HiTrash />
                      </Button>
                      <Button variant="default" className="cursor-pointer">
                        <Link to={`/update-chauffeur/${chauffeur._id}`}>
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>

                ))
              ) : (
                <div>
                  {
                    loading ? (
                      <div>
                        <tr className="flex">
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />

                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />

                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>

                          {/* Conditionally render columns if they exist */}
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>

                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />

                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />

                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />

                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />

                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" />
                          </td>
                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[200px] h-[40px] rounded" /> 
                          </td>

                          <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b ">
                            <Skeleton className="w-[50px] h-[40px] rounded" />
                          </td>
                        </tr>
                      </div>
                    ) :
                      (
                        <td colSpan={40} className="px-4 py-2 text-center">لا توجد نتائج.</td>
                      )
                  }
                </div>
              )}
            </tbody>

          </table>
        </div>



        <div className="flex justify-between items-center py-4">
          <span className="text-sm">صفحة {Page} من {Math.ceil(totalCh / limit)}</span>
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
              disabled={Page >= Math.ceil(totalCh / limit)}
            >
              التالي
            </Button>
          </div>
        </div>
      </div >


    </MainContainer >
  );
});

export default Chauffeur;
