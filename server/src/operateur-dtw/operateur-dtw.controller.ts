import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Res } from '@nestjs/common';
import { OperateurDtwService } from './operateur-dtw.service';
import { CreateOperateurDtwDto } from './dto/create-operateur-dtw.dto';
import { UpdateOperateurDtwDto } from './dto/update-operateur-dtw.dto';
import { AuthGuard } from 'src/common/gaurds/auth.guard';
import * as fs from 'fs';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
@Controller('operateur-dtw')
export class OperateurDtwController {
  constructor(private readonly operateurDtwService: OperateurDtwService) { }

  @UseGuards(AuthGuard)
  @Post('create')
  create(@Body() createOperateurDtwDto: CreateOperateurDtwDto) {
    return this.operateurDtwService.create(createOperateurDtwDto);
  }

  @UseGuards(AuthGuard)
  @Get('find-all')
  findAll(@Query() query) {
    return this.operateurDtwService.findAll(query);
  }

  @UseGuards(AuthGuard)
  @Get('find/:id')
  findOne(@Param('id') id: string) {
    return this.operateurDtwService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOperateurDtwDto: UpdateOperateurDtwDto) {
    return this.operateurDtwService.update(id, updateOperateurDtwDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.operateurDtwService.remove(id);
  }

  @Get('download')
  async downloadExcel(@Res() res: Response, @Query() filterDto: any) {
    const filePath = await this.operateurDtwService.exportUsersToExcel(filterDto);
    res.download(filePath, 'Operateurs.xlsx', (err) => {
      if (err) {
        console.error('خطأ أثناء تحميل الملف:', err);
      }
      fs.unlinkSync(filePath); // حذف الملف بعد التحميل
    });
  }

  @Get("export-stats")
  async exportStatsToExcel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response
  ) {
    const stats = await this.operateurDtwService.getRegistrationStats(startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('إحصائيات المسجلين');

    worksheet.columns = [
      { header: 'التاريخ', key: 'date', width: 20 },
      { header: 'عدد المسجلين', key: 'count', width: 20 },
    ];

    worksheet.addRows(stats);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=registration_stats_${startDate}_to_${endDate}.xlsx`
    );

    const buffer = await workbook.xlsx.writeBuffer();
    res.end(buffer);
  }


  

}
