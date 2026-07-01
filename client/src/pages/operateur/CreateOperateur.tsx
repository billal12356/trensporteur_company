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
import { createOperateur } from "@/redux/slice/operateurSlice";
import { Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Operateur } from "@/components/types/OperateurTypes";
import { toast } from "sonner";
const FormOperateur: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // --- Local state for all fields ---
  const [operateur, setOperateur] = useState<Partial<Operateur>>({});
  const depnd = operateur.depend_activite;
  const [mereLastNameAr, setMereLastNameAr] = useState("");
  const [mereFirstNameAr, setMereFirstNameAr] = useState("");
  const [mereLastNameFr, setMereLastNameFr] = useState("");
  const [mereFirstNameFr, setMereFirstNameFr] = useState("");
  const [ninError, setNinError] = useState("");
  const [ninStatus, setNinStatus] = useState<"warning" | "error" | "success" | "">("");
  const { successMessage, loading,error } = useSelector(
    (state: RootState) => state.operateur
  );

  console.log("error ==>",error)
  console.log("successMessage", successMessage)

  // Generic field handler
  const handleChange = (field: keyof Operateur, value: any) => {
    setOperateur((prev) => ({ ...prev, [field]: value }));
  };

  // Submit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields: (keyof Operateur)[] = [
      "num_wilaya", "num_docier_client", "fullName_arabe", "fullName_francais",
      "date_expiration", "date_prévue", "num_dhoraire", "num_cate_enregistement",
      "activite", "nature_activite", "status_activite", "type_client",
      "num_dacte_naissance", "num_didentification_national_NIN", "Tax_identification_number_NIF",
      "date_naissance", "lieu_naissance_arabe", "lieu_naissance_francais",
      "nom_pere_arabe", "nom_pere_francais", "communes_naissance_arabe",
      "communes_naissance_francais", "address_arabe", "address_francais",
      "address_municipalité_arabe", "address_municipalité_francais",
      "num_registre_commerce", "num_registre_commerce_n5",
      "hestoire_registre_commerce", "modifier_hestoire_registre_commerce",
      "date_debut_activite"
    ];

    const missingFields = requiredFields.filter(field => !operateur[field]);

    if (missingFields.length > 0 || !mereLastNameAr || !mereFirstNameAr || !mereLastNameFr || !mereFirstNameFr) {
      toast.error("يرجى ملء جميع الحقول المطلوبة!");
      return;
    }

    const nin = String(operateur.num_didentification_national_NIN || "");
    if (nin.length !== 18) {
      toast.error("رقم التعريف الوطني يجب أن يتكون من 18 رقماً بالضبط!");
      return;
    }

    const payload = {
      ...operateur,

      fullName_mere_arabe:
        `${mereLastNameAr} ${mereFirstNameAr}`.trim(),

      fullName_mere_francais:
        `${mereLastNameFr} ${mereFirstNameFr}`.trim(),
    };
    try {
      await dispatch(createOperateur(payload)).unwrap();
      navigate("/operateur"); 
    } catch (err: any) {
      // toast is already displayed in the slice
    }
  };

  const handleNinChange = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, "");

    handleChange("num_didentification_national_NIN", onlyNumbers);

    if (onlyNumbers.length < 18) {
      setNinError("رقم التعريف الوطني يجب ان يكون 18 ليس اقل");
      setNinStatus("warning");
    } else if (onlyNumbers.length > 18) {
      setNinError("رقم التعريف الوطني يجب ان يكون 18 ليس اكثر");
      setNinStatus("error");
    } else {
      setNinError("");
      setNinStatus("success");
    }
  };


  return (
    <MainContainer>
      <Helmet>
        <title>اضافة المتعامل</title>
        <meta name="description" content="مرحبا بك في Finissio" />
        <link
          rel="icon"
          type="image/png"
          href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s"
        />
      </Helmet>

      <div className="w-full max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          📝 تسجيل المتعامل
        </h2>

        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* Example of controlled Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-end font-medium text-gray-700">
                رقم ملف المتعامل <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                required
                value={operateur.num_docier_client ?? ""}
                onChange={(e) =>
                  handleChange("num_docier_client", Number(e.target.value))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-end font-medium text-gray-700">
                رقم الولاية <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                required
                value={operateur.num_wilaya ?? ""}
                onChange={(e) =>
                  handleChange("num_wilaya", Number(e.target.value))
                }
              />
            </div>
          </div>

          {/* Date + Names */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-end text-gray-700">
                تاريخ انتهاء الصلاحية <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                required
                value={operateur.date_expiration ?? ""}
                onChange={(e) =>
                  handleChange("date_expiration", e.target.value)
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-end text-gray-700">
                الاسم و لقب المتعامل بالعربية <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={operateur.fullName_arabe ?? ""}
                onChange={(e) => handleChange("fullName_arabe", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-end text-gray-700">
                الاسم و لقب المتعامل بالفرنسية <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={operateur.fullName_francais ?? ""}
                onChange={(e) =>
                  handleChange("fullName_francais", e.target.value)
                }
              />
            </div>
          </div>

          {/* Example Selects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-end text-gray-700">
                النشاط <span className="text-red-500">*</span>
              </label>
              <Select
                value={operateur.activite ?? ""}
                onValueChange={(val) => handleChange("activite", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نقل المسافرين">نقل المسافرين</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-end text-gray-700">
                حالة النشاط <span className="text-red-500">*</span>
              </label>
              <Select
                value={operateur.status_activite ?? ""}
                onValueChange={(val) => handleChange("status_activite", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="عمومي">عمومي</SelectItem>
                  <SelectItem value="خاص">خاص</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                رقم بطاقة القيد <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                required
                value={operateur.num_cate_enregistement ?? ""}
                onChange={(e) =>
                  handleChange(
                    "num_cate_enregistement",
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                رقم مقررة <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                required
                value={operateur.num_dhoraire ?? ""}
                onChange={(e) =>
                  handleChange(
                    "num_dhoraire",
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                تاريخ المقررة <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                required
                value={operateur.date_prévue ?? ""}
                onChange={(e) => handleChange("date_prévue", e.target.value)}
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* colonne 1 Field */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                Colonne 1
              </label>
              <Select
                value={operateur.colonne1 ?? ""}
                onValueChange={(val) => handleChange("colonne1", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transport_passagers">
                    transport voyageurs
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                النشاط <span className="text-red-500">*</span>
              </label>
              <Select
                value={operateur.activite ?? ""}
                onValueChange={(val) => handleChange("activite", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نقل المسافرين">نقل المسافرين</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Colonne 2 */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                Colonne 2
              </label>
              <Select
                value={operateur.colonne2 ?? ""}
                onValueChange={(val) => handleChange("colonne2", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TPCV">TPCV</SelectItem>
                  <SelectItem value="TPV">TPV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* طبيعة النشاط */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                طبيعة النشاط <span className="text-red-500">*</span>
              </label>
              <Select
                value={operateur.nature_activite ?? ""}
                onValueChange={(val) => handleChange("nature_activite", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="عمومي للمسافرين">
                    عمومي للمسافرين
                  </SelectItem>
                  <SelectItem value="خاص للمسافرين">خاص للمسافرين</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Colonne 3 */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                Colonne 3
              </label>
              <Select
                value={operateur.colonne3 ?? ""}
                onValueChange={(val) => handleChange("colonne3", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Privé">Privé</SelectItem>
                  <SelectItem value="Publique">Publique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* حالة النشاط */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                حالة النشاط <span className="text-red-500">*</span>
              </label>
              <Select
                value={operateur.status_activite ?? ""}
                onValueChange={(val) => handleChange("status_activite", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="عمومي">عمومي</SelectItem>
                  <SelectItem value="خاص">خاص</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 7 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Colonne 4 */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                Colonne 4
              </label>
              <Select
                value={operateur.colonne4 ?? ""}
                onValueChange={(val) => handleChange("colonne4", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Person physique">
                    Person physique
                  </SelectItem>
                  <SelectItem value="Person moral">Person moral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* نوع المتعامل */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                نوع المتعامل <span className="text-red-500">*</span>
              </label>
              <Select
                value={operateur.type_client ?? ""}
                onValueChange={(val) => handleChange("type_client", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="شخص طبيعي">شخص طبيعي</SelectItem>
                  <SelectItem value="شخص معنوي">شخص معنوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 8 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* شكل الشركة او المؤسسة */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                شكل الشركة او المؤسسة في حالة شخص معنوي
              </label>
              <Select
                value={operateur.institution_person_moral ?? ""}
                onValueChange={(val) =>
                  handleChange("institution_person_moral", val)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SARL - ش ذ م م">SARL - ش ذ م م</SelectItem>
                  <SelectItem value="EURL - ش ذ ش و">EURL - ش ذ ش و</SelectItem>
                  <SelectItem value="SNC - شركة تضامن">
                    SNC - شركة تضامن
                  </SelectItem>
                  <SelectItem value="SPA - ش ذ ا">SPA - ش ذ ا</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* الاسم و لقب المسير */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                الاسم و لقب المسير في السجل التجاري في حالة شخص معنوي
              </label>
              <Input
                type="text"
                value={operateur.fullName_gerent_person_moral ?? ""}
                onChange={(e) =>
                  handleChange("fullName_gerent_person_moral", e.target.value)
                }
              />
            </div>
          </div>

          {/* Row 9 - الميلاد */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                رقم شهادة الميلاد <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                required
                value={operateur.num_dacte_naissance ?? ""}
                onChange={(e) =>
                  handleChange("num_dacte_naissance", Number(e.target.value))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                رقم التعريف الوطني NIN <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                maxLength={18}
                required
                value={operateur.num_didentification_national_NIN ?? ""}
                onChange={(e) => handleNinChange(e.target.value)}
                className={`
                  ${ninStatus === "warning" ? "bg-yellow-100 border-yellow-500" : ""}
                  ${ninStatus === "error" ? "bg-red-100 border-red-500" : ""}
                  ${ninStatus === "success" ? "bg-green-100 border-green-500" : ""}
                `}
              />
              {ninError && (
                <p
                  className={`
                  text-sm text-end mt-1
                  ${ninStatus === "warning" ? "text-yellow-600" : ""}
                  ${ninStatus === "error" ? "text-red-600" : ""}
                  `}
                >
                 {ninError}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-end text-gray-700">
              رقم التعريف الجبائي NIF <span className="text-red-500">*</span>
            </label>

             <Input
              type="number"
              value={operateur.Tax_identification_number_NIF ?? ""}
              onChange={(e) =>
               handleChange(
               "Tax_identification_number_NIF",
               e.target.value === "" ? "" : Number(e.target.value)
              )
              }
              placeholder="أدخل رقم التعريف الجبائي"
            />
          </div>

          {/* Row 10 - معلومات الميلاد */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                مكان الميلاد بالفرنسية <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={operateur.lieu_naissance_francais ?? ""}
                onChange={(e) =>
                  handleChange("lieu_naissance_francais", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                مكان الميلاد بالعربية <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={operateur.lieu_naissance_arabe ?? ""}
                onChange={(e) =>
                  handleChange("lieu_naissance_arabe", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                تاريخ الميلاد <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                required
                value={operateur.date_naissance ?? ""}
                onChange={(e) => handleChange("date_naissance", e.target.value)}
              />
            </div>
          </div>

          {/* Row 11 - بيانات الوالدين */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                اسم و لقب الام بالعربية <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  type="text"
                  required
                  placeholder="لقب الأم"
                  value={mereLastNameAr}
                  onChange={(e) => setMereLastNameAr(e.target.value)}
                />

                <Input
                  type="text"
                  required
                  placeholder="اسم الأم"
                  value={mereFirstNameAr}
                  onChange={(e) => setMereFirstNameAr(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                اسم الاب بالفرنسية <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={operateur.nom_pere_francais ?? ""}
                onChange={(e) =>
                  handleChange("nom_pere_francais", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                اسم الاب بالعربي <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={operateur.nom_pere_arabe ?? ""}
                onChange={(e) => handleChange("nom_pere_arabe", e.target.value)}
              />
            </div>
          </div>

          {/* Row 12 - بلدية الميلاد و الأم */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                بلدية الميلاد بالفرنسية <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={operateur.communes_naissance_francais ?? ""}
                onChange={(e) =>
                  handleChange("communes_naissance_francais", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                بلدية الميلاد بالعربية <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={operateur.communes_naissance_arabe ?? ""}
                onChange={(e) =>
                  handleChange("communes_naissance_arabe", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                اسم و لقب الام بالفرنسية <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
  <Input
    type="text"
    required
    placeholder="Nom de famille mère"
    value={mereLastNameFr}
    onChange={(e) => setMereLastNameFr(e.target.value)}
  />

  <Input
    type="text"
    required
    placeholder="Prénom mère"
    value={mereFirstNameFr}
    onChange={(e) => setMereFirstNameFr(e.target.value)}
  />
</div>
            </div>
          </div>

          {/* Row 13 - العنوان */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                بلدية العنوان بالعربية <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={operateur.address_municipalité_arabe ?? ""}
                onChange={(e) =>
                  handleChange("address_municipalité_arabe", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                العنوان بالفرنسية <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={operateur.address_francais ?? ""}
                onChange={(e) =>
                  handleChange("address_francais", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                العنوان بالعربية <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={operateur.address_arabe ?? ""}
                onChange={(e) => handleChange("address_arabe", e.target.value)}
              />
            </div>
          </div>

          {/* Row 14 - السجل التجاري */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                رقم التسجيل التجاري 5 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={operateur.num_registre_commerce_n5 ?? ""}
                onChange={(e) =>
                  handleChange("num_registre_commerce_n5", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                رقم التسجيل التجاري <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={operateur.num_registre_commerce ?? ""}
                onChange={(e) =>
                  handleChange("num_registre_commerce", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                بلدية العنوان بالفرنسية <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={operateur.address_municipalité_francais ?? ""}
                onChange={(e) =>
                  handleChange("address_municipalité_francais", e.target.value)
                }
              />
            </div>
          </div>

          {/* Row 15 - تواريخ النشاط */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                تاريخ بداية النشاط <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                required
                value={operateur.date_debut_activite ?? ""}
                onChange={(e) =>
                  handleChange("date_debut_activite", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                تاريخ تعديل السجل التجاري <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                required
                value={operateur.modifier_hestoire_registre_commerce ?? ""}
                onChange={(e) =>
                  handleChange(
                    "modifier_hestoire_registre_commerce",
                    e.target.value
                  )
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                تاريخ السجل التجاري <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                required
                value={operateur.hestoire_registre_commerce ?? ""}
                onChange={(e) =>
                  handleChange("hestoire_registre_commerce", e.target.value)
                }
              />
            </div>
          </div>

          {/* Row 15 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* متوقف عن النشاط او لا */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                متوقف عن النشاط او لا
              </label>
              <Select
                value={operateur.depend_activite ?? ""}
                onValueChange={(val) => handleChange("depend_activite", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="متوقف">متوقف</SelectItem>
                  <SelectItem value="لا">لا</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* رقم الانتساب للصندوق الوطني للعمال غير الاجراء */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                رقم الانتساب للصندوق الوطني للعمال غير الاجراء
              </label>
              <Input
                type="text"
                value={operateur.num_adherent_caise_national_non_salaire ?? ""}
                onChange={(e) =>
                  handleChange(
                    "num_adherent_caise_national_non_salaire",
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          {/* Row 16 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                تاريخ التوقف على النشاط في حالة المتعامل متوقف نهائيا
              </label>
              <Input
                type="date"
                disabled={depnd === "لا"}
                value={operateur.date_arret_activite_permanent ?? ""}
                onChange={(e) =>
                  handleChange("date_arret_activite_permanent", e.target.value)
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                تاريخ التوقف على النشاط في حالة المتعامل متوقف مؤقتا
              </label>
              <Input
                type="date"
                disabled={depnd === "لا"}
                value={operateur.date_arret_activite_temporaire ?? ""}
                onChange={(e) =>
                  handleChange("date_arret_activite_temporaire", e.target.value)
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                نوع التوقف
              </label>
              <Select
                value={operateur.type_depend ?? ""}
                onValueChange={(val) => handleChange("type_depend", val)}
                disabled={depnd === "لا"}
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
          </div>

          {/* Row 17 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                المعني بالتحيين
              </label>
              <Input
                type="text"
                value={operateur.soccupe ?? ""}
                onChange={(e) => handleChange("soccupe", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                رقم هاتف المتعامل
              </label>
              <Input
                type="text"
                value={operateur.num_telephone_client ?? ""}
                onChange={(e) =>
                  handleChange("num_telephone_client", e.target.value)
                }
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-end text-gray-700">
              ملاحظات رئيس القسم
            </label>
            <Textarea
              placeholder="أدخل أي ملاحظات"
              value={operateur.note_chef_departement ?? ""}
              onChange={(e) =>
                handleChange("note_chef_departement", e.target.value)
              }
            />
          </div>

          {/* Submit */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader /> : "إرسال البيانات"}
          </Button>
        </form>
      </div>
    </MainContainer>
  );
};

export default FormOperateur;
