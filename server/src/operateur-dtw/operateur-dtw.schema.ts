import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OperateurDocument = HydratedDocument<Operateur>;

@Schema()
export class Operateur {
  @Prop({ type: Number, required: [true, "رقم الولاية مطلوب!"] })
  num_wilaya: number;

  @Prop({ type: Number, required: [true, "رقم ملف العميل مطلوب!"] })
  num_docier_client: number;

  @Prop({ type: String, required: [true, "الاسم الكامل بالعربية مطلوب!"] })
  fullName_arabe: string;

  @Prop({ type: String, required: [true, "الاسم الكامل بالفرنسية مطلوب!"] })
  fullName_francais: string;

  @Prop({ type: Date, required: [true, "تاريخ انتهاء الصلاحية مطلوب!"] })
  date_expiration: Date;

  @Prop({ type: Date, required: [true, "التاريخ المتوقع مطلوب!"] })
  date_prévue: Date;

  @Prop({ type: Number, required: [true, "رقم الجدول مطلوب!"] })
  num_dhoraire: number;

  @Prop({ type: Number, required: [true, "رقم بطاقة التسجيل مطلوب!"] })
  num_cate_enregistement: number;

  @Prop({ type: String, required: [true, "النشاط مطلوب!"] })
  activite: string;

  @Prop({ type: String,  })
  colonne1: string;

  @Prop({ type: String, required: [true, "طبيعة النشاط مطلوبة!"] })
  nature_activite: string;

  @Prop({ type: String })
  colonne2: string;

  @Prop({ type: String, required: [true, "حالة النشاط مطلوبة!"] })
  status_activite: string;

  @Prop({ type: String})
  colonne3: string;

  @Prop({ type: String, required: [true, "نوع العميل مطلوب!"] })
  type_client: string;

  @Prop({ type: String })
  colonne4: string;

  @Prop({ type: String })
  institution_person_moral: string;

  @Prop({ type: String })
  fullName_gerent_person_moral: string;

  @Prop({ type: Number, required: [true, "رقم شهادة الميلاد مطلوب!"] })
  num_dacte_naissance: number;

  @Prop({ type: Number, required: [true, "رقم التعريف الوطني مطلوب!"] })
  num_didentification_national_NIN: number;

  @Prop({ type: Date, required: [true, "تاريخ الميلاد مطلوب!"] })
  date_naissance: Date;

  @Prop({ type: String, required: [true, "مكان الميلاد بالعربية مطلوب!"] })
  lieu_naissance_arabe: string;

  @Prop({ type: String, required: [true, "مكان الميلاد بالفرنسية مطلوب!"] })
  lieu_naissance_francais: string;

  @Prop({ type: String, required: [true, "اسم الأب بالعربية مطلوب!"] })
  nom_pere_arabe: string;

  @Prop({ type: String, required: [true, "اسم الأب بالفرنسية مطلوب!"] })
  nom_pere_francais: string;

  @Prop({ type: String, required: [true, "اسم الأم بالعربية مطلوب!"] })
  fullName_mere_arabe: string;

  @Prop({ type: String, required: [true, "اسم الأم بالفرنسية مطلوب!"] })
  fullName_mere_francais: string;

  @Prop({ type: String, required: [true, "بلدية الميلاد بالعربية مطلوبة!"] })
  communes_naissance_arabe: string;

  @Prop({ type: String, required: [true, "بلدية الميلاد بالفرنسية مطلوبة!"] })
  communes_naissance_francais: string;

  @Prop({ type: String, required: [true, "العنوان  بالعربية مطلوب!"] })
  address_arabe: string;

  @Prop({ type: String, required: [true, "العنوان  بالفرنسية مطلوب!"] })
  address_francais: string;

  @Prop({ type: String, required: [true, "بلدية العنوان بالعربية مطلوب!"] })
  address_municipalité_arabe: string;

  @Prop({ type: String, required: [true, "بلدية العنوان بالفرنسية مطلوب!"] })
  address_municipalité_francais: string;

  @Prop({ type: Number, required: [true, "رقم السجل التجاري مطلوب!"] })
  num_registre_commerce: number;

  @Prop({ type: Number, required: [true, "رقم السجل التجاري الفرعي مطلوب!"] })
  num_registre_commerce_n5: number;

  @Prop({ type: Date, required: [true, "تاريخ تسجيل السجل التجاري مطلوب!"] })
  hestoire_registre_commerce: Date;

  @Prop({ type: Date, required: [true, "تاريخ تحديث السجل التجاري مطلوب!"] })
  modifier_hestoire_registre_commerce: Date;

  @Prop({ type: Date, required: [true, "تاريخ بدء النشاط مطلوب!"] })
  date_debut_activite: Date;

  @Prop({ type: Number })
  num_adherent_caise_national_non_salaire: number;

  @Prop({ type: String, enum: ['نعم', 'لا'] })
  depend_activite: string;

  @Prop({ type: String, enum: ['مؤقت', 'نهائي'] })
  type_depend: string;

  @Prop({ type: Date,required: false})
  date_arret_activite_temporaire?: Date;

  @Prop({ type: Date,required: false})
  date_arret_activite_permanent?: Date;

  @Prop({ type: String })
  num_telephone_client: string;

  @Prop({ type: String })
  soccupe: string;

  @Prop({ type: String })
  note_chef_departement: string;
}

export const OperateurSchema = SchemaFactory.createForClass(Operateur);
