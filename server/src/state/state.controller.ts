import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StateService } from './state.service';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';

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



}
