import { PartialType } from '@nestjs/mapped-types';
import { CreateImportOperateurDto } from './create-import-operateur.dto';

export class UpdateImportOperateurDto extends PartialType(CreateImportOperateurDto) {}
