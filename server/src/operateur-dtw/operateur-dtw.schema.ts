import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

export type OperateurDocument = HydratedDocument<Operateur>;

@Schema({timestamps:true})
export class Operateur {
  @Prop({ type: Number })
  num_wilaya: number;

  @Prop({ type: Number })
  num_docier_client: number;

  @Prop({ type: String })
  fullName_arabe: string;

  @Prop({ type: String })
  fullName_francais: string;

  @Prop({ type: Date })
  date_expiration: Date;

  @Prop({ type: Date })
  date_prévue: Date;

  @Prop({ type: Number })
  num_dhoraire: number;

  @Prop({ type: Number })
  num_cate_enregistement: number;

  @Prop({ type: String })
  activite: string;

  @Prop({ type: String,  })
  colonne1: string;

  @Prop({ type: String })
  nature_activite: string;

  @Prop({ type: String })
  colonne2: string;

  @Prop({ type: String })
  status_activite: string;

  @Prop({ type: String})
  colonne3: string;

  @Prop({ type: String })
  type_client: string;

  @Prop({ type: String })
  colonne4: string;

  @Prop({ type: String })
  institution_person_moral: string;

  @Prop({ type: String })
  fullName_gerent_person_moral: string;

  @Prop({ type: Number })
  num_dacte_naissance: number;

  @Prop({ type: Number })
  num_didentification_national_NIN: number;

  @Prop({ type: Number })
  Tax_identification_number_NIF: number;

  @Prop({ type: Date })
  date_naissance: Date;

  @Prop({ type: String })
  lieu_naissance_arabe: string;

  @Prop({ type: String })
  lieu_naissance_francais: string;

  @Prop({ type: String })
  nom_pere_arabe: string;

  @Prop({ type: String })
  nom_pere_francais: string;

  @Prop({ type: String })
  fullName_mere_arabe: string;

  @Prop({ type: String })
  fullName_mere_francais: string;

  @Prop({ type: String })
  communes_naissance_arabe: string;

  @Prop({ type: String })
  communes_naissance_francais: string;

  @Prop({ type: String })
  address_arabe: string;

  @Prop({ type: String })
  address_francais: string;

  @Prop({ type: String })
  address_municipalité_arabe: string;

  @Prop({ type: String })
  address_municipalité_francais: string;

  @Prop({ type: String })
  num_registre_commerce: string;

  @Prop({ type: String })
  num_registre_commerce_n5: string;

  @Prop({ type: Date })
  hestoire_registre_commerce: Date;

  @Prop({ type: Date })
  modifier_hestoire_registre_commerce: Date;

  @Prop({ type: Date })
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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  createdBy: mongoose.Types.ObjectId;
}

export const OperateurSchema = SchemaFactory.createForClass(Operateur);