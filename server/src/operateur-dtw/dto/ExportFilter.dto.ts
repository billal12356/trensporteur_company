import { IsOptional, IsString } from "class-validator";

export class ExportFilterDto {
    @IsOptional()
    @IsString()
    fullName_arabe?: string;
  
    @IsOptional()
    @IsString()
    num_wilaya?: string;
  
  }
  