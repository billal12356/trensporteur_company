import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { Link, useParams } from "react-router-dom";
import { FindOneOperateur } from "@/redux/slice/operateurSlice";
import MainContainer from "@/components/MainContainer";
import { Button } from "@/components/ui/button";
import { IoCaretBackSharp, IoCaretForwardSharp } from "react-icons/io5";
import { DownloadOperateurPDF } from "@/redux/slice/vihiculeSlice";



export default function OperateurDetails() {
    const { operateur, vihicules, chauffeurs } = useSelector((state: RootState) => state.operateur)
    const dispatch = useDispatch<AppDispatch>()
    const { id } = useParams();

    console.log(vihicules);

    useEffect(() => {
        if (id) {
            dispatch(FindOneOperateur(id));
        }
    }, [dispatch]);

    const [index, setIndex] = useState(0);

    const total = Math.min(chauffeurs.length, vihicules.length);

    const goNext = () => {
        setIndex((prev) => (prev + 1) % total);
    };

    const goPrevious = () => {
        setIndex((prev) => (prev - 1 + total) % total);
    };


    return (
        <MainContainer>
            <div className="p-6 space-y-6">
                <Button onClick={() => dispatch(DownloadOperateurPDF(id!))} className="mt-4">
                    تحميل PDF
                </Button>
                <Card className="shadow-lg">
                    <CardContent className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 sm:px-16">
                            <Link to="/operateur" className="flex items-center text-xl">
                                <IoCaretBackSharp className="text-xl" />
                                <span>رجوع</span>
                            </Link>
                            <h2 className="text-xl font-bold text-center">بيانات المتعامل</h2>
                            <div className="flex gap-3">
                                <Button onClick={goPrevious}><IoCaretBackSharp /></Button>
                                <Button onClick={goNext}><IoCaretForwardSharp /></Button>
                            </div>
                        </div>

                        {/* Sections */}
                        {[
                            // Section 1
                            [
                                {
                                    label: "تاريخ بداية النشاط",
                                    value: new Date(operateur.date_debut_activite).toLocaleDateString('fr-FR'),
                                },
                                {
                                    label: "رقم القيد سجل في الناقلين ",
                                    value: chauffeurs[index]?.num_enregistrement_du_transporteur,
                                },
                            ],
                            // Section 2
                            [
                                {
                                    label: "تاريخ اصدار الرخصة",
                                    value: new Date(chauffeurs[index]?.date_sortie).toLocaleDateString('fr-FR'),
                                },
                                {
                                    label: "رقم التسلسلي للرخصة",
                                    value: chauffeurs[index]?.num_serie,
                                },
                            ],
                            // Section 3
                            [
                                {
                                    label: "الشركة",
                                    value: "/",
                                },
                                {
                                    label: "اسم و لقب الناقل",
                                    value: chauffeurs[index]?.nom_prenom_chauffeur,
                                },
                            ],
                            // Section 4
                            [
                                {
                                    label: "الجنس",
                                    value: "ذكر",
                                },
                                {
                                    label: "مكان الميلاد",
                                    value: operateur.lieu_naissance_francais,
                                },
                                {
                                    label: "تاريخ الميلاد",
                                    value: new Date(operateur.date_naissance).toLocaleDateString('fr-FR'),
                                },
                            ],
                            // Section 5
                            [
                                {
                                    label: "اسم و لقب الام بالفرنسية",
                                    value: operateur.fullName_mere_francais,
                                },
                                {
                                    label: "اسم و لقب الام بالعربية",
                                    value: operateur.fullName_mere_arabe,
                                },
                                {
                                    label: "اسم الاب",
                                    value: operateur.nom_pere_arabe,
                                },
                            ],
                            // Section 6
                            [
                                {
                                    label: "العنوان او المقر الاجتماعي",
                                    value: operateur.address_arabe,
                                },
                            ],
                            // Section 7
                            [
                                {
                                    label: "E-mail",
                                    value: "@",
                                },
                                {
                                    label: "نقال",
                                    value: "/",
                                },
                                {
                                    label: "فاكس",
                                    value: "/",
                                },
                                {
                                    label: "الهاتف",
                                    value: operateur.num_telephone_client,
                                },
                            ],
                            // Section 8
                            [
                                {
                                    label: "ولاية",
                                    value: "عين الدفلة",
                                },
                                {
                                    label: "تاريخ بداية النشاط",
                                    value: new Date(operateur.date_debut_activite).toLocaleDateString('fr-FR'),
                                },
                                {
                                    label: "رقم السجل التجاري",
                                    value: operateur.num_registre_commerce,
                                },
                            ],
                        ].map((section, idx) => (
                            <div
                                key={idx}
                                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 px-4 sm:px-10 py-5 border border-gray-200 rounded-lg"
                            >
                                {section.map((field, i) => (
                                    <div key={i} className="flex justify-end gap-3">
                                        <span className="text-blue-500 font-semibold">{field.value}</span>
                                        <h2 className="font-bold whitespace-nowrap">{field.label}</h2>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </CardContent>
                </Card>


                <h2 className="text-xl text-center font-bold">قائمة المركبة </h2>
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
                            </tr>
                        </thead>
                        <tbody>
                            {vihicules.length ? (
                                vihicules.map((vehicule) => (
                                    <tr key={vehicule._id} className="flex">
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.num_wilaya}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.num_docier_client}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.fullName_arabe}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.fullName_francais}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.activite}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.colonne1 || ''}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.nature_activite}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.colonne2 || ''}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.status_activite}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.colonne3 || ''}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.num_bus_registration}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.circle || ''}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.Municipality || ''}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.Style || ''}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.category}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.type}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.First_year_of_use}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.Number_of_seats}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.Energy}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.num_driving_license}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{new Date(vehicule.driving_license_history).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.driving_license_dure}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{new Date(vehicule.line_activity_start_date).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{new Date(vehicule.Vehicle_activity_start_date).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.font_type}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.colonne4}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.font_symbol}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.point_depart}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.point_arrive}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.point_Traffic1}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.point_Traffic2}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.point_Traffic3}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.point_Traffic4}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.point_Traffic5}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.line_start_time || ''}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.line_end_time || ''}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.Pace_per_minute || ''}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.time_depart1}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.time_depart2}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.time_depart3 || ''}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.time_depart4 || ''}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.vihicile_parked || ''}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.type_parked}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{new Date(vehicule.hestoire_parked).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{new Date(vehicule.hestoire_parked_end).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.comments}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.person_concerned}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.note_chef_departement || ''}</td>
                                        <td className="px-4 py-2 w-48 flex items-center justify-center border-r border-b">{vehicule.path}</td>
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
            </div>
        </MainContainer>
    );
}
