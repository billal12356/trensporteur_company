import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChauffeurDocument = HydratedDocument<Chauffeur>;

@Schema({
  timestamps: true,
  strict: false,     // ⭐ يسمح بحفظ أي حقل
  minimize: false,   // ⭐ يمنع حذف الحقول التي قيمتها null
})
export class Chauffeur {

  @Prop() num_chauffeur?: number;
  @Prop() num_demende?: number;

  @Prop() hestoire_demende?: Date;

  @Prop() num_enregistrement_du_transporteur?: number;

  @Prop() operateur?: string;

  @Prop() ligne_exploitée?: string;

  @Prop() num_vehicule?: string;

  @Prop() nature_ligne?: string;

  @Prop() nom_prenom_chauffeur?: string;

  @Prop() nature_utilisateur?: string;

  @Prop() num_didentification_national_NIN?: number;

  @Prop() num_permis_conduire?: string;

  @Prop() date_sortie?: Date;

  @Prop() date_expiration_article?: Date;

  @Prop() municipalite_emettrice?: string;

  @Prop() date_naissance?: Date;

  @Prop() lieu_naissance?: string;

  @Prop() address?: string;

  @Prop() Num_certificat_compétence_professionnelle?: number;

  @Prop() date_obtention_certificat_aptitude_professionnelle?: Date;

  @Prop() wilaya?: string;

  @Prop() num_serie?: number;

  @Prop() num_membre_fonds_national?: number;

  @Prop() vihicile_parked?: string;

  @Prop() type_parked?: string;

  @Prop() comments?: string;
}

export const ChauffeurSchema = SchemaFactory.createForClass(Chauffeur);
