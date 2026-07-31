import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  NotFoundException,
  HttpStatus,
  UseInterceptors,
  HttpException,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/gaurds/auth.guard';
import { RolesGuard } from 'src/common/gaurds/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { VehiclesService } from './vehicles.service';
import { CreateVihicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Response } from 'express';
import * as fs from 'fs';
import * as ExcelJS from 'exceljs';
import * as vihicules from '../seed/data/vihicule.json';
import { ExportLineDto } from './dto/line.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard, RolesGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) { }

  @Post('create')
  async create(
    @Body() createVehicleDto: CreateVihicleDto,
    @CurrentUser() user: any,
  ) {
    return await this.vehiclesService.create(createVehicleDto, user?.sub);
  }

  @Get('find-all')
  async findAll(@Query() query, @CurrentUser() user: any) {
    return await this.vehiclesService.findAll(query, user);
  }

  @Get('find/:id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.vehiclesService.findOne(id, user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return await this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.vehiclesService.remove(id);
  }

  @Get('export')
  async s(@Res() res: Response, @Query('search') search: string) {
    const filePath = await this.vehiclesService.exportVihiculeToExcel({ search });
    res.download(filePath, 'vihicules.xlsx', (err) => {
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
    const stats = await this.vehiclesService.getRegistrationStats(
      startDate,
      endDate,
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Registration System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('إحصائيات المركبات', {
      views: [{ rightToLeft: true }], // RTL layout for Arabic
    });

    // ===== Title row =====
    worksheet.mergeCells('A1:B1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `إحصائيات تسجيل المركبات من ${startDate} إلى ${endDate}`;
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFB35C00' }, // dark amber
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
        fgColor: { argb: 'FFE08E00' }, // medium amber
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
          fgColor: { argb: isEven ? 'FFFCF1E0' : 'FFFFFFFF' },
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        };
        if (colNumber === 2) {
          cell.font = { ...cell.font, bold: true, color: { argb: 'FFB35C00' } };
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
        fgColor: { argb: 'FFB35C00' },
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

  @Post('import-vihicule')
  async createVihc() {
    // const filePath = path.join(process.cwd(), 'src', 'import-operateur', 'data.json');
    // const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return await this.vehiclesService.importJson(vihicules);
  }

  @Post('export-line')
  async exportLine(
    exportDto: ExportLineDto,
    @Query('search') search: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.vehiclesService.exportToExcel(search);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=transport-line-${search}.xlsx`,
      );

      const result = res.end(buffer);
      console.log(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error exporting data',
        error: error.message,
      });
    }
  }

  @Get('exportHadari')
  async exportExcels(@Res() res: Response) {
    const buffer = await this.vehiclesService.exportUrbanTransportExcel();

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=transporter_Hadari.xlsx',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.end(buffer);
  }

  @Get('exportBalady')
  async exportExcel(@Res() res: Response) {
    const buffer = await this.vehiclesService.exportBaladyExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=balady.xlsx');
    res.send(buffer);
  }
  @Get('exportRifi')
  async exportExcelRifi(@Res() res: Response) {
    const buffer = await this.vehiclesService.exportRifiExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=transporter_Rifi.xlsx');
    res.send(buffer);
  }
  @Get('exportWilay')
  async exportExcelWilay(@Res() res: Response) {
    const buffer = await this.vehiclesService.exportExcelWilay();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=transporter_Wilay.xlsx');
    res.send(buffer);
  }

  @Post('clear-vehicles')
  async clearVehicles() {
    return await this.vehiclesService.clearVehicles();
  }

  @Post('upload-vehicle')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.vehiclesService.convertAndSaveToMongoDB(file);

      return {
        success: true,
        message: 'تم تحويل وحفظ ملف Excel بنجاح في MongoDB',
        savedRecords: result.savedCount,
        failedRecords: result.failedCount,
        totalProcessed: result.totalProcessed,
        jsonFilePath: result.jsonPath,
        errors: result.errors,
      };
    } catch (error) {
      throw new HttpException(
        `خطأ في تحويل Excel: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  @Post('add-field')
  async addFieldToVehicles() {
    return await this.vehiclesService.addFieldToVehicles();
  }

  @Get('by-font-symbol/:font_symbol')
  async getByFontSymbol(@Param('font_symbol') fontSymbol: string) {
    return this.vehiclesService.findByFontSymbol(fontSymbol);
  }



}
