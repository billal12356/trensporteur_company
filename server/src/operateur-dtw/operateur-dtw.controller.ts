import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Res } from '@nestjs/common';
import { OperateurDtwService } from './operateur-dtw.service';
import { CreateOperateurDtwDto } from './dto/create-operateur-dtw.dto';
import { UpdateOperateurDtwDto } from './dto/update-operateur-dtw.dto';
import { AuthGuard } from 'src/common/gaurds/auth.guard';
import * as fs from 'fs';
import { Response } from 'express';
import { ExportFilterDto } from './dto/ExportFilter.dto';

@Controller('operateur-dtw')
export class OperateurDtwController {
  constructor(private readonly operateurDtwService: OperateurDtwService) {}

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


}
