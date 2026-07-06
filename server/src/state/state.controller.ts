import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/gaurds/auth.guard';
import { RolesGuard } from 'src/common/gaurds/roles.guard';
import { StateService } from './state.service';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { Response } from 'express';
import * as fs from 'fs';

@UseGuards(AuthGuard, RolesGuard)
@Controller('state')
export class StateController {
  constructor(private readonly stateService: StateService) { }

  @Get('all')
  getAllStats() {
    return this.stateService.getAllStats();
  }

  @Get('statsInterCommunal')
  async getInterCommunal(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return await this.stateService.getInter_communal(start, end);
  }
  @Get('statsInterWilaya')
  async getInter_wilaya(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return await this.stateService.getInter_wilaya(start, end);
  }


  @Get('statsInterRural')
  async getInter_rural(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return await this.stateService.getInter_rural(start, end);
  }

  @Get('statsInterUrbain')
  async getInter_urbain(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return await this.stateService.getInter_urbain(start, end);
  }


  @Get('statsInterScolaire')
  async getInter_scolaire(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return await this.stateService.getInter_scolaire(start, end);
  }

  @Get('transportTravailleurs')
  async transport_travailleurs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return await this.stateService.transport_travailleurs(start, end);
  }


  @Get('statistique-annee')
  async statistiqueAnnee(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!startDate || !endDate) {
      return this.stateService.statistiqueAnnee(undefined, undefined);
    }

    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setUTCHours(0, 0, 0, 0);
    end.setUTCDate(end.getUTCDate() + 1);

    return this.stateService.statistiqueAnnee(start, end);
  }



  @Get('stats-compt')
  async getStats() {
    return this.stateService.getVehicleStats();
  }

  // ======================= Canevas n°01 =======================

  @Get('canevas-transport')
  async getCanevasTransport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('wilaya') wilaya?: string,
    @Query('annee') annee?: string,
    @Query('trimestre') trimestre?: string,
  ) {
    let start: Date | undefined;
    let end: Date | undefined;
    if (startDate && endDate) {
      start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setUTCHours(0, 0, 0, 0);
      end.setUTCDate(end.getUTCDate() + 1);
    }
    return this.stateService.getCanevasTransport(start, end, wilaya, annee, trimestre);
  }

  @Get('canevas-transport/export')
  async exportCanevasExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('wilaya') wilaya?: string,
    @Query('annee') annee?: string,
    @Query('trimestre') trimestre?: string,
  ) {
    let start: Date | undefined;
    let end: Date | undefined;
    if (startDate && endDate) {
      start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setUTCHours(0, 0, 0, 0);
      end.setUTCDate(end.getUTCDate() + 1);
    }
    const workbook = await this.stateService.exportCanevasExcel(start, end, wilaya, annee, trimestre);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="statistique DTRL final.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  }

}
