import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Response } from 'express';
import * as fs from 'fs';
import * as ExcelJS from 'exceljs';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) { }

  @Post('create')
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    return await this.vehiclesService.create(createVehicleDto);
  }

  @Get("find-all")
  async findAll(@Query() query) {
    return await this.vehiclesService.findAll(query);
  }

  @Get('find/:id')
  async findOne(@Param('id') id: string) {
    return await this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return await this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.vehiclesService.remove(id);
  }

  @Get('export')
  async exportExcel(@Res() res: Response, @Query('search') search: string) {
    const filePath = await this.vehiclesService.exportVihiculeToExcel(search);
    res.download(filePath, 'vihicules.xlsx', (err) => {
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
    const stats = await this.vehiclesService.getRegistrationStats(startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('إحصائيات المركبات');

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
