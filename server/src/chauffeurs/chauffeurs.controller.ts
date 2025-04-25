import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { ChauffeursService } from './chauffeurs.service';
import { CreateChauffeurDto } from './dto/create-chauffeur.dto';
import { UpdateChauffeurDto } from './dto/update-chauffeur.dto';
import { Response } from 'express';
import * as fs from 'fs';
import * as ExcelJS from 'exceljs';

@Controller('chauffeurs')
export class ChauffeursController {
  constructor(private readonly chauffeursService: ChauffeursService) { }

  @Post("create")
  async create(@Body() createChauffeurDto: CreateChauffeurDto) {
    return await this.chauffeursService.create(createChauffeurDto);
  }

  @Get("find-all")
  async findAll(@Query() query) {
    return await this.chauffeursService.findAll(query);
  }

  @Get('/find/:id')
  async findOne(@Param('id') id: string) {
    return await this.chauffeursService.findOne(id);
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
    const filePath = await this.chauffeursService.exportChauffeurToExcel(search);
    res.download(filePath, 'chauffeurs.xlsx', (err) => {
      if (err) {
        console.error('خطأ أثناء تحميل الملف:', err);
      }
      fs.unlinkSync(filePath);
    });
  }

  @Get("export-stats")
  async exportStatsToExcel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response
  ) {
    const stats = await this.chauffeursService.getRegistrationStats(startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('إحصائيات السائقين');

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
