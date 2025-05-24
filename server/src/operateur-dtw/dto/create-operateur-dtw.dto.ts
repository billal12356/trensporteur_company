import { Transform, Type } from 'class-transformer';
import { IsString, IsNumber, IsDate, IsOptional, IsEnum, IsDateString, IsIn } from 'class-validator';
export enum TypeDepend {
    TEMPORAIRE = "مؤقت",
    FINAL = "نهائي"
}
export class CreateOperateurDtwDto {
    @IsNumber()
    num_wilaya: number;

    @IsNumber()
    num_docier_client: number;

    @IsString()
    fullName_arabe: string;

    @IsString()
    fullName_francais: string;

    @IsDate()
    @Type(() => Date)
    date_expiration: Date;

    @IsDate()
    @Type(() => Date)
    date_prévue: Date;

    @IsNumber()
    num_dhoraire: number;

    @IsNumber()
    num_cate_enregistement: number;

    @IsString()
    activite: string;

    @IsOptional()
    @IsString()
    colonne1?: string;

    @IsString()
    nature_activite: string;

    @IsOptional()
    @IsString()
    colonne2?: string;

    @IsString()
    status_activite: string;

    @IsOptional()
    @IsString()
    colonne3?: string;

    @IsString()
    type_client: string;

    @IsOptional()
    @IsString()
    colonne4?: string;

    @IsOptional()
    @IsString()
    institution_person_moral?: string;

    @IsOptional()
    @IsString()
    fullName_gerent_person_moral?: string;

    @IsNumber()
    num_dacte_naissance: number;

    @IsNumber()
    num_didentification_national_NIN: number;

    @IsDate()
    @Type(() => Date)
    date_naissance: Date;

    @IsString()
    lieu_naissance_arabe: string;

    @IsString()
    lieu_naissance_francais: string;

    @IsString()
    nom_pere_arabe: string;

    @IsString()
    nom_pere_francais: string;

    @IsString()
    fullName_mere_arabe: string;

    @IsString()
    fullName_mere_francais: string;

    @IsString()
    communes_naissance_arabe: string;

    @IsString()
    communes_naissance_francais: string;

    @IsString()
    address_arabe: string;

    @IsString()
    address_francais: string;

    @IsString()
    address_municipalité_arabe: string;

    @IsString()
    address_municipalité_francais: string;

    @IsString()
    num_registre_commerce: string;

    @IsString()
    num_registre_commerce_n5: string;

    @IsDate()
    @Type(() => Date)
    hestoire_registre_commerce: Date;

    @IsDate()
    @Type(() => Date)
    modifier_hestoire_registre_commerce: Date;

    @IsDate()
    @Type(() => Date)
    date_debut_activite: Date;

    @IsOptional()
    @IsNumber()
    num_adherent_caise_national_non_salaire?: number;

    @IsOptional()
    @IsIn(['نعم', 'لا'])
    depend_activite?: string;

    @IsOptional()
    @IsIn(['مؤقت', 'نهائي'])
    type_depend?: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    date_arret_activite_temporaire?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    date_arret_activite_permanent?: Date;

    @IsOptional()
    @IsString()
    num_telephone_client?: string;

    @IsOptional()
    @IsString()
    soccupe?: string;

    @IsOptional()
    @IsString()
    note_chef_departement?: string;
}




// @IsNumber({}, { message: '📌 رقم الولاية مطلوب ويجب أن يكون رقمًا صحيحًا!' })
//     num_wilaya: number;

//     @IsNumber({}, { message: '📌 رقم ملف العميل مطلوب ويجب أن يكون رقمًا صحيحًا!' })
//     num_docier_client: number;

//     @IsString({ message: '📌 الاسم الكامل بالعربية مطلوب!' })
//     fullName_arabe: string;

//     @IsString({ message: '📌 الاسم الكامل بالفرنسية مطلوب!' })
//     fullName_francais: string;

//     @IsDateString({}, { message: '📌 تاريخ انتهاء الصلاحية يجب أن يكون بصيغة YYYY-MM-DD' })
//     date_expiration: string;

//     @IsDateString({}, { message: '📌 التاريخ الانتهاء يجب أن يكون بصيغة YYYY-MM-DD' })
//     date_prévue: string;

//     //@IsNumber({}, { message: '📌 رقم الجدول الزمني مطلوب ويجب أن يكون رقمًا صحيحًا!' })
//     num_dhoraire: number;

//     //@IsNumber({}, { message: '📌 رقم بطاقة التسجيل مطلوب!' })
//     num_cate_enregistement: number;

//     @IsString({ message: '📌 النشاط مطلوب!' })
//     activite: string;

//     @IsString({ message: '📌 طبيعة النشاط مطلوبة!' })
//     nature_activite: string;

//     @IsString({ message: '📌 حالة النشاط مطلوبة!' })
//     status_activite: string;

//     @IsString({ message: '📌 نوع العميل مطلوب!' })
//     type_client: string;

