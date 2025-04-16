
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChauffeurDocument = HydratedDocument<Chauffeur>;

@Schema({timestamps:true})
export class Chauffeur {
  @Prop({
    type: Number,
    required: true
  })
  num_chauffeur: number;

  @Prop({
    type: Number,
    required: true
  })
  num_demende: number;

  @Prop({ type: Date, required: true })
  hestoire_demende: Date;

  @Prop({
    type: Number,
    required: true
  })
  num_enregistrement_du_transporteur: number;

  @Prop({
    type: String,
    required: true
  })
  operateur: string;

  @Prop({
    type: String,
    required: true
  })
  ligne_exploitée: string;

  @Prop({
    type: Number,
    required: true
  })
  num_vehicule: number;

  @Prop({
    type: String,
    required: true
  })
  nature_ligne: string;

  @Prop({
    type: String,
    required: true
  })
  nom_prenom_chauffeur: string;

  @Prop({
    type: String,
    required: true
  })
  nature_utilisateur: string;

  @Prop({ type: Number, required: [true, "رقم التعريف الوطني مطلوب!"] })
  num_didentification_national_NIN: number;

  @Prop({
    type: Number,
    required: true
  })
  num_permis_conduire: number;

  @Prop({ type: Date, required: true })
  date_sortie: Date;


  @Prop({ type: Date, required: true })
  date_expiration_article: Date;

  @Prop({
    type: String,
    required: true
  })
  municipalite_emettrice: string;

  @Prop({ type: Date, required: true })
  date_naissance: Date;

  @Prop({
    type: String,
    required: true
  })
  lieu_naissance: string;

  @Prop({
    type: String,
    required: true
  })
  address: string;

  @Prop({
    type: Number,
    required: true
  })
  Num_certificat_compétence_professionnelle: number;

  @Prop({ type: Date, required: true })
  date_obtention_certificat_aptitude_professionnelle: Date;

  @Prop({
    type: String,
    required: true
  })
  wilaya: string;

  @Prop({
    type: Number,
    required: true
  })
  num_serie: number;

  @Prop({
    type: Number,
    required: true
  })
  num_membre_fonds_national: number;

  @Prop({ type: String, enum: ['موقفة', 'لا'] })
  vihicile_parked: string;

  @Prop({ type: String, enum: ['مؤقت', 'نهائي'] })
  type_parked: string;

  @Prop({ type: String })
  comments: string;
}


export const ChauffeurSchema = SchemaFactory.createForClass(Chauffeur);
