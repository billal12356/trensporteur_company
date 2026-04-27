import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
  IsIn,
  IsNumberString,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOperateurDto {
  @IsNumber()
  num_wilaya: number;

  @IsNumber()
  num_docier_client: number;

  @IsString()
  @IsNotEmpty()
  fullName_arabe: string;

  @IsString()
  @IsNotEmpty()
  fullName_francais: string;

  @IsDate()
  @Type(() => Date)
  date_expiration: Date;

  @IsDate()
  @Type(() => Date)
  date_prévue: Date;

  @IsNumber()
  num_dhoraire: number;

  @IsNumber()
  num_cate_enregistement: number;

  @IsString()
  @IsNotEmpty()
  activite: string;

  @IsOptional()
  @IsString()
  colonne1?: string;

  @IsString()
  @IsNotEmpty()
  nature_activite: string;

  @IsOptional()
  @IsString()
  colonne2?: string;

  @IsString()
  @IsNotEmpty()
  status_activite: string;

  @IsOptional()
  @IsString()
  colonne3?: string;

  @IsString()
  @IsNotEmpty()
  type_client: string;

  @IsOptional()
  @IsString()
  colonne4?: string;

  @IsOptional()
  @IsString()
  institution_person_moral?: string;

  @IsOptional()
  @IsString()
  fullName_gerent_person_moral?: string;

  @IsNumber()
  num_dacte_naissance: number;

  @IsNumber()
  @Length(18, 18, { message: "رقم التعريف الوطني يجب أن يكون 18 رقم بالضبط" })
  num_didentification_national_NIN: string;
  
  @IsNumber()
  Tax_identification_number_NIF: number;

  @IsDate()
  @Type(() => Date)
  date_naissance: Date;

  @IsString()
  @IsNotEmpty()
  lieu_naissance_arabe: string;

  @IsString()
  @IsNotEmpty()
  lieu_naissance_francais: string;

  @IsString()
  @IsNotEmpty()
  nom_pere_arabe: string;

  @IsString()
  @IsNotEmpty()
  nom_pere_francais: string;

  @IsString()
  @IsNotEmpty()
  fullName_mere_arabe: string;

  @IsString()
  @IsNotEmpty()
  fullName_mere_francais: string;

  @IsString()
  @IsNotEmpty()
  communes_naissance_arabe: string;

  @IsString()
  @IsNotEmpty()
  communes_naissance_francais: string;

  @IsString()
  @IsNotEmpty()
  address_arabe: string;

  @IsString()
  @IsNotEmpty()
  address_francais: string;

  @IsString()
  @IsNotEmpty()
  address_municipalité_arabe: string;

  @IsString()
  @IsNotEmpty()
  address_municipalité_francais: string;

  @IsString()
  @IsNotEmpty()
  num_registre_commerce: string;

  @IsString()
  @IsNotEmpty()
  num_registre_commerce_n5: string;

  @IsDate()
  @Type(() => Date)
  hestoire_registre_commerce: Date;

  @IsDate()
  @Type(() => Date)
  modifier_hestoire_registre_commerce: Date;

  @IsDate()
  @Type(() => Date)
  date_debut_activite: Date;

  @IsOptional()
  @IsNumber()
  num_adherent_caise_national_non_salaire?: number;

  @IsOptional()
  @IsIn(['نعم', 'لا'])
  depend_activite?: string;

  @IsOptional()
  @IsIn(['مؤقت', 'نهائي'])
  type_depend?: string;

  @IsOptional()
  date_arret_activite_temporaire?: Date;

  @IsOptional()
  date_arret_activite_permanent?: Date;

  @IsOptional()
  @IsString()
  num_telephone_client?: string;

  @IsOptional()
  @IsString()
  soccupe?: string;

  @IsOptional()
  @IsString()
  note_chef_departement?: string;
}
