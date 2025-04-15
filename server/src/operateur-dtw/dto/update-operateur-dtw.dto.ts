import { PartialType } from '@nestjs/mapped-types';
import { CreateOperateurDtwDto } from './create-operateur-dtw.dto';

export class UpdateOperateurDtwDto extends PartialType(CreateOperateurDtwDto) {}
