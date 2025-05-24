
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { StringDecoder } from 'string_decoder';

export type ChauffeurDocument = HydratedDocument<Chauffeur>;

@Schema({timestamps:true})
export class Chauffeur {
  @Prop({
    type: Number,
    //required: true
  })
  num_chauffeur: number;

  @Prop({
    type: Number,
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
  })
  ligne_exploitée: string;

  @Prop({
    type: String,
    required: true
  })
  num_vehicule: string;

  @Prop({
    type: String,
  })
  nature_ligne: string;

  @Prop({
    type: String,
    required: true
  })
  nom_prenom_chauffeur: string;

  @Prop({
    type: String,
  })
  nature_utilisateur: string;

  @Prop({ type: Number})
  num_didentification_national_NIN: number;

  @Prop({
    type: String,
    required: true
  })
  num_permis_conduire: string;

  @Prop({ type: Date})
  date_sortie: Date;


  @Prop({ type: Date })
  date_expiration_article: Date;

  @Prop({
    type: String,
  })
  municipalite_emettrice: string;

  @Prop({ type: Date})
  date_naissance: Date;

  @Prop({
    type: String,
    required: true
  })
  lieu_naissance: string;

  @Prop({
    type: String,
  })
  address: string;

  @Prop({
    type: Number,
  })
  Num_certificat_compétence_professionnelle: number;

  @Prop({ type: Date })
  date_obtention_certificat_aptitude_professionnelle: Date;

  @Prop({
    type: String,
  })
  wilaya: string;

  @Prop({
    type: Number,
  })
  num_serie: number;

  @Prop({
    type: Number,
  })
  num_membre_fonds_national: number;

  @Prop({ type: String})
  vihicile_parked: string;

  @Prop({ type: String })
  type_parked: string;

  @Prop({ type: String })
  comments: string;
}


export const ChauffeurSchema = SchemaFactory.createForClass(Chauffeur);
