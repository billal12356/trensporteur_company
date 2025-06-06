import { PartialType } from '@nestjs/mapped-types';
import { CreateOperateurDto } from './create-operateur-dtw.dto';

export class UpdateOperateurDtwDto extends PartialType(CreateOperateurDto) {}
