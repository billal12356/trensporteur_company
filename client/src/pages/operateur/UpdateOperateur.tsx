import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import {
  FindOneOperateur,
  updateOperateur,
  clearMessageUpdate,
} from "@/redux/slice/operateurSlice";
import { Operateur } from "@/components/types/OperateurTypes";
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
import { Loader } from "lucide-react";
import MainContainer from "@/components/MainContainer";
import { Helmet } from "react-helmet-async";
import { isEqual } from "lodash";
import { toast } from "sonner";
const EditOperateur = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { operateur, loading, messageUpdate } = useSelector(
    (state: RootState) => state.operateur
  );

  useEffect(() => {
    // Scroll to the top of the page when the component is mounted
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState<Operateur>({} as Operateur);
  const [hasChanges, setHasChanges] = useState(false);
  const [ninError, setNinError] = useState("");
  const [ninStatus, setNinStatus] = useState<"warning" | "error" | "success" | "">("");
  const [ninTouched, setNinTouched] = useState(false);

  // ✅ Fetch operator by ID
  useEffect(() => {
    if (id) {
      // Clear the previous success message when switching to a new operateur
      dispatch(clearMessageUpdate());
      dispatch(FindOneOperateur(id));
      // Reset form and message when loading a new operateur
      setFormData({} as Operateur);
      setHasChanges(false);
    }
  }, [dispatch, id]);



  // ✅ Redirect after update (only when messageUpdate changes from empty to filled)
  useEffect(() => {
    if (messageUpdate && id) {
      // Show toast and redirect after a short delay to let user see the success message
      const timer = setTimeout(() => {
        navigate("/operateur");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [messageUpdate, id, navigate]);

  useEffect(() => {
    if (operateur) {
      setFormData(operateur);
      // ✅ Don't validate NIN on load — reset everything
      setNinError("");
      setNinStatus("");
      setNinTouched(false); // reset touched state when switching operateur
    }
  }, [operateur]);

  // ✅ Detect if formData changed from original
  useEffect(() => {
    if (!operateur) return;
    setHasChanges(!isEqual(formData, operateur));
  }, [formData, operateur]);

  // ✅ Handle text/number/textarea inputs
  const handleChange = (
    name: keyof Operateur,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : value,
    }));
  };

  const handleNinChange = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, "");
    setNinTouched(true); // ✅ Mark as touched on first user interaction

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

  // ✅ Submit Function
  const handleSubmitForm = () => {
    if (!id) return;

    // If NIN was touched, validate it before sending
    if (ninTouched) {
      const nin = String(formData.num_didentification_national_NIN || "");
      if (nin && nin.length !== 18) {
        toast.error("رقم التعريف الوطني يجب أن يتكون من 18 رقماً بالضبط!");
        return;
      }
    }

    // Build payload: omit NIN if not touched to avoid backend @IsString validation
    const dataToSend: Partial<Operateur> = { ...formData };
    if (!ninTouched) {
      delete dataToSend.num_didentification_national_NIN;
    } else {
      // Ensure NIN is sent as string for backend validation
      dataToSend.num_didentification_national_NIN = String(dataToSend.num_didentification_national_NIN || "") as any;
    }

    dispatch(updateOperateur({ id, data: dataToSend }));
  };

  const depnd = formData.depend_activite;

  return (
    <MainContainer>
      <Helmet>
        <title>تعديل المتعامل</title>
        <meta name="description" content="مرحبا بك في Finissio" />
        <link
          rel="icon"
          type="image/png"
          href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s"
        />
      </Helmet>

      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded mt-10">
        <h2 className="text-2xl font-bold mb-6 text-center">
          ✏️ تعديل بيانات المتعامل
        </h2>

        <form
          className="space-y-10"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitForm();
          }}
        >
          {/* Example of controlled Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-end font-medium text-gray-700">
                رقم ملف المتعامل
              </label>
              <Input
                type="number"
                defaultValue={operateur.num_docier_client ?? ""}
                onChange={(e) =>
                  handleChange("num_docier_client", Number(e.target.value))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-end font-medium text-gray-700">
                رقم الولاية
              </label>
              <Input
                type="number"
                defaultValue={operateur.num_wilaya ?? ""}
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
                تاريخ انتهاء الصلاحية
              </label>
              <Input
                type="date"
                defaultValue={operateur.date_expiration ?? ""}
                onChange={(e) =>
                  handleChange("date_expiration", e.target.value)
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-end text-gray-700">
                الاسم و لقب المتعامل بالعربية
              </label>
              <Input
                type="text"
                defaultValue={operateur.fullName_arabe ?? ""}
                onChange={(e) => handleChange("fullName_arabe", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-end text-gray-700">
                الاسم و لقب المتعامل بالفرنسية
              </label>
              <Input
                type="text"
                defaultValue={operateur.fullName_francais ?? ""}
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
                النشاط
              </label>
              <Select
                defaultValue={operateur.activite ?? ""}
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
                حالة النشاط
              </label>
              <Select
                defaultValue={operateur.status_activite ?? ""}
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
                رقم بطاقة القيد
              </label>
              <Input
                type="number"
                defaultValue={operateur.num_cate_enregistement ?? ""}
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
                رقم مقررة
              </label>
              <Input
                type="number"
                defaultValue={operateur.num_dhoraire ?? ""}
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
                تاريخ المقررة
              </label>
              <Input
                type="date"
                defaultValue={operateur.date_prévue ?? ""}
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
                defaultValue={operateur.colonne1 ?? ""}
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
                النشاط
              </label>
              <Select
                defaultValue={operateur.activite ?? ""}
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
                defaultValue={operateur.colonne2 ?? ""}
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
                طبيعة النشاط
              </label>
              <Select
                defaultValue={operateur.nature_activite ?? ""}
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
                defaultValue={operateur.colonne3 ?? ""}
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
                حالة النشاط
              </label>
              <Select
                defaultValue={operateur.status_activite ?? ""}
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
                defaultValue={operateur.colonne4 ?? ""}
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
                نوع المتعامل
              </label>
              <Select
                defaultValue={operateur.type_client ?? ""}
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
                defaultValue={operateur.institution_person_moral ?? ""}
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
                defaultValue={operateur.fullName_gerent_person_moral ?? ""}
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
                رقم شهادة الميلاد
              </label>
              <Input
                type="number"
                defaultValue={operateur.num_dacte_naissance ?? ""}
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
                value={formData.num_didentification_national_NIN ?? ""}
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

          {/* Row 9b - NIF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                رقم التعريف الجبائي NIF
              </label>
              <Input
                type="text"
                defaultValue={operateur.Tax_identification_number_NIF ?? ""}
                onChange={(e) =>
                  handleChange(
                    "Tax_identification_number_NIF",
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {/* Row 10 - معلومات الميلاد */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                مكان الميلاد بالفرنسية
              </label>
              <Input
                type="text"
                defaultValue={operateur.lieu_naissance_francais ?? ""}
                onChange={(e) =>
                  handleChange("lieu_naissance_francais", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                مكان الميلاد بالعربية
              </label>
              <Input
                type="text"
                defaultValue={operateur.lieu_naissance_arabe ?? ""}
                onChange={(e) =>
                  handleChange("lieu_naissance_arabe", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                تاريخ الميلاد
              </label>
              <Input
                type="date"
                defaultValue={operateur.date_naissance ?? ""}
                onChange={(e) => handleChange("date_naissance", e.target.value)}
              />
            </div>
          </div>

          {/* Row 11 - بيانات الوالدين */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                اسم و لقب الام بالعربية
              </label>
              <Input
                type="text"
                defaultValue={operateur.fullName_mere_arabe ?? ""}
                onChange={(e) =>
                  handleChange("fullName_mere_arabe", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                اسم الاب بالفرنسية
              </label>
              <Input
                type="text"
                defaultValue={operateur.nom_pere_francais ?? ""}
                onChange={(e) =>
                  handleChange("nom_pere_francais", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                اسم الاب بالعربي
              </label>
              <Input
                type="text"
                defaultValue={operateur.nom_pere_arabe ?? ""}
                onChange={(e) => handleChange("nom_pere_arabe", e.target.value)}
              />
            </div>
          </div>

          {/* Row 12 - بلدية الميلاد و الأم */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                بلدية الميلاد بالفرنسية
              </label>
              <Input
                type="text"
                defaultValue={operateur.communes_naissance_francais ?? ""}
                onChange={(e) =>
                  handleChange("communes_naissance_francais", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                بلدية الميلاد بالعربية
              </label>
              <Input
                type="text"
                defaultValue={operateur.communes_naissance_arabe ?? ""}
                onChange={(e) =>
                  handleChange("communes_naissance_arabe", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                اسم و لقب الام بالفرنسية
              </label>
              <Input
                type="text"
                defaultValue={operateur.fullName_mere_francais ?? ""}
                onChange={(e) =>
                  handleChange("fullName_mere_francais", e.target.value)
                }
              />
            </div>
          </div>

          {/* Row 13 - العنوان */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                بلدية العنوان بالعربية
              </label>
              <Input
                type="text"
                defaultValue={operateur.address_municipalité_arabe ?? ""}
                onChange={(e) =>
                  handleChange("address_municipalité_arabe", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                العنوان بالفرنسية
              </label>
              <Input
                type="text"
                defaultValue={operateur.address_francais ?? ""}
                onChange={(e) =>
                  handleChange("address_francais", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                العنوان بالعربية
              </label>
              <Input
                type="text"
                defaultValue={operateur.address_arabe ?? ""}
                onChange={(e) => handleChange("address_arabe", e.target.value)}
              />
            </div>
          </div>

          {/* Row 14 - السجل التجاري */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                رقم التسجيل التجاري 5
              </label>
              <Input
                type="text"
                defaultValue={operateur.num_registre_commerce_n5 ?? ""}
                onChange={(e) =>
                  handleChange("num_registre_commerce_n5", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                رقم التسجيل التجاري
              </label>
              <Input
                type="text"
                defaultValue={operateur.num_registre_commerce ?? ""}
                onChange={(e) =>
                  handleChange("num_registre_commerce", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                بلدية العنوان بالفرنسية
              </label>
              <Input
                type="text"
                defaultValue={operateur.address_municipalité_francais ?? ""}
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
                تاريخ بداية النشاط
              </label>
              <Input
                type="date"
                defaultValue={operateur.date_debut_activite ?? ""}
                onChange={(e) =>
                  handleChange("date_debut_activite", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">
                تاريخ تعديل السجل التجاري
              </label>
              <Input
                type="date"
                defaultValue={operateur.modifier_hestoire_registre_commerce ?? ""}
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
                تاريخ السجل التجاري
              </label>
              <Input
                type="date"
                defaultValue={operateur.hestoire_registre_commerce ?? ""}
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
                defaultValue={operateur.depend_activite ?? ""}
                onValueChange={(val) => handleChange("depend_activite", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نعم">متوقف</SelectItem>
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
                defaultValue={operateur.num_adherent_caise_national_non_salaire ?? ""}
                onChange={(e) =>
                  handleChange(
                    "num_adherent_caise_national_non_salaire",
                    e.target.value
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
                defaultValue={operateur.date_arret_activite_permanent ?? ""}
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
                defaultValue={operateur.date_arret_activite_temporaire ?? ""}
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
                defaultValue={operateur.type_depend ?? ""}
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
                defaultValue={operateur.soccupe ?? ""}
                onChange={(e) => handleChange("soccupe", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">
                رقم هاتف المتعامل
              </label>
              <Input
                type="text"
                defaultValue={operateur.num_telephone_client ?? ""}
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
              defaultValue={operateur.note_chef_departement ?? ""}
              onChange={(e) =>
                handleChange("note_chef_departement", e.target.value)
              }
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !hasChanges} // disable if no changes
            className={`w-full ${!hasChanges ? "opacity-50 cursor-not-allowed" : ""
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

export default EditOperateur;
