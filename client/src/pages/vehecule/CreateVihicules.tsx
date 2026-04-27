import MainContainer from "@/components/MainContainer";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { Vihicles } from "@/components/types/OperateurTypes";
import { Loader } from "lucide-react";
import { createVihicules, fetchByFontSymbol, resetFontSymbolStatus } from "@/redux/slice/vihiculeSlice";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

const FormOperateur: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, errorDetails, fontSymbolStatus, fontSymbolError   } = useSelector(
    (state: RootState) => state.vihicule
  );

  // ✅ useState for all form fields
  const [formData, setFormData] = useState<Partial<Vihicles>>({});
  const [fontSymbol, setFontSymbol] = useState("");

  // ✅ update handler
  const handleChange = (field: keyof Vihicles, value: any) => {
  setFormData((prev) => ({ ...prev, [field]: value }));

  if (field === "font_symbol") {
    setFontSymbol(value);
    dispatch(resetFontSymbolStatus()); // 👈 reset on every keystroke

    if (!value || value.trim() === "") {
      setFormData((prev) => ({
        ...prev,
        font_symbol: value,
        point_depart: "",
        point_arrive: "",
      }));
    }
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createVihicules(formData as Vihicles)).unwrap();
      navigate("/vehecule");
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  const handleFontSymbolBlur = () => {
    console.log("fontSymbol ==>",fontSymbol)
    console.log("fontSymbolStatus ==>",fontSymbolStatus)
  if (!fontSymbol || fontSymbol.trim() === "") return;
   if (fontSymbolStatus === "error") {
    // 👇 clear if font_symbol is empty on blur
    setFormData((prev) => ({
      ...prev,
      point_depart: "",
      point_arrive: "",
    }));
    dispatch(resetFontSymbolStatus());
    return;
  }
  dispatch(fetchByFontSymbol(fontSymbol))
    .unwrap()
    .then((res) => {
      setFormData((prev) => ({
        ...prev,
        point_depart: res.point_depart,
        point_arrive: res.point_arrive,
      }));
    })
    .catch((err) => {
      console.log(err);
      setFormData((prev) => ({
    ...prev,
    point_depart: "",
    point_arrive: "",
  }));
    });
};
  return (
    <MainContainer>
      <Helmet>
        <title>اضافة مركبة</title>
        <meta name="description" content="مرحبا بك في Finissio" />
      </Helmet>

      <div className="w-full max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          📝 تسجيل المركبة
        </h2>

        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* ✅ Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="رقم ملف المتعامل في سجل الناقلين"
              type="number"
              value={formData.num_docier_client ?? ""}
              onChange={(val) => handleChange("num_docier_client", val)}
            />
            <InputField
              label="رقم الولاية"
              type="number"
              value={formData.num_wilaya ?? ""}
              onChange={(val) => handleChange("num_wilaya", val)}
            />
          </div>

          {/* ✅ Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="الاسم و لقب المتعامل بالعربية"
              type="text"
              value={formData.fullName_arabe ?? ""}
              onChange={(val) => handleChange("fullName_arabe", val)}
            />
            <InputField
              label="الاسم و لقب المتعامل بالفرنسية"
              type="text"
              value={formData.fullName_francais ?? ""}
              onChange={(val) => handleChange("fullName_francais", val)}
            />
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Colonne 1"
              value={formData.colonne1 ?? ""}
              onChange={(v) => handleChange("colonne1", v)}
              options={[
                { label: "Transport voyageurs", value: "transport_passagers" },
              ]}
            />
            <SelectField
              label="النشاط"
              value={formData.activite ?? ""}
              onChange={(v) => handleChange("activite", v)}
              options={[{ label: "نقل المسافرين", value: "نقل المسافرين" }]}
            />
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Colonne 2"
              value={formData.colonne2 ?? ""}
              onChange={(v) => handleChange("colonne2", v)}
              options={[
                { label: "TPCV", value: "TPCV" },
                { label: "TPV", value: "TPV" },
              ]}
            />
            <SelectField
              label="طبيعة النشاط"
              value={formData.nature_activite ?? ""}
              onChange={(v) => handleChange("nature_activite", v)}
              options={[
                { label: "خاص", value: "خاص" },
                { label: "عمومي", value: "عمومي" },
              ]}
            />
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Colonne 3"
              value={formData.colonne3 ?? ""}
              onChange={(v) => handleChange("colonne3", v)}
              options={[
                { label: "PRIVE", value: "PRIVE" },
                { label: "PUBLICE", value: "PUBLICE" },
              ]}
            />
            <SelectField
              label="حالة النشاط"
              value={formData.status_activite ?? ""}
              onChange={(v) => handleChange("status_activite", v)}
              options={[
                { label: "PRIVE", value: "PRIVE" },
                { label: "PUBLICE", value: "PUBLICE" },
              ]}
            />
          </div>

          {/* Row 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="الدائرة"
              type="text"
              value={formData.circle ?? ""}
              onChange={(v) => handleChange("circle", v)}
            />
            <InputField
              label="رقم تسجيل الحافلة أو الشاحنة"
              type="text"
              value={formData.num_bus_registration ?? ""}
              onChange={(v) => handleChange("num_bus_registration", v)}
            />
          </div>

          {/* Row 7 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="الصنف"
              type="text"
              value={formData.category ?? ""}
              onChange={(v) => handleChange("category", v)}
            />
            <InputField
              label="الطراز"
              type="text"
              value={formData.Style ?? ""}
              onChange={(v) => handleChange("Style", v)}
            />
            <InputField
              label="البلدية"
              type="text"
              value={formData.Municipality ?? ""}
              onChange={(v) => handleChange("Municipality", v)}
            />
          </div>

          {/* Row 8 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="أول سنة استعمال"
              type="number"
              value={formData.First_year_of_use ?? ""}
              onChange={(val) =>
                handleChange("First_year_of_use", Number(val as number))
              }
            />
            <SelectField
              label="النوع"
              value={formData.type ?? ""}
              onChange={(v) => handleChange("type", v)}
              options={[
                { label: "AUTO CAR", value: "autoCar" },
                { label: "MINI CAR", value: "miniCar" },
                { label: "MINI BUS", value: "miniBus" },
                { label: "AUTO BUS", value: "autoBus" },
                { label: "CAMION AMENAGE", value: "camionAmenage" },
                { label: "AUTRE", value: "autre" },
              ]}
            />
          </div>

          {/* Row 9 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="عدد المقاعد"
              type="number"
              value={formData.Number_of_seats ?? ""}
              onChange={(val) =>
                handleChange("Number_of_seats", Number(val as number))
              }
            />
            <SelectField
              label="الطاقة"
              value={formData.Energy ?? ""}
              onChange={(v) => handleChange("Energy", v)}
              options={[
                { label: "مازوت", value: "مازوت" },
                { label: "بنزين", value: "بنزين" },
              ]}
            />
          </div>

          {/* Row 10 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="تاريخ رخصة السير"
              type="date"
              value={
                formData.driving_license_history
                  ? new Date(formData.driving_license_history)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(v) => handleChange("driving_license_history", v)}
            />
            <InputField
              label="رقم رخصة سير المركبة"
              type="number"
              value={formData.num_driving_license ?? ""}
              onChange={(val) =>
                handleChange("num_driving_license", Number(val as number))
              }
            />
          </div>

          {/* Row 11 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="تاريخ بداية نشاط الخط"
              type="date"
              value={
                formData.line_activity_start_date
                  ? new Date(formData.line_activity_start_date)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(v) => handleChange("line_activity_start_date", v)}
            />
            <InputField
              label="مدة صلاحية الرخصة"
              type="text"
              value={formData.driving_license_dure ?? ""}
              onChange={(v) => handleChange("driving_license_dure", v)}
            />
          </div>

          {/* Row 12 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="نوع الخط"
              value={formData.font_type ?? ""}
              onChange={(v) => handleChange("font_type", v)}
              options={[
                { label: "بين البلديات", value: "بين البلديات" },
                { label: "بين الولايات", value: "بين الولايات" },
                { label: "حضري او شبه حضري", value: "حضري او شبه حضري" },
                { label: "ريفي", value: "ريفي" },
                { label: "مركبة احتياطية", value: "مركبة احتياطية" },
                { label: "نقل العمال", value: "نقل العمال" },
                { label: "نقل مدرسي", value: "نقل مدرسي" },
              ]}
            />
            <InputField
              label="تاريخ بداية نشاط المركبة"
              type="date"
              value={
                formData.Vehicle_activity_start_date
                  ? new Date(formData.Vehicle_activity_start_date)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(val) =>
                handleChange("Vehicle_activity_start_date", val)
              }
            />
          </div>

          {/* Row 13 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
  label="رمز الخط"
  type="text"
  value={formData.font_symbol ?? ""}
  onChange={(v) => handleChange("font_symbol", v)}
  onBlur={handleFontSymbolBlur} 
  status={fontSymbolStatus}
  message={
    fontSymbolStatus === "loading"
      ? "جاري البحث..."
      : fontSymbolStatus === "error"
      ? fontSymbolError
      : fontSymbolStatus === "success"
      ? "رمز الخط موجود"
      : ""
  }
/>
            <SelectField
              label="colonne 4"
              value={formData.colonne4 ?? ""}
              onChange={(v) => handleChange("colonne4", v)}
              options={[
                { label: "inter - communale", value: "inter - communale" },
                { label: "Transport personnel", value: "Transport personnel" },
                { label: "Transport scolairel", value: "Transport scolairel" },
                {
                  label: "urbain ou sub-urbain",
                  value: "urbain ou sub-urbain",
                },
              ]}
            />
          </div>

          {/* Row 14 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="نقطة الوصول"
              type="text"
              value={formData.point_arrive ?? ""}
              onChange={(v) => handleChange("point_arrive", v)}
            />
            <InputField
              label="نقطة الانطلاق"
              type="text"
              value={formData.point_depart ?? ""}
              onChange={(v) => handleChange("point_depart", v)}
            />
          </div>

          {/* Row 15 - Registration and Serial Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="رقم القيد"
              type="number"
              value={formData.registration_number ?? ""}
              onChange={(val) =>
                handleChange("registration_number", Number(val as number))
              }
            />
            <InputField
              label="رقم التسلسلي في الطراز"
              type="number"
              value={formData.model_serial_number ?? ""}
              onChange={(val) =>
                handleChange("model_serial_number", Number(val as number))
              }
            />
          </div>

          {/* المرور */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="نقطة المرور 3"
              type="text"
              value={formData.point_Traffic3 ?? ""}
              onChange={(v) => handleChange("point_Traffic3", v)}
            />
            <InputField
              label="نقطة المرور 2"
              type="text"
              value={formData.point_Traffic2 ?? ""}
              onChange={(v) => handleChange("point_Traffic2", v)}
            />
            <InputField
              label="نقطة المرور 1"
              type="text"
              value={formData.point_Traffic1 ?? ""}
              onChange={(v) => handleChange("point_Traffic1", v)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="نقطة المرور 5"
              type="text"
              value={formData.point_Traffic5 ?? ""}
              onChange={(v) => handleChange("point_Traffic5", v)}
            />
            <InputField
              label="نقطة المرور 4"
              type="text"
              value={formData.point_Traffic4 ?? ""}
              onChange={(v) => handleChange("point_Traffic4", v)}
            />
          </div>

          {/* الأوقات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="توقيت نهاية الخط"
              type="text"
              value={formData.line_end_time ?? ""}
              onChange={(v) => handleChange("line_end_time", v)}
            />
            <InputField
              label="توقيت بداية الخط"
              type="text"
              value={formData.line_start_time ?? ""}
              onChange={(v) => handleChange("line_start_time", v)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="توقيت الانطلاق 1"
              type="text"
              value={formData.time_depart1 ?? ""}
              onChange={(v) => handleChange("time_depart1", v)}
            />
            <InputField
              label="الوتيرة بالدقائق بالنسبة للحضري"
              type="text"
              value={formData.Pace_per_minute ?? ""}
              onChange={(v) => handleChange("Pace_per_minute", v)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="توقيت الانطلاق 4"
              type="text"
              value={formData.time_depart4 ?? ""}
              onChange={(v) => handleChange("time_depart4", v)}
            />
            <InputField
              label="توقيت الانطلاق 3"
              type="text"
              value={formData.time_depart3 ?? ""}
              onChange={(v) => handleChange("time_depart3", v)}
            />
            <InputField
              label="توقيت الانطلاق 2"
              type="text"
              value={formData.time_depart2 ?? ""}
              onChange={(v) => handleChange("time_depart2", v)}
            />
          </div>

          {/* Row 15 - حالة المركبة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="هل المركبة متوقفة؟"
              value={formData.vihicile_parked ?? ""}
              onChange={(v) => handleChange("vihicile_parked", v)}
              options={[
                { label: "نعم، متوقفة", value: "متوقفة" },
                { label: "لا", value: "لا" },
              ]}
            />

            <SelectField
              label="نوع التوقيف"
              value={formData.type_parked ?? ""}
              onChange={(v) => handleChange("type_parked", v)}
              options={[
                { label: "نهائي", value: "نهائي" },
                { label: "مؤقت", value: "مؤقت" },
              ]}
              disabled={formData.vihicile_parked === "لا"}
            />
          </div>

          {/* Row 16 - التواريخ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="تاريخ التوقيف"
              type="date"
              value={
                formData.hestoire_parked
                  ? new Date(formData.hestoire_parked)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(v) => handleChange("hestoire_parked", v)}
              disabled={formData.vihicile_parked === "لا"}
            />

            <InputField
              label="تاريخ نهاية التوقيف المؤقت"
              type="date"
              value={
                formData.hestoire_parked_end
                  ? new Date(formData.hestoire_parked_end)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(v) => handleChange("hestoire_parked_end", v)}
              disabled={
                formData.vihicile_parked === "لا" ||
                formData.type_parked === "نهائي"
              }
            />
          </div>

          {/* Row 17 - المسار والمعني */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="المسار"
              type="text"
              value={formData.path ?? ""}
              onChange={(v) => handleChange("path", v)}
            />

            <InputField
              label="المعني بالتعيين"
              type="text"
              value={formData.person_concerned ?? ""}
              onChange={(v) => handleChange("person_concerned", v)}
            />
          </div>

          {/* Row 18 - الملاحظات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="ملاحظات"
              type="text"
              value={formData.comments ?? ""}
              onChange={(v) => handleChange("comments", v)}
            />

            <InputField
              label="ملاحظات رئيس القسم"
              type="text"
              value={formData.note_chef_departement ?? ""}
              onChange={(v) => handleChange("note_chef_departement", v)}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader className="animate-spin" /> : "إرسال البيانات"}
          </Button>
        </form>
      </div>
      {errorDetails?.message === "المركبة مسجلة من قبل" && (
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-lg mb-2">⚠️ حدث خطأ أثناء العملية</h3>
          <p>{errorDetails.message || "حدث خطأ غير متوقع"}</p>

          {/* لو في تفاصيل إضافية */}
          {errorDetails && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
              <div className="bg-red-50 border border-red-300 text-red-700 p-6 rounded-xl shadow-xl max-w-md w-full text-center animate-fadeIn">
                <h3 className="font-bold text-xl mb-3">
                   <p>{errorDetails.message  || "حدث خطأ غير متوقع"}</p>
                </h3>
                <p className="text-black font-semibold">معلومات عن المركبة المسجلة</p>
                
                {errorDetails && (
                  <ul className="list-disc text-right pr-6 mt-3 text-sm text-red-600">
                    <li className="text-xl font-semibold">الاسم الكامل : {errorDetails?.data?.fullName_arabe}</li>
                    <li className="text-xl font-semibold">رقم المركبة: {errorDetails?.data?.matricule}</li>
                    <li className="text-xl font-semibold">نوع الخط: {errorDetails?.data?.font_type}</li>
                  </ul>
                )}

                <button
                  onClick={() => window.location.reload()}
                  className="mt-5 bg-red-600 text-white py-2 px-5 rounded-lg hover:bg-red-700 transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </MainContainer>
  );
};

// ✅ Reusable Input Component
const InputField = ({
  label,
  type,
  value,
  onChange,
  onBlur, 
  disabled = false,
  status,
  message,
}: {
  label: string;
  type: string;
  value: string | number | Date | null | undefined;
  onChange: (v: string | number | Date) => void;
  onBlur?: () => void;
  disabled?: boolean;
  status?: "idle" | "loading" | "success" | "error";
  message?: string;
}) => {
  let displayValue: string | number | undefined = "";

  if (type === "date" && value) {
    displayValue =
      value instanceof Date
        ? value.toISOString().split("T")[0]
        : new Date(value).toISOString().split("T")[0];
  } else if (value !== null && value !== undefined) {
    displayValue = value as string | number;
  }

  const borderClass =
    status === "error"
      ? "border-red-500 focus-visible:ring-red-500"
      : status === "success"
      ? "border-green-500 focus-visible:ring-green-500"
      : status === "loading"
      ? "border-gray-400"
      : "";

  const messageColor =
    status === "error"
      ? "text-red-600"
      : status === "success"
      ? "text-green-600"
      : "text-gray-500";

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm text-end font-medium text-gray-700">
        {label}
      </label>

      <Input
        type={type}
        value={displayValue}
        disabled={disabled}
        className={`transition-all ${borderClass}`}
        onBlur={onBlur} 
        onChange={(e) => {
          const inputVal = e.target.value;

          if (type === "number") {
            onChange(Number(inputVal));
          } else if (type === "date") {
            onChange(inputVal ? new Date(inputVal) : "");
          } else {
            onChange(inputVal);
          }
        }}
      />

      {/* 👇 message UNDER field */}
      {message && status !== "idle" && (
        <p className={`text-sm text-end ${messageColor}`}>
          {message}
        </p>
      )}
    </div>
  );
};

// ✅ Reusable Select Component
const SelectField = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
}) => (
  <div className="flex flex-col gap-1">
    <label className="block text-sm font-medium text-end text-gray-700">
      {label}
    </label>
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="اختر" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default FormOperateur;
