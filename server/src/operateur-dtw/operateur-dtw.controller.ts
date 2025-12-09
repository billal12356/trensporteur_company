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
import { OperateurDtwService } from './operateur-dtw.service';
import { CreateOperateurDto } from './dto/create-operateur-dtw.dto';
import { UpdateOperateurDtwDto } from './dto/update-operateur-dtw.dto';
import { AuthGuard } from 'src/common/gaurds/auth.guard';
import * as fs from 'fs';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
@Controller('operateur-dtw')
export class OperateurDtwController {
  constructor(private readonly operateurDtwService: OperateurDtwService) { }

  @UseGuards(AuthGuard)
  @Post('create')
  async create(
    @Body() createOperateurDtwDto: CreateOperateurDto,
    @Res() res: Response,
  ) {
    const operateur = await this.operateurDtwService.create(
      createOperateurDtwDto,
      res,
    );
    return operateur;
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

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
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
    const worksheet = workbook.addWorksheet('إحصائيات المسجلين');

    worksheet.columns = [
      { header: 'التاريخ', key: 'date', width: 20 },
      { header: 'عدد المسجلين', key: 'count', width: 20 },
    ];

    worksheet.addRows(stats);

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