//     @IsOptional()
//     @IsString({ message: '📌 المؤسسة (في حالة الشخص المعنوي) يجب أن تكون نصًا!' })
//     institution_person_moral?: string;

//     @IsOptional()
//     @IsString({ message: '📌 الاسم الكامل للمدير (في حالة الشخص المعنوي) يجب أن يكون نصًا!' })
//     fullName_gerent_person_moral?: string;

//     @IsNumber({}, { message: '📌 رقم شهادة الميلاد مطلوب!' })
//     num_dacte_naissance: number;

//     @IsNumber({}, { message: '📌 رقم الهوية الوطنية مطلوب!' })
//     num_didentification_national_NIN: number;

//     @IsDateString({}, { message: '📌 تاريخ الميلاد يجب أن يكون بصيغة YYYY-MM-DD' })
//     date_naissance: string;

//     @IsString({ message: '📌 مكان الميلاد بالعربية مطلوب!' })
//     lieu_naissance_arabe: string;

//     @IsString({ message: '📌 مكان الميلاد بالفرنسية مطلوب!' })
//     lieu_naissance_francais: string;

//     @IsString({ message: '📌 اسم الأب بالعربية مطلوب!' })
//     nom_pere_arabe: string;

//     @IsString({ message: '📌 اسم الأب بالفرنسية مطلوب!' })
//     nom_pere_francais: string;

//     @IsString({ message: '📌 اسم الأم الكامل بالعربية مطلوب!' })
//     fullName_mere_arabe: string;

//     @IsString({ message: '📌 اسم الأم الكامل بالفرنسية مطلوب!' })
//     fullName_mere_francais: string;

//     @IsString({ message: '📌 بلدية الميلاد بالعربية مطلوبة!' })
//     communes_naissance_arabe: string;

//     @IsString({ message: '📌 بلدية الميلاد بالفرنسية مطلوبة!' })
//     communes_naissance_francais: string;

//     @IsString({ message: '📌 العنوان بالعربية مطلوب!' })
//     address_arabe: string;

//     @IsString({ message: '📌 العنوان بالفرنسية مطلوب!' })
//     address_francais: string;

//     @IsString({ message: '📌 بلدية العنوان بالعربية مطلوبة!' })
//     address_municipalité_arabe: string;

//     @IsString({ message: '📌 بلدية العنوان بالفرنسية مطلوبة!' })
//     address_municipalité_francais: string;

//     @IsNumber({}, { message: '📌 رقم السجل التجاري مطلوب!' })
//     num_registre_commerce: number;

//     @IsNumber({}, { message: '📌 رقم السجل التجاري (N5) مطلوب!' })
//     num_registre_commerce_n5: number;

//     @IsDateString({}, { message: '📌 تاريخ إنشاء السجل التجاري يجب أن يكون بصيغة YYYY-MM-DD' })
//     hestoire_registre_commerce: string;

//     @IsDateString({}, { message: '📌 تاريخ تعديل السجل التجاري يجب أن يكون بصيغة YYYY-MM-DD' })
//     modifier_hestoire_registre_commerce: string;

//     @IsDateString({}, { message: '📌 تاريخ بدء النشاط يجب أن يكون بصيغة YYYY-MM-DD' })
//     date_debut_activite: string;

//     @IsOptional()
//     @IsNumber({}, { message: '📌 رقم الانخراط في صندوق غير الأجراء يجب أن يكون رقمًا صحيحًا!' })
//     num_adherent_caise_national_non_salaire?: number;

//     @IsEnum(['نعم', 'لا'], { message: '📌 يجب أن يكون النشاط إما "نعم" أو "لا"!' })
//     depend_activite: string;

//     //@IsEnum(TypeDepend, { message: '📌 نوع التوقف يجب أن يكون "مؤقت" أو "نهائي"!' })
//     @IsOptional()
//     type_depend: string;

//     //@Transform(({ value }) => (value === "" ? undefined : value))
//     //@IsDateString({}, { message: '📌 تاريخ التوقف المؤقت للنشاط يجب أن يكون بصيغة YYYY-MM-DD' })
//     @IsOptional()
//     date_arret_activite_temporaire: string;

//     //@Transform(({ value }) => (value === "" ? undefined : value))
//     //@IsDateString({}, { message: '📌 تاريخ التوقف الدائم للنشاط يجب أن يكون بصيغة YYYY-MM-DD' })
//     @IsOptional()
//     date_arret_activite_permanent: string;

//     @IsOptional()
//     @IsString({ message: '📌 رقم الهاتف يجب أن يكون نصًا!' })
//     num_telephone_client?: string;

//     @IsOptional()
//     @IsString({ message: '📌 الوظيفة يجب أن تكون نصًا!' })
//     soccupe?: string;

//     @IsOptional()
//     @IsString({ message: '📌 ملاحظات رئيس القسم يجب أن تكون نصًا!' })
//     note_chef_departement?: string;