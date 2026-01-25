import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ImportOperateurService } from './import-operateur.service';
import { CreateImportOperateurDto } from './dto/create-import-operateur.dto';
import { UpdateImportOperateurDto } from './dto/update-import-operateur.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as operateurs from '../seed/data/operateur.json';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('import-operateur')
export class ImportOperateurController {
  constructor(private readonly importOperateurService: ImportOperateurService) { }

  @Post('create')
  async create() {
    // const filePath = path.join(process.cwd(), 'src', 'import-operateur', 'data.json');

    // const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));    
    return await this.importOperateurService.importExcel(operateurs);
  }


  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.importOperateurService.convertAndSaveToMongoDB(file);
      return {
        success: true,
        message: 'تم تحويل وحفظ ملف Excel بنجاح في MongoDB',
        savedRecords: result.savedCount,
        failedRecords: result.failedCount,
        errors: result.errors,
      };
    } catch (error) {
      throw new HttpException(
        `خطأ في تحويل Excel: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}
