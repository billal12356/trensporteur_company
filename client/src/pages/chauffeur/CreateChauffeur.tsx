import MainContainer from "@/components/MainContainer";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Chauffeur } from "@/components/types/OperateurTypes";
import { Loader } from "lucide-react";
import { createChauffeurs } from "@/redux/slice/chauffeurSlice";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const FormChauffeur: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading } = useSelector((state: RootState) => state.chauffeur);

  // Initialize state for all Chauffeur fields
  const [formData, setFormData] = useState<Partial<Chauffeur>>({
    num_chauffeur: undefined,
    num_demende: undefined,
    num_enregistrement_du_transporteur: undefined,
    hestoire_demende: "",
    operateur: "",
    ligne_exploitée: "",
    nature_ligne: "",
    num_vehicule: "",
    num_didentification_national_NIN: undefined,
    nature_utilisateur: "",
    nom_prenom_chauffeur: "",
    date_sortie: "",
    num_permis_conduire: "",
    date_expiration_article: "",
    municipalite_emettrice: "",
    address: "",
    lieu_naissance: "",
    date_naissance: "",
    date_obtention_certificat_aptitude_professionnelle: "",
    Num_certificat_compétence_professionnelle: undefined,
    num_membre_fonds_national: undefined,
    num_serie: undefined,
    wilaya: "",
    type_parked: "",
    vihicile_parked: "",
    comments: "",
  });

  // handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === "num_didentification_national_NIN") {
      const onlyNumbers = value.replace(/\D/g, "").slice(0, 18);
      setFormData((prev) => ({ ...prev, [name]: onlyNumbers === "" ? undefined : Number(onlyNumbers) }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" ? (value === "" ? undefined : Number(value)) : value,
    }));
  };

  // handle select change
  const handleSelectChange = (name: keyof Chauffeur, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields: (keyof Chauffeur)[] = [
      "num_chauffeur", "num_demende", "hestoire_demende", "num_enregistrement_du_transporteur",
      "operateur", "ligne_exploitée", "nature_ligne", "num_vehicule",
      "nature_utilisateur", "nom_prenom_chauffeur", "num_didentification_national_NIN",
      "num_permis_conduire", "date_sortie", "date_expiration_article",
      "municipalite_emettrice", "date_naissance", "lieu_naissance", "address",
      "Num_certificat_compétence_professionnelle", "date_obtention_certificat_aptitude_professionnelle",
      "wilaya", "num_serie", "num_membre_fonds_national", "vihicile_parked"
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      toast.error("يرجى ملء جميع الحقول المطلوبة!");
      return;
    }

    const nin = String(formData.num_didentification_national_NIN || "");
    if (nin.length !== 18) {
      toast.error("رقم التعريف الوطني يجب أن يتكون من 18 رقماً بالضبط!");
      return;
    }

    try {
      await dispatch(createChauffeurs(formData as Chauffeur)).unwrap();
      toast.success("تم تسجيل السائق بنجاح!");
      navigate("/chauffeur");
    } catch (error: any) {
      toast.error(error || "حدث خطأ أثناء التسجيل");
    }
  };


  return (
    <MainContainer>
      <Helmet>
        <title>اضافة السائق</title>
        <meta name="description" content="مرحبا بك في Finissio" />
        <link
          rel="icon"
          type="image/png"
          href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s"
        />
      </Helmet>

      <div className="w-full max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          📝 تسجيل السائق
        </h2>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-end font-medium text-gray-700">
                رقم المستخدم <span className="text-red-500">*</span>
              </label>
              <Input
                name="num_chauffeur"
                type="number"
                required
                value={formData.num_chauffeur ?? ""}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-end font-medium text-gray-700">
                رقم الطلب <span className="text-red-500">*</span>
              </label>
              <Input
                name="num_demende"
                type="number"
                required
                value={formData.num_demende ?? ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-end font-medium text-gray-700">
                رقم القيد للناقل <span className="text-red-500">*</span>
              </label>
              <Input
                name="num_enregistrement_du_transporteur"
                type="number"
                required
                value={formData.num_enregistrement_du_transporteur ?? ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-end text-gray-700">
                تاريخ الطلب <span className="text-red-500">*</span>
              </label>
              <Input
                name="hestoire_demende"
                type="date"
                required
                value={formData.hestoire_demende || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-end text-gray-700">
                المتعامل <span className="text-red-500">*</span>
              </label>
              <Input
                name="operateur"
                required
                value={formData.operateur || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-end text-gray-700">
                الخط المستغل <span className="text-red-500">*</span>
              </label>
              <Input
                name="ligne_exploitée"
                required
                value={formData.ligne_exploitée || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-end text-gray-700">
                طبيعة الخط <span className="text-red-500">*</span>
              </label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("nature_ligne", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ريفي">ريفي</SelectItem>
                  <SelectItem value="بلدي">بلدي</SelectItem>
                  <SelectItem value="بين الولايات">بين الولايات</SelectItem>
                  <SelectItem value="الحضري">الحضري</SelectItem>
                  <SelectItem value="نقل المدرسي">نقل المدرسي</SelectItem>
                  <SelectItem value="نقل العمال">نقل العمال</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-end text-gray-700">
                ترقيم المركبة <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="num_vehicule"
                required
                value={formData.num_vehicule || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="block text-sm text-end font-medium text-gray-700">
                رقم التعريف الوطني NIN <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="num_didentification_national_NIN"
                required
                value={formData.num_didentification_national_NIN ?? ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                طبيعة المستخدم <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="nature_utilisateur"
                required
                value={formData.nature_utilisateur || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                اسم و لقب السائق <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="nom_prenom_chauffeur"
                required
                value={formData.nom_prenom_chauffeur || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                تاريخ الاصدار <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="date_sortie"
                required
                value={formData.date_sortie || ""}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-sm text-end font-medium text-gray-700">
                رقم رخصة السياقة <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="num_permis_conduire"
                required
                value={formData.num_permis_conduire || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 7 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                نهاية صلاحية الصنف <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="date_expiration_article"
                required
                value={formData.date_expiration_article || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                بلدية الاصدار <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="municipalite_emettrice"
                required
                value={formData.municipalite_emettrice || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 8 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                العنوان <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="address"
                required
                value={formData.address || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                مكان الميلاد <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="lieu_naissance"
                required
                value={formData.lieu_naissance || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                تاريخ الميلاد <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="date_naissance"
                required
                value={formData.date_naissance || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 9 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                تاريخ الحصول على شهادة الكفاءة <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="date_obtention_certificat_aptitude_professionnelle"
                required
                value={
                  formData.date_obtention_certificat_aptitude_professionnelle ||
                  ""
                }
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                رقم شهادة الكفاءة المهنية <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="Num_certificat_compétence_professionnelle"
                required
                value={formData.Num_certificat_compétence_professionnelle ?? ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 10 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                رقم الانتساب إلى الصندوق الوطني <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="num_membre_fonds_national"
                required
                value={formData.num_membre_fonds_national ?? ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                الرقم التسلسلي <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="num_serie"
                required
                value={formData.num_serie ?? ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                الولاية <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="wilaya"
                required
                value={formData.wilaya || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 11 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                نوع التوقف <span className="text-red-500">*</span>
              </label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("type_parked", value)
                }
                disabled={formData.vihicile_parked === "لا"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نهائي">نهائي</SelectItem>
                  <SelectItem value="مؤقت">مؤقت</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                المركبة موقفة أو لا <span className="text-red-500">*</span>
              </label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("vihicile_parked", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="موقفة">موقفة</SelectItem>
                  <SelectItem value="لا">لا</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-end text-gray-700">
              ملاحظة
            </label>
            <Textarea
              name="comments"
              value={formData.comments || ""}
              onChange={handleChange}
              placeholder="أدخل أي ملاحظات"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer"
          >
            {loading ? <Loader /> : "إرسال البيانات"}
          </Button>
        </form>
      </div>
    </MainContainer>
  );
};

export default FormChauffeur;
