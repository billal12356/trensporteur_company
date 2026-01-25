import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVihicleDto {
  @IsOptional() @IsNumber() num_wilaya?: number;
  @IsOptional() @IsNumber() num_docier_client?: number;

  @IsOptional() @IsString() fullName_arabe?: string;
  @IsOptional() @IsString() fullName_francais?: string;

  @IsOptional() @IsString() activite?: string;
  @IsOptional() @IsString() colonne1?: string;

  @IsOptional() @IsString() nature_activite?: string;
  @IsOptional() @IsString() colonne2?: string;

  @IsOptional() @IsString() status_activite?: string;
  @IsOptional() @IsString() colonne3?: string;

  @IsOptional() @IsString() num_bus_registration?: string;
  @IsOptional() @IsString() circle?: string;
  @IsOptional() @IsString() Municipality?: string;
  @IsOptional() @IsString() Style?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() type?: string;

  @IsOptional() @IsNumber() First_year_of_use?: number;

  @IsOptional() @IsNumber() total_load_trucks?: number;
  @IsOptional() @IsNumber() restricted_load?: number;
  @IsOptional() @IsNumber() Number_of_seats?: number;

  @IsOptional() @IsString() Energy?: string;

  @IsOptional() @IsNumber() num_driving_license?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  driving_license_history?: Date;

  @IsOptional() @IsString() driving_license_dure?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  line_activity_start_date?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  Vehicle_activity_start_date?: Date;

  @IsOptional() @IsString() font_type?: string;
  @IsOptional() @IsString() colonne4?: string;
  @IsOptional() @IsString() font_symbol?: string;

  @IsOptional() @IsString() point_depart?: string;
  @IsOptional() @IsString() point_arrive?: string;

  @IsOptional() @IsString() point_Traffic1?: string;
  @IsOptional() @IsString() point_Traffic2?: string;
  @IsOptional() @IsString() point_Traffic3?: string;
  @IsOptional() @IsString() point_Traffic4?: string;
  @IsOptional() @IsString() point_Traffic5?: string;

  @IsOptional() @IsString() line_start_time?: string;
  @IsOptional() @IsString() line_end_time?: string;
  @IsOptional() @IsString() Pace_per_minute?: string;

  @IsOptional() @IsString() time_depart1?: string;
  @IsOptional() @IsString() time_depart2?: string;
  @IsOptional() @IsString() time_depart3?: string;
  @IsOptional() @IsString() time_depart4?: string;

  @IsOptional() @IsEnum(['موقفة', 'لا'])
  vihicile_parked?: string;

  @IsOptional() @IsEnum(['مؤقت', 'نهائي'])
  type_parked?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  hestoire_parked?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  hestoire_parked_end?: Date;

  @IsOptional() @IsString() comments?: string;
  @IsOptional() @IsString() person_concerned?: string;
  @IsOptional() @IsString() note_chef_departement?: string;

  @IsOptional() @IsString() path?: string;
  @IsOptional() @IsNumber() num_up?: number;
}
