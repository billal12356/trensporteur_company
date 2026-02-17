import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { Link, useParams } from "react-router-dom";
import {
  FindOneOperateur,
  generatePDF,
  generatePDFs,
} from "@/redux/slice/operateurSlice";
import MainContainer from "@/components/MainContainer";
import { Button } from "@/components/ui/button";
import { IoCaretBackSharp, IoCaretForwardSharp } from "react-icons/io5";
import { DownloadOperateurPDF } from "@/redux/slice/vihiculeSlice";
import { Helmet } from "react-helmet-async";
import { ListTable, useTableColumns, useTableActions } from "@/components";
import { formatters } from "@/lib/formatters";
import { clearError } from "@/redux/slice/operateurSlice";

export default function OperateurDetails() {
  const { operateur, vihicules, chauffeurs, loading, error } = useSelector(
    (state: RootState) => state.operateur
  );

  console.log("error", error);

  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState<"vehicles" | "historique">(
    "vehicles"
  );
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      dispatch(FindOneOperateur(id));
    }
  }, [dispatch]);

  const toggleVehicle = (id: string) => {
    setSelectedVehicles((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const historiqueVehicles = useMemo(() => {
    return vihicules.filter(
      (v: any) => v.is_permanently_parked === true
    );
  }, [vihicules]);

  console.log("historiqueVehicles", historiqueVehicles)


  const colsBuilder = useTableColumns<any>();

  // Define all vehicle columns for details view
  const vehicleColumns = [
    ["num_wilaya", "رقم الولاية"],
    ["num_docier_client", "رقم ملف المتعامل في سجل الناقلين"],
    ["fullName_arabe", "اسم ولقب المتعامل (بالعربية)"],
    ["fullName_francais", "اسم ولقب المتعامل (بالفرنسية)"],
    ["activite", "النشاط"],
    ["colonne1", "العمود 1"],
    ["nature_activite", "طبيعة النشاط"],
    ["colonne2", "العمود 2"],
    ["status_activite", "حالة النشاط"],
    ["colonne3", "العمود 3"],
    ["num_bus_registration", "رقم تسجيل الحافلة او الشاحنة"],
    ["circle", "الدائرة"],
    ["Municipality", "البلدية"],
    ["Style", "الطراز"],
    ["category", "الصنف"],
    ["type", "النوع"],
    ["First_year_of_use", "اول سنة استعمال"],
    ["Number_of_seats", "عدد المقاعد"],
    ["Energy", "الطاقة"],
    ["num_driving_license", "رقم رخصة سير المركبة"],
    ["driving_license_history", "تاريخ رخصة السير"],
    ["driving_license_dure", "مدة صلاحية الرخصة"],
    ["line_activity_start_date", "تاريخ بداية نشاط الخط"],
    ["Vehicle_activity_start_date", "تاريخ بداية نشاط المركبة"],
    ["font_type", "نوع الخط"],
    ["colonne4", "العمود 4"],
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
    ["vihicile_parked", "المركبة (متوقفة أم لا)"],
    ["type_parked", "نوع التوقف"],
    ["hestoire_parked", "تاريخ التوقف"],
    ["hestoire_parked_end", "تاريخ نهاية توقيف مؤقت"],
    ["comments", "ملاحظات"],
    ["person_concerned", "المعني بالتحديث"],
    ["note_chef_departement", "ملاحظات رئيس المصلحة"],
    ["path", "المسار"],
  ] as const;

  // Add a selection checkbox column at the start so users can choose vehicles
  const selectColumn = colsBuilder.custom("_select" as any, "", (_val: any, item: any) => (
    <div className="flex items-center justify-end">
      <input
        type="checkbox"
        checked={selectedVehicles.includes(item._id)}
        onChange={(e) => {
          e.stopPropagation()
          toggleVehicle(item._id)
        }}
        className="w-4 h-4"
      />
    </div>
  ))

  const columns = [
    selectColumn,
    ...vehicleColumns.map(([key, label]) => {
      const keyStr = String(key);
      if (
        keyStr.toLowerCase().includes("date") ||
        keyStr.toLowerCase().includes("history") ||
        keyStr.toLowerCase().includes("_start_") ||
        keyStr.toLowerCase().includes("_end_") ||
        keyStr.toLowerCase().includes("depart") ||
        keyStr.toLowerCase().includes("parked")
      ) {
        return colsBuilder.date(key, label, true);
      }
      return colsBuilder.text(key, label, true);
    }),
  ];

  // No action button for toggle any more; selection is handled via checkboxes
  const actions = useTableActions<any>(undefined, undefined, undefined);
  const [index, setIndex] = useState(0);

  const total = Math.min(chauffeurs.length, vihicules.length);

  // clamp total to non-negative integer
  const totalItems = Math.max(0, total);

  // Move forward without wrapping; clamp at end
  const goNext = () => {
    setIndex((prev) => Math.min(prev + 1, Math.max(0, totalItems - 1)));
  };

  // Move backward without wrapping; clamp at start
  const goPrevious = () => {
    setIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleClick = () => {
    dispatch(generatePDF(id ?? " "));
  };
  const handleClickPfds = () => {
    dispatch(generatePDFs(id ?? " "));
  };

  useEffect(() => {
    // Scroll to the top of the page when the component is mounted
    window.scrollTo(0, 0);
  }, []);

  console.log("selectedVehicles", selectedVehicles)

  return (
    <MainContainer>
      <Helmet>
        <title>تفاصيل المتعامل</title>
        <meta name="description" content="مرحبا بك في Finissio" />
        <link
          rel="icon"
          type="image/png"
          href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s"
        />
      </Helmet>
      <div className="p-6 space-y-6">
        {/* Error banner */}
        {error && (
          <div className="flex items-center justify-between bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded">
            <div className="text-sm">{error}</div>
            <div>
              <Button
                variant="ghost"
                className="text-red-800"
                onClick={() => dispatch(clearError())}
              >
                إغلاق
              </Button>
            </div>
          </div>
        )}
        <div className="flex gap-4 h-12 items-center">
          <Button
            onClick={() =>
              dispatch(
                DownloadOperateurPDF({ id: id!, vehicleIds: selectedVehicles })
              )
            }
            className=" h-12"
          >
            بطاقة المسارات و التوقيت
          </Button>

          <Button
            onClick={handleClick}
            disabled={loading}
            className="px-6  h-12 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 transition duration-300"
          >
            {loading ? " جاري إنشاء الملف..." : "البطاقة الفنية"}
          </Button>

          {loading ? (
            <div className="text-blue-600 font-semibold mt-4">
              جاري إنشاء الملف...
            </div>
          ) : (
            <Button
              onClick={handleClickPfds}
              className="bg-green-600 text-white px-4 h-12 py-2 rounded-md hover:bg-blue-700 transition"
            >
              مقررة
            </Button>
          )}
        </div>
        <Card className="shadow-lg">
          <CardContent className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 sm:px-16">
              <Link to="/operateur" className="flex items-center text-xl">
                <IoCaretBackSharp className="text-xl" />
                <span>رجوع</span>
              </Link>
              <h2 className="text-xl font-bold text-center">بيانات المتعامل</h2>
              <div className="flex gap-3 items-center">
                <Button
                  onClick={goPrevious}
                  disabled={totalItems === 0 || index === 0}
                  title={index === 0 ? 'البداية' : 'السابق'}
                >
                  <IoCaretBackSharp />
                </Button>

                <div className="text-sm text-gray-600">
                  {totalItems > 0 ? `${index + 1} / ${totalItems}` : '0 / 0'}
                </div>

                <Button
                  onClick={goNext}
                  disabled={totalItems === 0 || index >= totalItems - 1}
                  title={index >= totalItems - 1 ? 'النهاية' : 'التالي'}
                >
                  <IoCaretForwardSharp />
                </Button>
              </div>
            </div>

            {/* Sections */}
            {[
              // Section 1
              [
                {
                  label: "تاريخ بداية النشاط",
                  value: formatters.dateFrench(operateur.date_debut_activite),
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
                  value: formatters.dateFrench(chauffeurs[index]?.date_sortie),
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
                  value: formatters.dateFrench(operateur.date_naissance),
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
                  value: formatters.dateFrench(operateur.date_debut_activite),
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
                    <span className="text-blue-500 font-semibold">
                      {field.value}
                    </span>
                    <h2 className="font-bold whitespace-nowrap">
                      {field.label}
                    </h2>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ===============================
            TABLE SWITCH BUTTONS
        =============================== */}
        <div className="flex justify-center gap-4">
          <Button
            variant={activeTable === "vehicles" ? "default" : "outline"}
            onClick={() => setActiveTable("vehicles")}
          >
            المركبات
          </Button>

          <Button
            variant={activeTable === "historique" ? "default" : "outline"}
            onClick={() => setActiveTable("historique")}
          >
            سجل التوقيف
          </Button>
        </div>

        {/* ===============================
            VEHICLE TABLE (ListTable)
        =============================== */}
        {activeTable === "vehicles" && (
          <div className="rounded-md border">
            <ListTable
              columns={columns}
              data={vihicules}
              isLoading={loading}
              isEmpty={!loading && vihicules.length === 0}
              emptyMessage="لا توجد نتائج"
              actions={actions}
            />
          </div>
        )}

        {/* ===============================
            HISTORIQUE TABLE (CUSTOM)
        =============================== */}
        {activeTable === "historique" && (
          <div className="overflow-x-auto border rounded-md shadow-sm">
            <table className="min-w-full border-collapse text-sm text-right">
              <thead className="bg-gray-200 font-bold text-gray-800">
                <tr>
                  <th className="border px-3 py-2">ملف</th>
                  <th className="border px-3 py-2">رقم الخط</th>
                  <th className="border px-3 py-2">تاريخ الالغاء</th>
                  <th className="border px-3 py-2">الخط</th>
                  <th className="border px-3 py-2">الحالة</th>
                  <th className="border px-3 py-2">السبب</th>
                  <th className="border px-3 py-2">تسجيل المركبة</th>
                  <th className="border px-3 py-2">الصنف</th>
                  <th className="border px-3 py-2">النوع</th>
                  <th className="border px-3 py-2">الطراز</th>
                  <th className="border px-3 py-2">المقاعد</th>
                </tr>
              </thead>

              <tbody>
                {historiqueVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-gray-500">
                      لا توجد نتائج
                    </td>
                  </tr>
                ) : (
                  historiqueVehicles.map((vehicle: any) => (
                    <tr
                      key={vehicle._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="border px-3 py-2">
                        {vehicle.num_docier_client}
                      </td>
                      <td className="border px-3 py-2">
                        {vehicle.font_symbol}
                      </td>
                      <td className="border px-3 py-2">
                        {formatters.dateFrench(vehicle.permanent_parking_date)}
                      </td>
                      <td className="border px-3 py-2">
                        {vehicle.point_depart} - {vehicle.point_arrive}
                      </td>
                      <td className="border px-3 py-2">
                        
                      </td>
                      <td className="border px-3 py-2">
                        
                      </td>
                      <td className="border px-3 py-2">
                        {vehicle.num_bus_registration}
                      </td>
                      <td className="border px-3 py-2">
                        {vehicle.category}
                      </td>
                      <td className="border px-3 py-2">
                        {vehicle.type}
                      </td>
                      <td className="border px-3 py-2">
                        {vehicle.Style}
                      </td>
                      <td className="border px-3 py-2">
                        {vehicle.Number_of_seats}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </MainContainer>
  );
}
