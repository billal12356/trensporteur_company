import MainContainer from "@/components/MainContainer";
import React, { useId } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // If Select exists
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { Operateur, Vihicles } from "@/components/types/OperateurTypes";
import { Loader } from "lucide-react";
import { createVihicules } from "@/redux/slice/vihiculeSlice";
import { Separator } from "@/components/ui/separator";
import { useParams } from "react-router-dom";


const FormUpdateVihicule: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.vihicule);
  const { register, handleSubmit, setValue, watch } = useForm<Vihicles>();
  const onSubmit: SubmitHandler<Vihicles> = async (data) => {
    await dispatch(createVihicules(data)).unwrap();
  }

  const id = useParams<{ id: string }>()

  console.log(id);
  
  const depnd = watch("vihicile_parked");


  return (
    <MainContainer>
      <div className="w-full max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          📝 تسجيل المركبة
        </h2>
        <form className="space-y-10">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="block text-sm text-end font-medium text-gray-700">رقم ملف المتعامل في سجل الناقلين</label>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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


          {/* Row 4 */}
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

          {/* Row 5 */}
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


          {/* Row 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">الدائرة</label>
              <Input type="text" {...register("circle")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">رقم تسجيل الحافلة او الشاحنة</label>
              <Input type="number"
                {...register("num_bus_registration", {
                  setValueAs: (v) => v === "" ? undefined : Number(v)
                })}
              />
            </div>
          </div>


          {/* Row 7 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">الصنف</label>
              <Input type="text"
                {...register("category", {
                  setValueAs: (v) => v === "" ? undefined : String(v)
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">الطراز</label>
              <Input type="text"
                {...register("Style", {
                  setValueAs: (v) => v === "" ? undefined : String(v)
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">البلدية</label>
              <Input type="text"
                {...register("Municipality", {
                  setValueAs: (v) => v === "" ? undefined : String(v)
                })}
              />
            </div>
          </div>

          {/* Row 8 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">اول سنة استعمال</label>
              <Input type="text" {...register("First_year_of_use")} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">النوع</label>
              <Select onValueChange={(value) => setValue("type", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="حافلة">حافلة</SelectItem>
                  <SelectItem value="حافلة صغيرة">حافلة صغيرة</SelectItem>
                  <SelectItem value="MINI CAR">MINI CAR</SelectItem>
                  <SelectItem value="سيارة مجهزة">سيارة مجهزة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


          {/* Row 9 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">عدد المقاعد</label>
              <Input type="number"
                {...register("Number_of_seats", {
                  setValueAs: (v) => v === "" ? undefined : Number(v)
                })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">الطاقة</label>
              <Select onValueChange={(value) => setValue("Energy", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="مازوت">مازوت</SelectItem>
                  <SelectItem value="بنزين">بنزين</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


          {/* Row 10 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">تاريخ رخصة السير</label>
              <Input type="date" {...register("driving_license_history")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">رقم رخصة سير المركبة</label>
              <Input type="number"
                {...register("num_driving_license", {
                  setValueAs: (v) => v === "" ? undefined : Number(v)
                })}
              />
            </div>
          </div>

          {/* Row 11 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">تاريخ بداية نشاط الخط</label>
              <Input type="date" {...register("line_activity_start_date")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">مدة صلاحية الرخصة</label>
              <Input type="text" {...register("driving_license_dure")} />
            </div>
          </div>

          {/* Row 12 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">نوع الخط</label>
              <Select onValueChange={(value) => setValue("font_type", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="بين البلديات">بين البلديات</SelectItem>
                  <SelectItem value="بين الولايات">بين الولايات</SelectItem>
                  <SelectItem value="حضري او شبه حضري">حضري او شبه حضري</SelectItem>
                  <SelectItem value="ريفي">ريفي</SelectItem>
                  <Separator />
                  <SelectItem value="مركبة احتياطية">مركبة احتياطية</SelectItem>
                  <SelectItem value="نقل العمال">نقل العمال</SelectItem>
                  <SelectItem value="نقل مدرسي">نقل مدرسي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">تاريخ بداية نشاط المركبة</label>
              <Input type="date" {...register("Vehicle_activity_start_date")} />
            </div>
          </div>

          {/* Row 13 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">رمز الخط</label>
              <Input type="text" {...register("font_symbol")} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">colonne 4</label>
              <Select onValueChange={(value) => setValue("colonne4", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inter - communale">inter - communale</SelectItem>
                  <SelectItem value="inter-willaya">inter-willaya</SelectItem>
                  <SelectItem value="Transport personnel">Transport personnel</SelectItem>
                  <SelectItem value="Transport scolaire">Transport scolaire</SelectItem>
                  <SelectItem value="urbain ou sub-urbain">urbain ou sub-urbain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 14 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">نقطة الوصول</label>
              <Input type="text" {...register("point_arrive")} />
            </div>
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">نقطة الانطلاق</label>
              <Input type="text" {...register("point_depart")} />
            </div>
          </div>

          {/* Row 14 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">نقطة المرور 3</label>
              <Input type="text" {...register("point_Traffic3")} />
            </div>
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">نقطة المرور 2</label>
              <Input type="text" {...register("point_Traffic2")} />
            </div>
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">نقطة المرور 1</label>
              <Input type="text" {...register("point_Traffic1")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">نقطة المرور 5</label>
              <Input type="text" {...register("point_Traffic4")} />
            </div>
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">نقطة المرور 4</label>
              <Input type="text" {...register("point_Traffic5")} />
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">توقيت نهاية الخط</label>
              <Input type="text" {...register("line_end_time")} />
            </div>
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">توقيت بداية الخط</label>
              <Input type="text" {...register("line_start_time")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">توقيت الانطلاق 1</label>
              <Input type="text" {...register("time_depart1")} />
            </div>
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">الوتيرة بالدقائق بالنسبة للحضري</label>
              <Input type="text" {...register("Pace_per_minute")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">توقيت الانطلاق 4</label>
              <Input type="text" {...register("time_depart4")} />
            </div>
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">توقيت الانطلاق 3</label>
              <Input type="text" {...register("time_depart3")} />
            </div>
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">توقيت الانطلاق 2</label>
              <Input type="text" {...register("time_depart2")} />
            </div>
          </div>
          {/* Row 15 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">المركبة موقفة او لا</label>
              <Select onValueChange={(value) => setValue("vihicile_parked", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="متوقفة">متوقفة</SelectItem>
                  <SelectItem value="لا">لا</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-end text-gray-700">نوع التوقيف</label>
              <Select
                onValueChange={(value) => setValue("type_parked", value)}
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


          {/* Row 16 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">تاريخ نهاية توقيف مؤقت</label>
              <Input type="date" disabled={depnd === "لا"} {...register("hestoire_parked_end")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-end text-gray-700">تاريخ التوقيف</label>
              <Input type="date" disabled={depnd === "لا"} {...register("hestoire_parked")} />
            </div>
            
          </div>


          {/* Row 17 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">المسار</label>
              <Input type="text" {...register("path")} />
            </div>
            
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-end text-gray-700">المعني بالتعيين</label>
              <Input type="text" {...register("person_concerned")} />
            </div>
            
          </div>


          <div>
            <label className="block text-sm font-medium text-end text-gray-700">ملاحظات</label>
            <Textarea {...register("comments")} placeholder="أدخل أي ملاحظات" />
          </div>

          <div>
            <label className="block text-sm font-medium text-end text-gray-700">ملاحظات رئيس القسم</label>
            <Textarea {...register("note_chef_departement")} placeholder="أدخل أي ملاحظات" />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading} onClick={handleSubmit(onSubmit)} className="w-full">
            {
              loading ? <Loader /> : "إرسال البيانات"
            }
          </Button>
        </form>
      </div>
    </MainContainer>
  );
};

export default FormUpdateVihicule;
