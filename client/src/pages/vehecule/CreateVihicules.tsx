import MainContainer from "@/components/MainContainer";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // If Select exists
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { Vihicles } from "@/components/types/OperateurTypes";
import { Loader } from "lucide-react";
import { createVihicules } from "@/redux/slice/vihiculeSlice";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

const FormOperateur: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.vihicule);
  const [formData, setFormData] = useState<Partial<Vihicles>>({});

  console.log("formData", formData)
  const depnd = formData.vihicile_parked;
  const handleChange = (field: keyof Vihicles, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await dispatch(createVihicules(formData as Vihicles)).unwrap();
      navigate("/Véhecule");
    } catch (error) {
      console.log("error", error);
    }
  };
  console.log("formData", formData);
  return (
    <MainContainer>
      <Helmet>
        <title>اضافة مركبة</title>
        <meta name="description" content="مرحبا بك في Finissio" />
        <link
          rel="icon"
          type="image/png"
          href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s"
        />
      </Helmet>
      <div className="w-full max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          📝 تسجيل المركبة
        </h2>
        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">

              <InputField
                label="رقم ملف المتعامل في سجل الناقلين"
                type="number"
                value={formData.num_docier_client ?? ""}
                onChange={(val) => handleChange("num_docier_client", Number(val as number))}
              />
            </div>
            <div className="flex flex-col gap-2">

              <InputField
                label="رقم الولاية"
                type="number"
                value={formData.num_wilaya ?? ""}
                onChange={(val) => handleChange("num_wilaya", Number(val as number))}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                الاسم و لقب المتعامل بالعربية
              </label>
              <Input
                type="text"
                onChange={(v) => handleChange("fullName_arabe", v)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                الاسم و لقب المتعامل بالفرنسية
              </label>
              <Input
                type="text"
                onChange={(v) => handleChange("fullName_francais", v)}
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* colonne 1 Field */}
            <SelectField
              label="Colonne 1"
              value={formData.colonne1 ?? ""}
              onChange={(v) => handleChange("colonne1", v)}
              options={[
                { label: "transport voyageurs", value: "transport_passagers" },
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
            {/* colonne 1 Field */}
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
                { label: "PRIVE", value: "PRIVE" },
                { label: "PUBLICE", value: "PUBLICE" },
              ]}
            />
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* colonne 1 Field */}
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
              label="رقم تسجيل الحافلة او الشاحنة"
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
              label="اول سنة استعمال"
              type="text"
              value={formData.First_year_of_use ?? ""}
              onChange={(v) => handleChange("First_year_of_use", v)}
            />
            <SelectField
              label="النوع"
              value={formData.type ?? ""}
              onChange={(v) => handleChange("type", v)}
              options={[
                { label: "حافلة", value: "حافلة" },
                { label: "حافلة صغيرة", value: "حافلة صغيرة" },
                { label: "MINI CAR", value: "MINI CAR" },
                { label: "مجهزة سيارة", value: "مجهزة سيارة" },
              ]}
            />
          </div>

          {/* Row 9 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="عدد المقاعد"
              type="text"
              value={formData.Number_of_seats ?? ""}
              onChange={(v) => handleChange("Number_of_seats", v)}
            />
            <SelectField
              label="الطاقة"
              value={formData.Energy ?? ""}
              onChange={(v) => handleChange("Energy", v)}
              options={[
                { label: "مازوت", value: "مازوت" },
                { label: "بنزين", value: "PUBLICE" },
              ]}
            />
          </div>

          {/* Row 10 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="تاريخ رخصة السير"
              type="text"
              value={formData.driving_license_history ?? ""}
              onChange={(v) => handleChange("driving_license_history", v)}
            />
            <InputField
              label="رقم رخصة سير المركبة"
              type="text"
              value={formData.num_driving_license ?? ""}
              onChange={(v) => handleChange("num_driving_license", v)}
            />
          </div>

          {/* Row 11 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="تاريخ بداية نشاط الخط"
              type="text"
              value={formData.line_activity_start_date ?? ""}
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
              value={formData.Vehicle_activity_start_date ?? ""}
              onChange={(val) =>
                handleChange("Vehicle_activity_start_date", new Date(val as string))
              }
            />
          </div>

          {/* Row 13 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="رمز الخط"
              type="string"
              value={formData.font_symbol ?? ""}
              onChange={(v) => handleChange("font_symbol", v)}
            />
            <SelectField
              label="colonne 4"
              value={formData.colonne1 ?? ""}
              onChange={(v) => handleChange("colonne1", v)}
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
              type="string"
              value={formData.point_arrive ?? ""}
              onChange={(v) => handleChange("point_arrive", v)}
            />
            <InputField
              label="نقطة الانطلاق"
              type="string"
              value={formData.point_depart ?? ""}
              onChange={(v) => handleChange("point_depart", v)}
            />
          </div>

          {/* Row 14 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="نقطة المرور 3"
              type="string"
              value={formData.point_Traffic3 ?? ""}
              onChange={(v) => handleChange("point_Traffic3",v)}
            />
            <InputField
              label="نقطة المرور 2"
              type="string"
              value={formData.point_Traffic2 ?? ""}
              onChange={(v) => handleChange("point_Traffic2",v)}
            />
            <InputField
              label="نقطة المرور 1"
              type="string"
              value={formData.point_Traffic1 ?? ""}
              onChange={(v) => handleChange("point_Traffic1",v)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="نقطة المرور 5"
              type="string"
              value={formData.point_Traffic5 ?? ""}
              onChange={(v) => handleChange("point_Traffic5",v)}
            />
            <InputField
              label="نقطة المرور 4"
              type="string"
              value={formData.point_Traffic4 ?? ""}
              onChange={(v) => handleChange("point_Traffic4",v)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="توقيت نهاية الخط"
              type="string"
              value={formData.line_end_time ?? ""}
              onChange={(v) => handleChange("line_end_time",  v)}
            />
            <InputField
              label="توقيت بداية الخط"
              type="string"
              value={formData.line_start_time ?? ""}
              onChange={(v) => handleChange("line_start_time",  v)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="توقيت الانطلاق 1"
              type="string"
              value={formData.time_depart1 ?? ""}
              onChange={(v) => handleChange("time_depart1", v)}
            />
            <InputField
              label="الوتيرة بالدقائق بالنسبة للحضري"
              type="number"
              value={formData.Pace_per_minute ?? ""}
              onChange={(val) => handleChange("Pace_per_minute", Number(val as number))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="توقيت الانطلاق 4"
              type="string"
              value={formData.time_depart4 ?? ""}
              onChange={(v) => handleChange("time_depart4",v)}
            />
            <InputField
              label="توقيت الانطلاق 3"
              type="string"
              value={formData.time_depart3 ?? ""}
              onChange={(v) => handleChange("time_depart3",v)}
            />
            <InputField
              label="توقيت الانطلاق 2"
              type="string"
              value={formData.time_depart2 ?? ""}
              onChange={(v) => handleChange("time_depart2",v)}
            />
          </div>
          {/* Row 15 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="المركبة موقفة او لا"
              value={formData.vihicile_parked ?? ""}
              onChange={(v) => handleChange("vihicile_parked", v)}
              options={[
                { label: "متوقفة", value: "متوقفة" },
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
              disabled={depnd === "لا"} // هنا الشرط
            />
          </div>

          {/* Row 16 */}
          {/* Row 16 - التوقيف */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="تاريخ نهاية توقيف مؤقت"
              type="date"
              value={formData.hestoire_parked_end ?? ""}
              onChange={(v) => handleChange("hestoire_parked_end", v)}
              disabled={depnd === "لا"}
            />

            <InputField
              label="تاريخ التوقيف"
              type="date"
              value={formData.hestoire_parked ?? ""}
              onChange={(v) => handleChange("hestoire_parked", v)}
              disabled={depnd === "لا"}
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

          {/* ملاحظات */}
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

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader className="animate-spin" /> : "إرسال البيانات"}
          </Button>
        </form>
      </div>
    </MainContainer>
  );
};

// Input Field Component
// ✅ Input Field Component
const InputField = ({
  label,
  type,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  type: string;
  value: string | number;
  onChange: (v: string | number) => void;
  disabled?: boolean;
}) => (
  <div className="flex flex-col gap-2">
    <label className="block text-sm text-end font-medium text-gray-700">
      {label}
    </label>
    <Input
      type={type}
      value={value}
      disabled={disabled}
      onChange={(e) => {
        const val = type === "number" ? Number(e.target.value) : e.target.value;
        onChange(val);
      }}
    />
  </div>
);

// ✅ Select Field Component
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
