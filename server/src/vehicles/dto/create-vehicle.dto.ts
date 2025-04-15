import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsEnum,
    IsDate,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class CreateVehicleDto {
    @IsNotEmpty({message:"رقم الولاية مطلوب"})
    num_wilaya: string;
  
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty({ message: 'رقم ملف المتعامل في سجل الناقلين مطلوب' })
    num_docier_client: number;
  
    @IsString()
    @IsNotEmpty({ message: 'الاسم الكامل بالعربية مطلوب!' })
    fullName_arabe: string;
  
    @IsString()
    @IsNotEmpty({ message: 'الاسم الكامل بالفرنسية مطلوب!' })
    fullName_francais: string;
  
    @IsString()
    @IsNotEmpty({ message: 'النشاط مطلوب!' })
    activite: string;
  
    @IsOptional()
    @IsString()
    colonne1?: string;
  
    @IsString()
    @IsNotEmpty({ message: 'طبيعة النشاط مطلوبة!' })
    nature_activite: string;
  
    @IsOptional()
    @IsString()
    colonne2?: string;
  
    @IsString()
    @IsNotEmpty({ message: 'حالة النشاط مطلوبة!' })
    status_activite: string;
  
    @IsOptional()
    @IsString()
    colonne3?: string;
  
    @IsNumber()
    @Type(() => Number)
    num_bus_registration: number;
  
    @IsString()
    @IsNotEmpty()
    circle: string;
  
    @IsString()
    @IsNotEmpty()
    Municipality: string;
  
    @IsString()
    @IsNotEmpty()
    Style: string;
  
    @IsString()
    @IsNotEmpty()
    category: string;
  
    @IsString()
    @IsNotEmpty()
    type: string;
  
    @IsString()
    @IsNotEmpty()
    First_year_of_use: string;
  
    @IsNumber()
    @Type(() => Number)
    Number_of_seats: number;
  
    @IsString()
    @IsNotEmpty()
    Energy: string;
  
    @IsNumber()
    @Type(() => Number)
    num_driving_license: number;
  
    @IsDate()
    @Type(() => Date)
    driving_license_history: Date;
  
    @IsString()
    @IsNotEmpty()
    driving_license_dure: string;
  
    @IsDate()
    @Type(() => Date)
    line_activity_start_date: Date;
  
    @IsDate()
    @Type(() => Date)
    Vehicle_activity_start_date: Date;
  
    @IsString()
    @IsNotEmpty()
    font_type: string;
  
    @IsString()
    @IsNotEmpty()
    colonne4: string;
  
    @IsString()
    @IsNotEmpty()
    font_symbol: string;
  
    @IsString()
    @IsNotEmpty()
    point_depart: string;
  
    @IsString()
    @IsNotEmpty()
    point_arrive: string;
  
    @IsString()
    @IsNotEmpty()
    point_Traffic1: string;
  
    @IsString()
    @IsNotEmpty()
    point_Traffic2: string;
  
    @IsString()
    @IsNotEmpty()
    point_Traffic3: string;
  
    @IsString()
    @IsNotEmpty()
    point_Traffic4: string;
  
    @IsString()
    @IsNotEmpty()
    point_Traffic5: string;
  
    @IsString()
    @IsNotEmpty()
    line_start_time: string;
  
    @IsString()
    @IsNotEmpty()
    line_end_time: string;
  
    @IsString()
    @IsNotEmpty()
    Pace_per_minute: string;
  
    @IsString()
    @IsNotEmpty()
    time_depart1: string;
  
    @IsString()
    @IsNotEmpty()
    time_depart2: string;
  
    @IsString()
    @IsNotEmpty()
    time_depart3: string;
  
    @IsString()
    @IsNotEmpty()
    time_depart4: string;
  
    @IsOptional()
    @IsEnum(['موقفة', 'لا'])
    vihicile_parked?: string;
  
    @IsOptional()
    @IsEnum(['مؤقت', 'نهائي'])
    type_parked?: string;
  
    @IsOptional()
    hestoire_parked: Date;
  

    @IsOptional()
    hestoire_parked_end: Date;
  
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
  