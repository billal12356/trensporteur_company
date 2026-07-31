import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/gaurds/auth.guard';
import { RolesGuard } from 'src/common/gaurds/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ChauffeursService } from './chauffeurs.service';
import { CreateChauffeurDto } from './dto/create-chauffeur.dto';
import { UpdateChauffeurDto } from './dto/update-chauffeur.dto';
import { Response } from 'express';
import * as fs from 'fs';
import * as ExcelJS from 'exceljs';
import * as chauffeurs from '../seed/data/chauffeur.json';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard, RolesGuard)
@Controller('chauffeurs')
export class ChauffeursController {
  constructor(private readonly chauffeursService: ChauffeursService) { }

  @Post("create")
  async create(
    @Body() createChauffeurDto: CreateChauffeurDto,
    @CurrentUser() user: any,
  ) {
    return await this.chauffeursService.create(createChauffeurDto, user?.sub);
  }

  @Get("find-all")
  async findAll(@Query() query, @CurrentUser() user: any) {
    return await this.chauffeursService.findAll(query, user);
  }

  @Get('/find/:id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.chauffeursService.findOne(id, user);
  }

  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updateChauffeurDto: UpdateChauffeurDto) {
    return this.chauffeursService.update(id, updateChauffeurDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chauffeursService.remove(id);
  }

  @Get('export')
  async exportExcel(@Res() res: Response, @Query('search') search: string) {
    const filePath = await this.chauffeursService.exportChauffeurToExcel({ search });
    res.download(filePath, 'chauffeurs.xlsx', (err) => {
      if (err) {
        console.error('خطأ أثناء تحميل الملف:', err);
      }
      fs.unlinkSync(filePath);
    });
  }

  @Get('export-stats')
  async exportStatsToExcel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const stats = await this.chauffeursService.getRegistrationStats(
      startDate,
      endDate,
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Registration System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('إحصائيات السائقين', {
      views: [{ rightToLeft: true }], // RTL layout for Arabic
    });

    // ===== Title row =====
    worksheet.mergeCells('A1:B1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `إحصائيات تسجيل السائقين من ${startDate} إلى ${endDate}`;
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F7A3D' }, // dark green (to distinguish from the operators sheet)
    };
    worksheet.getRow(1).height = 28;

    // Empty spacer row
    worksheet.getRow(2).height = 6;

    // ===== Header row =====
    worksheet.columns = [
      { key: 'date', width: 22 },
      { key: 'count', width: 22 },
    ];

    const headerRow = worksheet.getRow(3);
    headerRow.values = ['التاريخ', 'عدد المسجلين'];
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E9E5B' }, // medium green
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      };
    });
    headerRow.height = 22;

    // ===== Data rows =====
    let totalCount = 0;
    stats.forEach((item, index) => {
      const rowIndex = 4 + index;
      const row = worksheet.getRow(rowIndex);
      row.values = [item.date, item.count];
      totalCount += item.count;

      const isEven = index % 2 === 0;
      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Calibri', size: 11 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFEFF8F1' : 'FFFFFFFF' },
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        };
        if (colNumber === 2) {
          cell.font = { ...cell.font, bold: true, color: { argb: 'FF1F7A3D' } };
        }
      });
    });

    // ===== Total row =====
    const totalRowIndex = 4 + stats.length;
    const totalRow = worksheet.getRow(totalRowIndex);
    totalRow.values = ['الإجمالي', totalCount];
    totalRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F7A3D' },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      };
    });
    totalRow.height = 22;

    // Freeze header rows when scrolling
    worksheet.views = [
      { rightToLeft: true, state: 'frozen', ySplit: 3 },
    ];

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=registration_stats_${startDate}_to_${endDate}.xlsx`,
    );

    const buffer = await workbook.xlsx.writeBuffer();
    res.end(buffer);
  }

  @Post('import-chauffeur')
  async createVihc() {
    // const filePath = path.join(process.cwd(), 'src', 'import-operateur', 'data.json');

    // const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));    
    return await this.chauffeursService.importExcel(chauffeurs);
  }

  @Post('clear-chauffeurs')
  async clearChauffeurs() {
    return await this.chauffeursService.clearChauffeurs();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.chauffeursService.convertAndSaveToMongoDB(file);
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
