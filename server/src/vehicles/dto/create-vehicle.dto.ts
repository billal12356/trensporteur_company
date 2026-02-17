import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDate,
  IsDateString
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVihicleDto {
  @IsNumber()
  num_wilaya: number;

  @IsNumber()
  num_docier_client: number;

  @IsString()
  @IsNotEmpty({ message: "الاسم الكامل بالعربية مطلوب!" })
  fullName_arabe: string;

  @IsString()
  @IsNotEmpty({ message: "الاسم الكامل بالفرنسية مطلوب!" })
  fullName_francais: string;

  @IsString()
  @IsNotEmpty({ message: "النشاط مطلوب!" })
  activite: string;

  @IsOptional()
  @IsString()
  colonne1?: string;

  @IsString()
  @IsNotEmpty({ message: "طبيعة النشاط مطلوبة!" })
  nature_activite: string;

  @IsOptional()
  @IsString()
  colonne2?: string;

  @IsString()
  @IsNotEmpty({ message: "حالة النشاط مطلوبة!" })
  status_activite: string;

  @IsOptional()
  @IsString()
  colonne3?: string;

  @IsString()
  num_bus_registration: string;

  @IsString()
  circle: string;

  @IsString()
  Municipality: string;

  @IsString()
  Style: string;

  @IsString()
  category: string;

  @IsString()
  type: string;

  @IsNumber()
  First_year_of_use: number;

  @IsOptional()
  @IsNumber()
  Number_of_seats?: number;

  @IsOptional()
  @IsString()
  Energy?: string;

  @IsNumber()
  num_driving_license: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  driving_license_history?: Date;

  @IsOptional()
  @IsString()
  driving_license_dure?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  line_activity_start_date?: Date;

  @Type(() => Date)
  @IsDate()
  Vehicle_activity_start_date: Date;

  @IsOptional()
  @IsString()
  font_type?: string;

  @IsString()
  colonne4: string;

  @IsString()
  font_symbol: string;

  @IsString()
  point_depart: string;

  @IsString()
  point_arrive: string;

  @IsOptional()
  @IsString()
  point_Traffic1?: string;

  @IsOptional()
  @IsString()
  point_Traffic2?: string;

  @IsOptional()
  @IsString()
  point_Traffic3?: string;

  @IsOptional()
  @IsString()
  point_Traffic4?: string;

  @IsOptional()
  @IsString()
  point_Traffic5?: string;

  @IsOptional()
  @IsString()
  line_start_time?: string;

  @IsOptional()
  @IsString()
  line_end_time?: string;

  @IsOptional()
  @IsString()
  Pace_per_minute?: string;

  @IsOptional()
  @IsString()
  time_depart1?: string;

  @IsOptional()
  @IsString()
  time_depart2?: string;

  @IsOptional()
  @IsString()
  time_depart3?: string;

  @IsOptional()
  @IsString()
  time_depart4?: string;

  @IsOptional()
  @IsEnum(['نعم', 'لا'])
  vihicile_parked?: string;

  @IsOptional()
  @IsEnum(['مؤقت', 'نهائي'])
  type_parked?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  hestoire_parked?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  hestoire_parked_end?: Date;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsString()
  person_concerned?: string;

  @IsOptional()
  @IsString()
  note_chef_departement?: string;

  @IsOptional()
  @IsString()
  path?: string;


  @IsNumber()
  num_up: number;
}
