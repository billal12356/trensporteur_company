import { IsNotEmpty, IsString } from "class-validator";

export class ExportLineDto {
  @IsString()
  @IsNotEmpty()
  lineCode: string
}