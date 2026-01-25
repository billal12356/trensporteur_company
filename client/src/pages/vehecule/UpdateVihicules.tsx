import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { Vihicles } from "@/components/types/OperateurTypes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "lucide-react";
import { FindOneVihicule, updateVihicules, clearMessageUpdate } from "@/redux/slice/vihiculeSlice";
import MainContainer from "@/components/MainContainer";
import { Helmet } from "react-helmet-async";
import { isEqual } from "lodash";

const EditOperateur = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { vihicule, loading, messageUpdate } = useSelector(
    (state: RootState) => state.vihicule
  );

  const [formData, setFormData] = useState<Partial<Vihicles>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // ✅ Fetch vihicule by ID
  useEffect(() => {
    if (id) {
      // Clear the previous success message when switching to a new vihicule
      dispatch(clearMessageUpdate());
      dispatch(FindOneVihicule(id));
      // Reset form and message when loading a new vihicule
      setFormData({});
      setHasChanges(false);
    }
  }, [dispatch, id]);

  // ✅ Populate form data once fetched
  useEffect(() => {
    if (vihicule) setFormData(vihicule);
  }, [vihicule]);

  // ✅ Compare for changes
  useEffect(() => {
    if (!vihicule) return;
    setHasChanges(!isEqual(formData, vihicule));
  }, [formData, vihicule]);

  // ✅ Navigate after update (only when messageUpdate changes from empty to filled)
  useEffect(() => {
    if (messageUpdate && id) {
      // Show toast and redirect after a short delay to let user see the success message
      const timer = setTimeout(() => {
        navigate("/vehecule");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [messageUpdate, id, navigate]);

  // ✅ Handle input changes safely
  const handleChange = (
    name: keyof Vihicles,
    value: string | number | Date | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : value,
    }));
  };

  // ✅ Handle submit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !hasChanges) return;
    dispatch(updateVihicules({ id, data: formData }));
  };

  return (
    <MainContainer>
      <Helmet>
        <title>تعديل المركبة</title>
        <meta name="description" content="مرحبا بك في Finissio" />
      </Helmet>

      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded mt-10">
        <h2 className="text-2xl font-bold mb-6 text-center">
          ✏️ تعديل بيانات المركبة
        </h2>

        <form className="space-y-10" onSubmit={handleSubmitForm}>
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
                { label: "نعم", value: "نعم" },
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
              disabled={!formData.vihicile_parked || formData.vihicile_parked === "لا"}
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
              disabled={!formData.vihicile_parked || formData.vihicile_parked === "لا"}
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
                !formData.vihicile_parked ||
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

          {/* ✅ Submit */}
          <Button
            type="submit"
            disabled={loading || !hasChanges} // disable if no changes
            className={`w-full ${
              !hasChanges ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <Loader />
            ) : hasChanges ? (
              "💾 حفظ التعديلات"
            ) : (
              "لا توجد تغييرات"
            )}
          </Button>
        </form>
      </div>
    </MainContainer>
  );
};

// ✅ InputField component
const InputField = ({
  label,
  type,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  type: string;
  value: string | number | Date | null | undefined;
  onChange: (v: string | number | Date) => void;
  disabled?: boolean;
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

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm text-end font-medium text-gray-700">
        {label}
      </label>
      <Input
        type={type}
        value={displayValue}
        disabled={disabled}
        onChange={(e) => {
          const val = e.target.value;
          if (type === "number") onChange(Number(val));
          else if (type === "date") onChange(val ? new Date(val) : "");
          else onChange(val);
        }}
      />
    </div>
  );
};

// ✅ SelectField component
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

export default EditOperateur;
