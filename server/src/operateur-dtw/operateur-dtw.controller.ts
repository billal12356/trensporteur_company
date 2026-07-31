import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/gaurds/auth.guard';
import { RolesGuard } from 'src/common/gaurds/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { OperateurDtwService } from './operateur-dtw.service';
import { CreateOperateurDto } from './dto/create-operateur-dtw.dto';
import { UpdateOperateurDtwDto } from './dto/update-operateur-dtw.dto';
import { GeneratePermitPdfDto } from './dto/generate-permit-pdf.dto';
import * as fs from 'fs';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
@UseGuards(AuthGuard, RolesGuard)
@Controller('operateur-dtw')
export class OperateurDtwController {
  constructor(private readonly operateurDtwService: OperateurDtwService) { }

  @Post('create')
  async create(
    @Body() createOperateurDtwDto: CreateOperateurDto,
    @Res() res: Response,
    @CurrentUser() user: any,
  ) {
    const operateur = await this.operateurDtwService.create(
      createOperateurDtwDto,
      res,
      user?.sub,
    );
    return operateur;
  }

  @Get('find-all')
  findAll(@Query() query, @CurrentUser() user: any) {
    return this.operateurDtwService.findAll(query, user);
  }

  @Get('find/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.operateurDtwService.findOne(id, user);
  }

  @Get(':id/pdf')
  async generatePDF(
    @Param('id') id: string,
    @Query('vehicleIds') vehicleIds: string | string[],
    @Res() res: Response,
  ) {
    // Ensure vehicleIds is always an array
    const vehicleIdsArray = Array.isArray(vehicleIds)
      ? vehicleIds
      : vehicleIds
        ? vehicleIds.split(',')
        : [];

    const filePath = await this.operateurDtwService.generatePDF(
      id,
      vehicleIdsArray,
    );

    res.download(filePath);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOperateurDtwDto: UpdateOperateurDtwDto,
  ) {
    return this.operateurDtwService.update(id, updateOperateurDtwDto);
  }
  @Delete('removeAll')
  async removeAll() {
    return await this.operateurDtwService.removeAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.operateurDtwService.remove(id);
  }

  @Get('download')
  async downloadExcel(@Res() res: Response, @Query() filterDto: any) {
    const filePath =
      await this.operateurDtwService.exportUsersToExcel(filterDto);
    res.download(filePath, 'Operateurs.xlsx', (err) => {
      if (err) {
        console.error('خطأ أثناء تحميل الملف:', err);
      }
      fs.unlinkSync(filePath); // حذف الملف بعد التحميل
    });
  }

  @Get('export-stats')
  async exportStatsToExcel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const stats = await this.operateurDtwService.getRegistrationStats(
      startDate,
      endDate,
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Registration System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('إحصائيات المسجلين', {
      views: [{ rightToLeft: true }], // RTL layout for Arabic
    });

    // ===== Title row =====
    worksheet.mergeCells('A1:B1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `إحصائيات التسجيل من ${startDate} إلى ${endDate}`;
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E5395' }, // dark blue
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
        fgColor: { argb: 'FF4472C4' }, // medium blue
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
          fgColor: { argb: isEven ? 'FFF2F6FC' : 'FFFFFFFF' },
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        };
        if (colNumber === 2) {
          cell.font = { ...cell.font, bold: true, color: { argb: 'FF2E5395' } };
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
        fgColor: { argb: 'FF2E5395' },
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

  @Get('generate')
  generate(@Query('id') id: string, @Res() res: Response) {
    return this.operateurDtwService.generatepdfs(id, res);
  }

  @Get('generate-pdf')
  async generatepdf(@Query('id') id: string, @Res() res: Response) {
    return this.operateurDtwService.generatePdf(res, id);
  }
  // @Get('generate-pdf-created')
  // async generatePDFCreated(@Res() res: Response) {
  //   const filePath = await this.operateurDtwService.generatePDFCreated();
  //   res.download(filePath, 'Operateur-Static.pdf');
  // }

  // server/src/operateur-dtw/operateur-dtw.controller.ts

  @Post('generate-permit-pdf')
  async generatePermitPdf(
    @Body() dto: GeneratePermitPdfDto,
    @Res() res: Response,
  ) {
    return this.operateurDtwService.generatePermitPdf(
      res,
      dto,
    );
  }


  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Date.now() + extname(file.originalname);
          cb(null, randomName);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.operateurDtwService.convertAndSave(file);
  }

  @Post('clear-operateurs')
  async clearChauffeurs() {
    return await this.operateurDtwService.clearOperateur();
  }
}
