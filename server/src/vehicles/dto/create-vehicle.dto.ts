import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsEnum,
    IsDate,
    IsIn,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class CreateVehicleDto {
     @IsNumber()
  num_wilaya: number;

  @IsNumber()
  num_docier_client: number;

  @IsString()
  fullName_arabe: string;

  @IsString()
  fullName_francais: string;

  @IsString()
  activite: string;

  @IsOptional()
  @IsString()
  colonne1?: string;

  @IsString()
  nature_activite: string;

  @IsOptional()
  @IsString()
  colonne2?: string;

  @IsString()
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
  @IsIn(['موقفة', 'لا'])
  vihicile_parked?: string;

  @IsOptional()
  @IsIn(['مؤقت', 'نهائي'])
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
  }
  


  // @IsNotEmpty({message:"رقم الولاية مطلوب"})
  //   num_wilaya: string;
  
  //   @IsNumber()
  //   @Type(() => Number)
  //   @IsNotEmpty({ message: 'رقم ملف المتعامل في سجل الناقلين مطلوب' })
  //   num_docier_client: number;
  
  //   @IsString()
  //   @IsNotEmpty({ message: 'الاسم الكامل بالعربية مطلوب!' })
  //   fullName_arabe: string;
  
  //   @IsString()
  //   @IsNotEmpty({ message: 'الاسم الكامل بالفرنسية مطلوب!' })
  //   fullName_francais: string;
  
  //   @IsString()
  //   @IsNotEmpty({ message: 'النشاط مطلوب!' })
  //   activite: string;
  
  //   @IsOptional()
  //   @IsString()
  //   colonne1?: string;
  
  //   @IsString()
  //   @IsNotEmpty({ message: 'طبيعة النشاط مطلوبة!' })
  //   nature_activite: string;
  
  //   @IsOptional()
  //   @IsString()
  //   colonne2?: string;
  
  //   @IsString()
  //   @IsNotEmpty({ message: 'حالة النشاط مطلوبة!' })
  //   status_activite: string;
  
  //   @IsOptional()
  //   @IsString()
  //   colonne3?: string;
  
  //   @IsNumber()
  //   @Type(() => Number)
  //   num_bus_registration: number;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   circle: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   Municipality: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   Style: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   category: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   type: string;
  
  //   @IsNumber()
  //   @IsNotEmpty()
  //   First_year_of_use: number;
  
  //   @IsNumber()
  //   @Type(() => Number)
  //   Number_of_seats: number;
  
  //   @IsString()
  //   Energy: string;
  
  //   @IsNumber()
  //   @Type(() => Number)
  //   num_driving_license: number;
  
  //   @IsDate()
  //   @Type(() => Date)
  //   driving_license_history: Date;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   driving_license_dure: string;
  
  //   @IsDate()
  //   @Type(() => Date)
  //   line_activity_start_date: Date;
  
  //   @IsDate()
  //   @Type(() => Date)
  //   Vehicle_activity_start_date: Date;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   font_type: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   colonne4: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   font_symbol: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   point_depart: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   point_arrive: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   point_Traffic1: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   point_Traffic2: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   point_Traffic3: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   point_Traffic4: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   point_Traffic5: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   line_start_time: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   line_end_time: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   Pace_per_minute: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   time_depart1: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   time_depart2: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   time_depart3: string;
  
  //   @IsString()
  //   @IsNotEmpty()
  //   time_depart4: string;
  
  //   @IsOptional()
  //   @IsEnum(['موقفة', 'لا'])
  //   vihicile_parked?: string;
  
  //   @IsOptional()
  //   @IsEnum(['مؤقت', 'نهائي'])
  //   type_parked?: string;
  
  //   @IsOptional()
  //   hestoire_parked: Date;
  

  //   @IsOptional()
  //   hestoire_parked_end: Date;
  
  //   @IsOptional()
  //   @IsString()
  //   comments?: string;
  
  //   @IsOptional()
  //   @IsString()
  //   person_concerned?: string;
  
  //   @IsOptional()
  //   @IsString()
  //   note_chef_departement?: string;
  
  //   @IsOptional()
  //   @IsString()
  //   path?: string;