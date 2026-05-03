import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  IsNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChauffeurDto {
  @IsOptional()
  @IsNumber()
  num_chauffeur?: number;

  @IsOptional()
  @IsNumber()
  num_demende?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  hestoire_demende?: Date;

  @IsOptional()
  @IsNumber()
  num_enregistrement_du_transporteur?: number;

  @IsOptional()
  @IsString()
  operateur?: string;

  @IsOptional()
  @IsString()
  ligne_exploitée?: string;

  @IsOptional()
  @IsString()
  num_vehicule?: string;

  @IsOptional()
  @IsString()
  nature_ligne?: string;

  @IsOptional()
  @IsString()
  nom_prenom_chauffeur?: string;

  @IsOptional()
  @IsString()
  nature_utilisateur?: string;

  @IsOptional()
  @IsNumber()
  num_didentification_national_NIN?: number;

  @IsOptional()
  @IsString()
  num_permis_conduire?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date_sortie?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date_expiration_article?: Date;

  @IsOptional()
  @IsString()
  municipalite_emettrice?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date_naissance?: Date;

  @IsOptional()
  @IsString()
  lieu_naissance?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  Num_certificat_compétence_professionnelle?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date_obtention_certificat_aptitude_professionnelle?: Date;

  @IsOptional()
  @IsString()
  wilaya?: string;

  @IsOptional()
  @IsNumber()
  num_serie?: number;

  @IsOptional()
  @IsNumber()
  num_membre_fonds_national?: number;

  @IsOptional()
  @IsString()
  vihicile_parked?: string;

  @IsOptional()
  @IsString()
  type_parked?: string;

  @IsOptional()
  @IsString()
  comments?: string;
}