import { PartialType } from '@nestjs/mapped-types';
import { CreateVihicleDto } from './create-vehicle.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateVehicleDto extends PartialType(CreateVihicleDto) {
}
