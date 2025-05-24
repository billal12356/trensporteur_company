import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChauffeurDto {
  @IsOptional()
  @IsNumber()
  num_chauffeur?: number;

  @IsOptional()
  @IsNumber()
  num_demende?: number;

  @Type(() => Date)
  @IsDate()
  hestoire_demende: Date;

  @IsNumber()
  num_enregistrement_du_transporteur: number;

  @IsString()
  @IsNotEmpty()
  operateur: string;

  @IsOptional()
  @IsString()
  ligne_exploitée?: string;

  @IsString()
  @IsNotEmpty()
  num_vehicule: string;

  @IsOptional()
  @IsString()
  nature_ligne?: string;

  @IsString()
  @IsNotEmpty()
  nom_prenom_chauffeur: string;

  @IsOptional()
  @IsString()
  nature_utilisateur?: string;

  @IsOptional()
  @IsNumber()
  num_didentification_national_NIN?: number;

  @IsString()
  @IsNotEmpty()
  num_permis_conduire: string;

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

  @IsString()
  @IsNotEmpty()
  lieu_naissance: string;

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
