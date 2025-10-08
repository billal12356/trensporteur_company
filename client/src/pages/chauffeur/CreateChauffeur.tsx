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
    await dispatch(createChauffeurs(formData as Chauffeur)).unwrap();
    navigate("/chauffeur");
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
                رقم المستخدم
              </label>
              <Input
                name="num_chauffeur"
                type="number"
                value={formData.num_chauffeur ?? ""}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-end font-medium text-gray-700">
                رقم الطلب
              </label>
              <Input
                name="num_demende"
                type="number"
                value={formData.num_demende ?? ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-end font-medium text-gray-700">
                رقم القيد للناقل
              </label>
              <Input
                name="num_enregistrement_du_transporteur"
                type="number"
                value={formData.num_enregistrement_du_transporteur ?? ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-end text-gray-700">
                تاريخ الطلب
              </label>
              <Input
                name="hestoire_demende"
                type="date"
                value={formData.hestoire_demende || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-end text-gray-700">
                المتعامل
              </label>
              <Input
                name="operateur"
                value={formData.operateur || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-end text-gray-700">
                الخط المستغل
              </label>
              <Input
                name="ligne_exploitée"
                value={formData.ligne_exploitée || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-end text-gray-700">
                طبيعى الخط
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
                ترقيم المركبة
              </label>
              <Input
                type="text"
                name="num_vehicule"
                value={formData.num_vehicule || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="block text-sm text-end font-medium text-gray-700">
                رقم التعريف الوطني NIN
              </label>
              <Input
                type="number"
                name="num_didentification_national_NIN"
                value={formData.num_didentification_national_NIN ?? ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                طبيعة المستخدم
              </label>
              <Input
                type="text"
                name="nature_utilisateur"
                value={formData.nature_utilisateur || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                اسم و لقب السائق
              </label>
              <Input
                type="text"
                name="nom_prenom_chauffeur"
                value={formData.nom_prenom_chauffeur || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                تاريخ الاصدار
              </label>
              <Input
                type="date"
                name="date_sortie"
                value={formData.date_sortie || ""}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-sm text-end font-medium text-gray-700">
                رقم رخصة السياقة
              </label>
              <Input
                type="text"
                name="num_permis_conduire"
                value={formData.num_permis_conduire || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 7 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                نهاية صلاحية الصنف
              </label>
              <Input
                type="date"
                name="date_expiration_article"
                value={formData.date_expiration_article || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                بلدية الاصدار
              </label>
              <Input
                type="text"
                name="municipalite_emettrice"
                value={formData.municipalite_emettrice || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 8 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                العنوان
              </label>
              <Input
                type="text"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                مكان الميلاد
              </label>
              <Input
                type="text"
                name="lieu_naissance"
                value={formData.lieu_naissance || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                تاريخ الميلاد
              </label>
              <Input
                type="date"
                name="date_naissance"
                value={formData.date_naissance || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 9 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                تاريخ الحصول على شهادة الكفاءة
              </label>
              <Input
                type="date"
                name="date_obtention_certificat_aptitude_professionnelle"
                value={
                  formData.date_obtention_certificat_aptitude_professionnelle ||
                  ""
                }
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                رقم شهادة الكفاءة المهنية
              </label>
              <Input
                type="number"
                name="Num_certificat_compétence_professionnelle"
                value={formData.Num_certificat_compétence_professionnelle ?? ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 10 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                رقم الانتساب إلى الصندوق الوطني
              </label>
              <Input
                type="number"
                name="num_membre_fonds_national"
                value={formData.num_membre_fonds_national ?? ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                الرقم التسلسلي
              </label>
              <Input
                type="number"
                name="num_serie"
                value={formData.num_serie ?? ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                الولاية
              </label>
              <Input
                type="text"
                name="wilaya"
                value={formData.wilaya || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 11 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                نوع التوقف
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
                المركبة موقفة أو لا
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
