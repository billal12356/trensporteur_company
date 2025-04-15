import { PartialType } from '@nestjs/mapped-types';
import { CreateChauffeurDto } from './create-chauffeur.dto';

export class UpdateChauffeurDto extends PartialType(CreateChauffeurDto) {}
