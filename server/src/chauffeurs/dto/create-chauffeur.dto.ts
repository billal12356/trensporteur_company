import {
    IsString,
    IsNumber,
    IsDate,
    IsOptional,
    IsEnum,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class CreateChauffeurDto {
    @IsNumber()
    num_chauffeur: number;
  
    @IsNumber()
    num_demende: number;
  
    @IsDate()
    @Type(() => Date)
    hestoire_demende: Date;
  
    @IsNumber()
    num_enregistrement_du_transporteur: number;
  
    @IsString()
    operateur: string;
  
    @IsString()
    ligne_exploitée: string;
  
    @IsNumber()
    num_vehicule: number;
  
    @IsString()
    nature_ligne: string;
  
    @IsString()
    nom_prenom_chauffeur: string;
  
    @IsString()
    nature_utilisateur: string;
  
    @IsNumber()
    num_didentification_national_NIN: number;
  
    @IsNumber()
    num_permis_conduire: number;
  
    @IsDate()
    @Type(() => Date)
    date_sortie: Date;
  
    @IsDate()
    @Type(() => Date)
    date_expiration_article: Date;
  
    @IsString()
    municipalite_emettrice: string;
  
    @IsDate()
    @Type(() => Date)
    date_naissance: Date;
  
    @IsString()
    lieu_naissance: string;
  
    @IsString()
    address: string;
  
    @IsNumber()
    Num_certificat_compétence_professionnelle: number;
  
    @IsDate()
    @Type(() => Date)
    date_obtention_certificat_aptitude_professionnelle: Date;
  
    @IsString()
    wilaya: string;
  
    @IsNumber()
    num_serie: number;
  
    @IsNumber()
    num_membre_fonds_national: number;
  
    @IsOptional()
    @IsEnum(['موقفة', 'لا'])
    vihicile_parked?: string;
  
    @IsOptional()
    @IsEnum(['مؤقت', 'نهائي'])
    type_parked?: string;
  
    @IsOptional()
    @IsString()
    comments?: string;
  }
  