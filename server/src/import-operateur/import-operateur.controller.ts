import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ImportOperateurService } from './import-operateur.service';
import { CreateImportOperateurDto } from './dto/create-import-operateur.dto';
import { UpdateImportOperateurDto } from './dto/update-import-operateur.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as operateurs from '../seed/data/operateur.json';
@Controller('import-operateur')
export class ImportOperateurController {
  constructor(private readonly importOperateurService: ImportOperateurService) { }

  @Post('create')
  async create() {
    // const filePath = path.join(process.cwd(), 'src', 'import-operateur', 'data.json');

    // const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));    
    return await this.importOperateurService.importExcel(operateurs);
  }

 
}
