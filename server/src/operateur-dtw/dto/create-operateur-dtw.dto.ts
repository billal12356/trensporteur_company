import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOperateurDto {
  @IsOptional() @IsNumber() num_wilaya?: number;
  @IsOptional() @IsNumber() num_docier_client?: number;

  @IsOptional() @IsString() fullName_arabe?: string;
  @IsOptional() @IsString() fullName_francais?: string;

  @IsOptional() @IsDate() @Type(() => Date) date_expiration?: Date;
  @IsOptional() @IsDate() @Type(() => Date) date_prévue?: Date;

  @IsOptional() @IsNumber() num_dhoraire?: number;
  @IsOptional() @IsNumber() num_cate_enregistement?: number;

  @IsOptional() @IsString() activite?: string;
  @IsOptional() @IsString() colonne1?: string;

  @IsOptional() @IsString() nature_activite?: string;
  @IsOptional() @IsString() colonne2?: string;

  @IsOptional() @IsString() status_activite?: string;
  @IsOptional() @IsString() colonne3?: string;

  @IsOptional() @IsString() type_client?: string;
  @IsOptional() @IsString() colonne4?: string;

  @IsOptional() @IsString() institution_person_moral?: string;
  @IsOptional() @IsString() fullName_gerent_person_moral?: string;

  @IsOptional() @IsNumber() num_dacte_naissance?: number;
  @IsOptional() @IsNumber() num_didentification_national_NIN?: number;

  @IsOptional() @IsDate() @Type(() => Date) date_naissance?: Date;

  @IsOptional() @IsString() lieu_naissance_arabe?: string;
  @IsOptional() @IsString() lieu_naissance_francais?: string;

  @IsOptional() @IsString() nom_pere_arabe?: string;
  @IsOptional() @IsString() nom_pere_francais?: string;

  @IsOptional() @IsString() fullName_mere_arabe?: string;
  @IsOptional() @IsString() fullName_mere_francais?: string;

  @IsOptional() @IsString() communes_naissance_arabe?: string;
  @IsOptional() @IsString() communes_naissance_francais?: string;

  @IsOptional() @IsString() address_arabe?: string;
  @IsOptional() @IsString() address_francais?: string;

  @IsOptional() @IsString() address_municipalité_arabe?: string;
  @IsOptional() @IsString() address_municipalité_francais?: string;

  @IsOptional() @IsString() num_registre_commerce?: string;
  @IsOptional() @IsString() num_registre_commerce_n5?: string;

  @IsOptional() @IsDate() @Type(() => Date) hestoire_registre_commerce?: Date;
  @IsOptional() @IsDate() @Type(() => Date) modifier_hestoire_registre_commerce?: Date;

  @IsOptional() @IsDate() @Type(() => Date) date_debut_activite?: Date;

  @IsOptional() @IsNumber() num_adherent_caise_national_non_salaire?: number;

  @IsOptional() @IsIn(['نعم', 'لا']) depend_activite?: string;
  @IsOptional() @IsIn(['مؤقت', 'نهائي']) type_depend?: string;

  @IsOptional() date_arret_activite_temporaire?: Date;
  @IsOptional() date_arret_activite_permanent?: Date;

  @IsOptional() @IsString() num_telephone_client?: string;
  @IsOptional() @IsString() soccupe?: string;
  @IsOptional() @IsString() note_chef_departement?: string;
}
