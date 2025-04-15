import MainContainer from "@/components/MainContainer";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // If Select exists
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { createOperateur } from "@/redux/slice/operateurSlice";
import { Operateur } from "@/components/types/OperateurTypes";
import { Loader } from "lucide-react";


const FormOperateur: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.operateur);
  const { register, handleSubmit, setValue, watch } = useForm<Operateur>();
  const onSubmit: SubmitHandler<Operateur> = async (data) => {
    await dispatch(createOperateur(data)).unwrap();
  }


  const depnd = watch("depend_activite");


  return (
    <MainContainer>
      <div className="w-full max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          📝 تسجيل المتعامل
        </h2>
        <form className="space-y-10">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="block text-sm text-end font-medium text-gray-700">رقم ملف المتعامل</label>
              <Input type="number"
                {...register("num_docier_client", {
                  setValueAs: (v) => v === "" ? undefined : Number(v)
                })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-sm text-end font-medium text-gray-700">رقم الولاية</label>
              <Input type="number"
                {...register("num_wilaya", {
                  setValueAs: (v) => v === "" ? undefined : Number(v)
                })}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">تاريخ انتهاء الصلاحية</label>
              <Input type="date"
                {...register("date_expiration", {
                  setValueAs: (v) => v === "" ? undefined : v,
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">الاسم و لقب المتعامل بالعربية</label>
              <Input type="text" {...register("fullName_arabe")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">الاسم و لقب المتعامل بالفرنسية</label>
              <Input type="text" {...register("fullName_francais")} />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">رقم بطاقة القيد</label>
              <Input type="number"
                {...register("num_cate_enregistement", {
                  setValueAs: (v) => v === "" ? undefined : Number(v)
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">رقم مقررة</label>
              <Input type="number"
                {...register("num_dhoraire", {
                  setValueAs: (v) => v === "" ? undefined : Number(v)
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">تاريخ المقررة</label>
              <Input type="date" {...register("date_prévue")} />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* colonne 1 Field */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">Colonne 1</label>
              <Select onValueChange={(value) => setValue("colonne1", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transport_passagers">transport voyageurs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">النشاط</label>
              <Select onValueChange={(value) => setValue("activite", value)}>
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
            {/* colonne 1 Field */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">Colonne 2</label>
              <Select onValueChange={(value) => setValue("colonne2", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TPCV">TPCV</SelectItem>
                  <SelectItem value="TPV">TPV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">طبيعة النشاط</label>
              <Select onValueChange={(value) => setValue("nature_activite", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="عمومي للمسافرين">عمومي للمسافرين</SelectItem>
                  <SelectItem value="خاص للمسافرين">خاص للمسافرين</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* colonne 1 Field */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">Colonne 3</label>
              <Select onValueChange={(value) => setValue("colonne3", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Privé">Privé</SelectItem>
                  <SelectItem value="Publique">Publique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">حالة النشاط</label>
              <Select onValueChange={(value) => setValue("status_activite", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="عمومي">عمومي </SelectItem>
                  <SelectItem value="خاص">خاص </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


          {/* Row 7 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* colonne 1 Field */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">Colonne 4</label>
              <Select onValueChange={(value) => setValue("colonne4", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Person physique">Person physique</SelectItem>
                  <SelectItem value="Person moral">Person moral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">نوع المتعامل</label>
              <Select onValueChange={(value) => setValue("type_client", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="شخص طبيعي">شخص طبيعي</SelectItem>
                  <SelectItem value="شخص معنوي<">شخص معنوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


          {/* Row 8 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* colonne 1 Field */}
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">شكل الشركة او المؤسسة في حالة شخص معنوي</label>
              <Select onValueChange={(value) => setValue("institution_person_moral", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SARL - ش ذ م م">SARL - ش ذ م م</SelectItem>
                  <SelectItem value="EURL - ش ذ ش و">EURL - ش ذ ش و</SelectItem>
                  <SelectItem value="SNC - شركة تضامن">SNC - شركة تضامن</SelectItem>
                  <SelectItem value="SPA - ش ذ ا">SPA - ش ذ ا</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">الاسم و لقب المسير في السجل التجاري في حالة شخص معنوي</label>
              <Input type="text"
                {...register("fullName_gerent_person_moral", {
                  setValueAs: (v) => v === "" ? undefined : String(v)
                })}
              />
            </div>
          </div>

          {/* Row 8 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* colonne 1 Field */}
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">رقم شهادة الميلاد</label>
              <Input type="number"
                {...register("num_dacte_naissance", {
                  setValueAs: (v) => v === "" ? undefined : Number(v)
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-end text-gray-700">رقم التعريف الوطني NIN</label>
              <Input type="number"
                {...register("num_didentification_national_NIN", {
                  setValueAs: (v) => v === "" ? undefined : Number(v)
                })}
              />
            </div>
          </div>


          {/* Row 9 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">مكان الميلاد بالفرنسية</label>
              <Input type="text" {...register("lieu_naissance_francais")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">مكان الميلاد بالعربي</label>
              <Input type="text" {...register("lieu_naissance_arabe")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">تاريخ الميلاد</label>
              <Input type="date" {...register("date_naissance")} />
            </div>
          </div>


          {/* Row 10 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">اسم و لقب الام بالعربية</label>
              <Input type="text" {...register("fullName_mere_arabe")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">اسم الاب بالفرنسية</label>
              <Input type="text" {...register("nom_pere_francais")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">اسم الاب بالعربي</label>
              <Input type="text" {...register("nom_pere_arabe")} />
            </div>
          </div>

          {/* Row 11 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">بلدية الميلاد بالفرنسية</label>
              <Input type="text" {...register("communes_naissance_francais")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">بلدية الميلاد بالعربية</label>
              <Input type="text" {...register("communes_naissance_arabe")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">اسم و لقب الام بالفرنسية</label>
              <Input type="text" {...register("fullName_mere_francais")} />
            </div>
          </div>

          {/* Row 12 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">بلدية العنوان بالعربية</label>
              <Input type="text" {...register("address_municipalité_arabe")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">العنوان بالفرنسية</label>
              <Input type="text" {...register("address_francais")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">العنوان بالعربية</label>
              <Input type="text" {...register("address_arabe")} />
            </div>
          </div>

          {/* Row 13 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">رقم التسجيل التجاري 5</label>
              <Input type="number"
                {...register("num_registre_commerce_n5", {
                  setValueAs: (v) => v === "" ? undefined : Number(v)
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">رقم التسجيل التجاري</label>
              <Input type="number"
                {...register("num_registre_commerce", {
                  setValueAs: (v) => v === "" ? undefined : Number(v)
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">بلدية العنوان بالفرنسية</label>
              <Input type="text" {...register("address_municipalité_francais")} />
            </div>
          </div>

          {/* Row 14 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">تاريخ بداية النشاط 5</label>
              <Input type="date" {...register("date_debut_activite")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">تاريخ تعديل السجل التجاري</label>
              <Input type="date" {...register("modifier_hestoire_registre_commerce")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">تاريخ السجل التجاري</label>
              <Input type="date" {...register("hestoire_registre_commerce")} />
            </div>
          </div>


          {/* Row 15 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">متوقف عن النشاط او لا</label>
              <Select onValueChange={(value) => setValue("depend_activite", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="متوقف">متوقف</SelectItem>
                  <SelectItem value="لا">لا</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">رقم الانتساب للصندوق الوطني للعمال غير الاجراء</label>
              <Input type="number" 
                {...register("num_adherent_caise_national_non_salaire", {
                  setValueAs: (v) => v === "" ? undefined : Number(v)
                })}
              />
            </div>
          </div>


          {/* Row 16 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-end text-gray-700">تاريخ التوقف على النشاط في حالة المتعامل متوقف نهائيا</label>
              <Input type="date" disabled={depnd === "لا"} {...register("date_arret_activite_permanent")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">تاريخ التوقف على النشاط في حالة المتعامل متوقف مؤقتا</label>
              <Input type="date" disabled={depnd === "لا"} {...register("date_arret_activite_temporaire")} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">نوع التوقف</label>
              <Select
                onValueChange={(value) => setValue("type_depend", value)}
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
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-end text-gray-700">المعني بالتعيين</label>
              <Input type="text" {...register("soccupe")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">رقم هاتف المتعامل</label>
              <Input type="text"
                {...register("num_telephone_client", {
                  setValueAs: (v) => v === "" ? undefined : String(v)
                })}
              />
            </div>
          </div>


          <div>
            <label className="block text-sm font-medium text-end text-gray-700">ملاحظات رئيس القسم</label>
            <Textarea {...register("note_chef_departement")} placeholder="أدخل أي ملاحظات" />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading} onClick={handleSubmit(onSubmit)} className="w-full">
            {
              loading ? <Loader/> : "إرسال البيانات"
            }
          </Button>
        </form>
      </div>
    </MainContainer>
  );
};

export default FormOperateur;
