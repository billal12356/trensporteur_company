import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OperateurDocument = HydratedDocument<Operateur>;

@Schema({ timestamps: true })
export class Operateur {
  @Prop() num_wilaya?: number;
  @Prop() num_docier_client?: number;

  @Prop() fullName_arabe?: string;
  @Prop() fullName_francais?: string;

  @Prop() date_expiration?: Date;
  @Prop() date_prévue?: Date;

  @Prop() num_dhoraire?: number;
  @Prop() num_cate_enregistement?: number;

  @Prop() activite?: string;
  @Prop() colonne1?: string;

  @Prop() nature_activite?: string;
  @Prop() colonne2?: string;

  @Prop() status_activite?: string;
  @Prop() colonne3?: string;

  @Prop() type_client?: string;
  @Prop() colonne4?: string;

  @Prop() institution_person_moral?: string;
  @Prop() fullName_gerent_person_moral?: string;

  @Prop() num_dacte_naissance?: number;
  @Prop() num_didentification_national_NIN?: number;

  @Prop() date_naissance?: Date;

  @Prop() lieu_naissance_arabe?: string;
  @Prop() lieu_naissance_francais?: string;

  @Prop() nom_pere_arabe?: string;
  @Prop() nom_pere_francais?: string;

  @Prop() fullName_mere_arabe?: string;
  @Prop() fullName_mere_francais?: string;

  @Prop() communes_naissance_arabe?: string;
  @Prop() communes_naissance_francais?: string;

  @Prop() address_arabe?: string;
  @Prop() address_francais?: string;

  @Prop() address_municipalité_arabe?: string;
  @Prop() address_municipalité_francais?: string;

  @Prop() num_registre_commerce?: string;
  @Prop() num_registre_commerce_n5?: string;

  @Prop() hestoire_registre_commerce?: Date;
  @Prop() modifier_hestoire_registre_commerce?: Date;

  @Prop() date_debut_activite?: Date;

  @Prop() num_adherent_caise_national_non_salaire?: number;

  @Prop({ enum: ['نعم', 'لا'] })
  depend_activite?: string;

  @Prop({ enum: ['مؤقت', 'نهائي'] })
  type_depend?: string;

  @Prop() date_arret_activite_temporaire?: Date;
  @Prop() date_arret_activite_permanent?: Date;

  @Prop() num_telephone_client?: string;
  @Prop() soccupe?: string;
  @Prop() note_chef_departement?: string;
}

export const OperateurSchema = SchemaFactory.createForClass(Operateur);
