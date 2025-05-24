import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { Chauffeur } from "@/components/types/OperateurTypes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";

import { FindOneChauffeur, updateChauffeurs } from "@/redux/slice/chauffeurSlice";
import MainContainer from "@/components/MainContainer";

const EditChauffeur = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate()
    const { chauffeur, loading, messageUpdate } = useSelector((state: RootState) => state.chauffeur);

    const { register, handleSubmit, reset, setValue, watch } = useForm<Chauffeur>();

    useEffect(() => {
        if (id) {
            dispatch(FindOneChauffeur(id));
        }
        if (messageUpdate) {
            navigate('/chauffeur')
        }
    }, [dispatch, id, messageUpdate]);

    useEffect(() => {
        if (chauffeur) {
            reset(chauffeur);
        }
    }, [chauffeur, reset]);

    const onSubmit = (data: Chauffeur) => {
        if (!id) return;
        dispatch(updateChauffeurs({ id, data }));
    };

    const depnd = watch("vihicile_parked");
    return (
        <MainContainer>
            <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded mt-10">
                <h2 className="text-2xl font-bold mb-6 text-center">✏️ تعديل بيانات المركبة</h2>
                <form className="space-y-10">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="block text-sm text-end font-medium text-gray-700">رقم المستخدم</label>
                            <Input type="number"
                                {...register("num_chauffeur", {
                                    setValueAs: (v) => v === "" ? undefined : Number(v)
                                })}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="block text-sm text-end font-medium text-gray-700">رقم الطلب</label>
                            <Input type="number"
                                {...register("num_demende", {
                                    setValueAs: (v) => v === "" ? undefined : Number(v)
                                })}
                            />
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="block text-sm text-end font-medium text-gray-700">رقم القيد للناقل</label>
                            <Input type="number"
                                {...register("num_enregistrement_du_transporteur", {
                                    setValueAs: (v) => v === "" ? undefined : Number(v)
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-end text-gray-700">تاريخ الطلب</label>
                            <Input type="date"
                                {...register("hestoire_demende", {
                                    setValueAs: (v) => v === "" ? undefined : v,
                                })}
                            />
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-end text-gray-700">المتعامل</label>
                            <Input type="text"
                                {...register("operateur", {
                                    setValueAs: (v) => v === "" ? undefined : String(v)
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-end text-gray-700">الخط المستغل</label>
                            <Input type="text"
                                {...register("ligne_exploitée", {
                                    setValueAs: (v) => v === "" ? undefined : String(v)
                                })}
                            />
                        </div>
                    </div>

                    {/* Row 4 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="block text-sm font-medium text-end text-gray-700">طبيعى الخط</label>
                            <Select onValueChange={(value) => setValue("nature_ligne", value)}>
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
                            <label className="block text-sm font-medium text-end text-gray-700">ترقيم المركبة</label>
                            <Input type="number"
                                {...register("num_vehicule", {
                                    setValueAs: (v) => v === "" ? undefined : Number(v)
                                })}
                            />
                        </div>


                    </div>


                    {/* Row 5 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="block text-sm text-end font-medium text-gray-700">رقم التعريف الوطني NIN</label>
                            <Input type="number"
                                {...register("num_didentification_national_NIN", {
                                    setValueAs: (v) => v === "" ? undefined : Number(v)
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-end text-gray-700">طبيعة المستخدم</label>
                            <Input type="text"
                                {...register("nature_utilisateur", {
                                    setValueAs: (v) => v === "" ? undefined : String(v)
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-end text-gray-700">اسم و لقب السائق</label>
                            <Input type="text"
                                {...register("nom_prenom_chauffeur", {
                                    setValueAs: (v) => v === "" ? undefined : String(v)
                                })}
                            />
                        </div>
                    </div>

                    {/* Row 6 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-end text-gray-700">تاريخ الاصدار</label>
                            <Input type="date"
                                {...register("date_sortie", {
                                    setValueAs: (v) => v === "" ? undefined : v,
                                })}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="block text-sm text-end font-medium text-gray-700">رقم رخصة السياقة </label>
                            <Input type="number"
                                {...register("num_permis_conduire", {
                                    setValueAs: (v) => v === "" ? undefined : Number(v)
                                })}
                            />
                        </div>
                    </div>


                    {/* Row 7 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-end text-gray-700">نهاية صلاحية الصنف</label>
                            <Input type="date"
                                {...register("date_expiration_article", {
                                    setValueAs: (v) => v === "" ? undefined : v,
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-end text-gray-700">بلدية الاصدار</label>
                            <Input type="text"
                                {...register("municipalite_emettrice", {
                                    setValueAs: (v) => v === "" ? undefined : String(v)
                                })}
                            />
                        </div>
                    </div>


                    {/* Row 9 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-end text-gray-700">العنوان</label>
                            <Input type="text" {...register("address")} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-end text-gray-700">مكان الميلاد </label>
                            <Input type="text" {...register("lieu_naissance")} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-end text-gray-700">تاريخ الميلاد</label>
                            <Input type="date" {...register("date_naissance")} />
                        </div>
                    </div>


                    {/* Row 9 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-end text-gray-700">تاريخ الحصول على شهادة الكفائة </label>
                            <Input type="date" {...register("date_obtention_certificat_aptitude_professionnelle")} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-end text-gray-700">رقم شهادة الكفائة المهنية</label>
                            <Input type="number"
                                {...register("Num_certificat_compétence_professionnelle", {
                                    setValueAs: (v) => v === "" ? undefined : Number(v)
                                })}
                            />
                        </div>
                    </div>


                    {/* Row 10 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-end text-gray-700">رقم الانتساب الى الصندوق الوطني</label>
                            <Input type="number"
                                {...register("num_membre_fonds_national", {
                                    setValueAs: (v) => v === "" ? undefined : Number(v)
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-end text-gray-700">رقم التسلسلي</label>
                            <Input type="number"
                                {...register("num_serie", {
                                    setValueAs: (v) => v === "" ? undefined : Number(v)
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-end text-gray-700">الولاية</label>
                            <Input type="text" {...register("wilaya")} />
                        </div>
                    </div>


                    {/* Row 15 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="block text-sm font-medium text-end text-gray-700">نوع التوقف</label>
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
                        <div className="flex flex-col gap-1">
                            <label className="block text-sm font-medium text-end text-gray-700"> المركبة موقفة او لا</label>
                            <Select
                                onValueChange={(value) => setValue("vihicile_parked", value)}
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
                        <label className="block text-sm font-medium text-end text-gray-700">ملاحظة</label>
                        <Textarea {...register("comments")} placeholder="أدخل أي ملاحظات" />
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" disabled={loading} onClick={handleSubmit(onSubmit)} className="w-full cursor-pointer">
                        {
                            loading ? <Loader /> : "إرسال البيانات"
                        }
                    </Button>
                </form>
            </div>
        </MainContainer>
    );
};

export default EditChauffeur;
