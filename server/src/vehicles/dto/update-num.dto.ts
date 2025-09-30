import { IsNumber, isNumber } from "class-validator";

export class UpdateNumDto {
  @IsNumber()
  num_up: number
}