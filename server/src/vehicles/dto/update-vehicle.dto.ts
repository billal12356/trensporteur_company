import { PartialType } from '@nestjs/mapped-types';
import { CreateVihicleDto } from './create-vehicle.dto';

export class UpdateVehicleDto extends PartialType(CreateVihicleDto) {}
