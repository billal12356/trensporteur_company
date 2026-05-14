import { IsArray, IsString } from 'class-validator';

export class GeneratePermitPdfDto {
  @IsString()
  operateurId: string;

  @IsString()
  dateConcerned: string; // format: DD/MM/YYYY

  @IsString()
  path: string;
  @IsString()
  benifit: string;
  @IsString()
  dep_date: string;
  @IsString()
  return_date: string;
  @IsArray()
  @IsString({ each: true })
  vehicleIds: string[];
}
