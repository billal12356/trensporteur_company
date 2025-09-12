import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVihicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Vihicles } from './vihicles.schema';
import { Model, Types } from 'mongoose';
import { OperateurDtwService } from 'src/operateur-dtw/operateur-dtw.service';
import { ResponseBuilder } from 'src/common/builder/response.builder';
import { Buffer } from 'buffer';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { Workbook } from 'exceljs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ruralCoordinates } from 'src/constants/rural-coordinates';
const fontkit = require('@pdf-lib/fontkit');
import { getVisualString } from 'bidi-js';
const arabicReshaper = require('arabic-reshaper');
import * as ExcelJS from 'exceljs';
import { VihiclesQueryBuilder } from 'src/common/builder/VihiclesQueryBuilder';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vihicles.name) private VihicileModel: Model<Vihicles>,
    @Inject(forwardRef(() => OperateurDtwService))
    private readonly operateurService: OperateurDtwService,
  ) {}

  async create(createVehicleDto: CreateVihicleDto) {
    const { num_docier_client, fullName_arabe, fullName_francais, num_bus_registration } = createVehicleDto
    const operateurNum = await this.operateurService.findByVihicilesandChauffer({ num_docier_client })
    const MatriculeVihicule = await this.VihicileModel.findOne({ num_bus_registration })

    const fulNameWhenMatriculeExist = MatriculeVihicule.fullName_arabe;
    const MatriculeWhenMatriculeExist = MatriculeVihicule.fullName_arabe;
    const TypeWhenMatriculeExist = MatriculeVihicule.font_type;
    // if (!operateurNum) {
    //   throw new NotFoundException(
    //     new ResponseBuilder()
    //       .setStatus(404)
    //       .setMessage(`لم يتم العثور على ملف المتعامل  بهذا الرقم ${num_docier_client}`)
    //       .setErrors({ _id: 'Operator not found' })
    //       .build(),
    //   );
    // }

    let lastReturn = []
    lastReturn.push({ fulNameWhenMatriculeExist, MatriculeWhenMatriculeExist, TypeWhenMatriculeExist })
    if (MatriculeVihicule) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage('المركبة مسجلة من قبل')
          .setErrors('المركبة مسجلة من قبل')
          .setData(lastReturn)
          .build(),
      );
    }


    if (operateurNum.fullName_arabe !== fullName_arabe) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على  ${fullName_arabe}`)
          .setErrors({ _id: 'Operator not found' })
          .build(),
      );
    }

    if (operateurNum.fullName_francais !== fullName_francais) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على  ${fullName_francais}`)
          .setErrors({ _id: 'Operator not found' })
          .build(),
      );
    }

    const vihicile = await this.VihicileModel.create(createVehicleDto);
    return new ResponseBuilder()
      .setStatus(201)
      .setMessage('تم تسجيل المركبة بنجاح')
      .setData(vihicile)
      .build();
  }

  async findAll(params: any) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;

    const queryBuilder = new VihiclesQueryBuilder()
      .setLimit(limit)
      .setSkip(page)
      .setSort(params.sort || 'asc')
      .setSearch(params.search);

    const { query, limit: finalLimit, skip, sort } = queryBuilder.build();

    const data = await this.VihicileModel.find(query)
      .limit(finalLimit)
      .skip(skip)
      .sort(sort)
      .exec();

    const total = await this.VihicileModel.countDocuments(query).exec();

    return {
      total,
      limit: finalLimit,
      page,
      data,
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        new ResponseBuilder()
          .setStatus(400)
          .setMessage(`المعرف ${id} غير صالح`)
          .setErrors({ _id: 'Invalid ObjectId format' })
          .build(),
      );
    }

    const vihicile = await this.VihicileModel.findOne({ _id: id });

    if (!vihicile) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على المشغل ذو المعرف #${id}`)
          .setErrors({ _id: 'Operator not found' })
          .build(),
      );
    }
    return vihicile;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        new ResponseBuilder()
          .setStatus(400)
          .setMessage(`المعرف ${id} غير صالح`)
          .setErrors({ _id: 'Invalid ObjectId format' })
          .build(),
      );
    }

    const vihicile = await this.VihicileModel.findByIdAndUpdate(
      id,
      { $set: updateVehicleDto },
      {
        new: true,
        runValidators: true,
      },
    ).exec();

    if (!vihicile) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على المشغل ذو المعرف #${id}`)
          .setErrors({ _id: 'Operator not found' })
          .build(),
      );
    }

    return new ResponseBuilder()
      .setStatus(200)
      .setMessage('تم تحديث المشغل بنجاح!')
      .setData(vihicile)
      .build();
  }

  async remove(id: string) {
    const operateur = await this.VihicileModel.findByIdAndDelete(id);

    if (!operateur) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على المشغل ذو المعرف #${id}`)
          .setErrors({ _id: 'User not found' })
          .build(),
      );
    }

    return new ResponseBuilder()
      .setStatus(200)
      .setMessage('تم حذف المشغل بنجاح!')
      .build();
  }

  async exportVihiculeToExcel(filterDto: any): Promise<string> {
    const query: any = {};
    console.log(filterDto);

    const search = filterDto?.search?.trim?.();
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { fullName_arabe: searchRegex },
        { fullName_francais: searchRegex },
      ];
    }

    const vihicule = await this.VihicileModel.find(query).lean();
    console.log(vihicule);

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('المركبة');

    const exportDir = join(__dirname, '..', 'exports/vihicules');
    if (!existsSync(exportDir)) {
      mkdirSync(exportDir, { recursive: true });
    }

    const filePath = join(exportDir, 'Vihicules.xlsx');

    const titleRow = worksheet.addRow(['قائمة المركبة']);
    worksheet.addRow([]);
    worksheet.mergeCells('A1:F1');
    titleRow.getCell(1).font = {
      bold: true,
      size: 16,
      color: { argb: 'FFFFFF' },
    };
    titleRow.getCell(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    titleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1F4E78' },
    };

    const headerRow = worksheet.addRow([
      'المعرف (ID)',
      'رقم الولاية',
      'رقم ملف المتعامل في سجل الناقلين',
      'اسم ولقب المتعامل (بالعربية)',
      'اسم ولقب المتعامل (بالفرنسية)',
      'النشاط',
      'العمود 1',
      'طبيعة النشاط',
      'العمود 2',
      'حالة النشاط',
      'العمود 3',
      'رقم تسجيل الحافلة او الشاحنة',
      'الدائرة',
      'البلدية',
      'الطراز',
      'الصنف',
      'النوع',
      'اول سنة استعمال',
      'عدد المقاعد',
      'الطاقة',
      'رقم رخصة سير المركبة',
      'تاريخ رخصة السير',
      'مدة صلاحية الرخصة',
      'تاريخ بداية نشاط الخط',
      'تاريخ بداية نشاط المركبة',
      'نوع الخط',
      'العمود 4',
      'رمز الخط',
      'نقطة الانطلاق',
      'نقطة الوصول',
      'نقطة المرور 1',
      'نقطة المرور 2',
      'نقطة المرور 3',
      'نقطة المرور 4',
      'نقطة المرور 5',
      'توقيت بداية الخط',
      'توقيت نهاية الخدمة',
      'الوتيرة بالدقائق بالنسبة للحضري',
      'تاريخ الانطلاق 1',
      'تاريخ الانطلاق 2',
      'تاريخ الانطلاق 3',
      'تاريخ الانطلاق 4',
      ' المركبة (متوقفة أم لا)',
      'نوع التوقف',
      'تاريخ التوقف',
      'تاريخ نهاية توقيف مؤقت',
      'ملاحظات',
      'المعني بالتحديث',
      'ملاحظات رئيس المصلحة',
      'المسار',
    ]);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0070C0' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    let id = 1;
    vihicule.forEach((op) => {
      const row = worksheet.addRow([
        id++,
        op.num_wilaya,
        op.num_docier_client,
        op.fullName_arabe,
        op.fullName_francais,
        op.activite,
        op.colonne1 || '/',
        op.nature_activite,
        op.colonne2 || '/',
        op.status_activite,
        op.colonne3 || '/',
        op.num_bus_registration,
        op.circle,
        op.Municipality,
        op.Style,
        op.category,
        op.type,
        op.First_year_of_use,
        op.Number_of_seats,
        op.Energy,
        op.num_driving_license,
        op.driving_license_history,
        op.driving_license_dure,
        op.line_activity_start_date,
        op.Vehicle_activity_start_date,
        op.font_type,
        op.colonne4,
        op.font_symbol,
        op.point_depart,
        op.point_arrive,
        op.point_Traffic1,
        op.point_Traffic2,
        op.point_Traffic3,
        op.point_Traffic4,
        op.point_Traffic5,
        op.line_start_time,
        op.line_end_time,
        op.Pace_per_minute,
        op.time_depart1,
        op.time_depart2,
        op.time_depart3,
        op.time_depart4,
        op.vihicile_parked,
        op.type_parked,
        op.hestoire_parked,
        op.hestoire_parked_end,
        op.comments,
        op.person_concerned,
        op.note_chef_departement,
        op.path,
      ]);

      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    worksheet.columns.forEach((column) => {
      column.width = 30;
    });

    worksheet.autoFilter = {
      from: { row: 2, column: 1 },
      to: { row: worksheet.rowCount, column: headerRow.cellCount },
    };

    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  async getRegistrationStats(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59);
    const data = await this.VihicileModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    console.log(data);

    return data.map((item) => ({
      date: item._id,
      count: item.count,
    }));
  }

  async findVihiculeByOperateur(num_docier_client: number) {
    const vihicule = await this.VihicileModel.find({
      num_docier_client,
    }).exec();
    return vihicule;
  }

  async findVihiculeByNumBus(query: Record<string, any>) {
    console.log(query);

    const find = await this.VihicileModel.findOne({
      num_bus_registration: query.num_vehicule,
    });
    console.log(find);

    return find;
  }

  importExcel(filePath: any[]): Promise<void> {
    return new Promise((resolve) => {
      const saveNext = (index: number) => {
        if (index >= filePath.length) {
          console.log('✅ تم استيراد جميع المركبات بنجاح!');
          return resolve();
        }

        const rawData = filePath[index];
        console.log('🚐 Vihicle Row:', rawData);

        const cleanedData = {
          ...rawData,
          Vehicle_activity_start_date: rawData.Vehicle_activity_start_date
            ? new Date(rawData.Vehicle_activity_start_date)
            : null,
          driving_license_history: rawData.driving_license_history
            ? new Date(rawData.driving_license_history)
            : null,
          line_activity_start_date: rawData.line_activity_start_date
            ? new Date(rawData.line_activity_start_date)
            : null,
          hestoire_parked: rawData.hestoire_parked
            ? new Date(rawData.hestoire_parked)
            : null,
          hestoire_parked_end: rawData.hestoire_parked_end
            ? new Date(rawData.hestoire_parked_end)
            : null,
        };

        const doc = new this.VihicileModel(cleanedData);
        doc
          .save()
          .then(() => saveNext(index + 1))
          .catch((error) => {
            console.error(
              `❌ خطأ أثناء الحفظ في السطر ${index + 1}:`,
              error.message,
            );
            saveNext(index + 1); // تابع رغم الخطأ
          });
      };

      saveNext(0);
    });
  }

  async searchByLineCode(lineCode: string) {
    console.log('lineCode', lineCode);
    const lines = await this.VihicileModel.find({
      font_symbol: lineCode,
    }).exec();
    if (!lines || lines.length === 0) {
      throw new NotFoundException(
        `Transport line with code ${lineCode} not found`,
      );
    }
    return lines;
  }

  async exportToExcel(lineCode: string): Promise<Buffer> {
    const vehicles = await this.searchByLineCode(lineCode);


    function formatDate(
      dateInput: Date | string | number,
      reverse: boolean = false,
    ): string {
      const date = new Date(dateInput);

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();

      const formattedDate = `${day}/${month}/${year}`;

      return reverse
        ? formattedDate.split('').reverse().join('')
        : formattedDate;
    }

    if (!vehicles || vehicles.length === 0) {
      throw new NotFoundException(
        `Transport line with code ${lineCode} not found`,
      );
    }

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Transport Line Report');
    worksheet.views = [{ rightToLeft: true }];

    const headerFont = { name: 'Arial', size: 12, bold: true };
    const headerFontLine = { name: 'Arial', size: 20, bold: true };
    const headerAlignment: Partial<ExcelJS.Alignment> = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    const headerAligns: Partial<ExcelJS.Alignment> = {
      horizontal: 'left',
      vertical: 'middle',
      wrapText: true,
    };
    const cellBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    // رؤوس الجمهورية
    worksheet.mergeCells('C1:G1');
    const cellC1 = worksheet.getCell('C1');
    cellC1.value = 'الجمهورية الجزائرية الديمقراطية الشعبية';
    cellC1.alignment = headerAlignment;
    cellC1.font = headerFont;

    worksheet.mergeCells('G5:H5');
    const cellG5 = worksheet.getCell('G5');
    cellG5.value = `عين الدفلى في:${formatDate(Date.now(), true)}`;
    cellG5.alignment = headerAlignment;

    worksheet.mergeCells('A3:C3');
    const cellA3 = worksheet.getCell('A3');
    cellA3.value = 'وزارة النقل';
    cellA3.alignment = headerAligns;

    worksheet.mergeCells('A4:C4');
    const cellA4 = worksheet.getCell('A4');
    cellA4.value = 'مديرية النقل لولاية عين الدفلى';
    cellA4.alignment = headerAligns;

    worksheet.mergeCells('A5:C5');
    const cellA5 = worksheet.getCell('A5');
    cellA5.value = 'مصلحة النقل البري';
    cellA5.alignment = headerAligns;

    worksheet.mergeCells('A6:C6');
    const cellA6 = worksheet.getCell('A6');
    cellA6.value = 'مكتب نقل المسافرين';
    cellA6.alignment = headerAligns;

    // بيانات الخط
    worksheet.mergeCells('F8:G8');
    const cellF8 = worksheet.getCell('F8');
    cellF8.value = 'الخميس - الشلف';
    cellF8.alignment = headerAlignment;

    worksheet.mergeCells('C8:D8');
    const cellC81 = worksheet.getCell('C8');
    cellC81.value = `الخط المستغل: `;
    cellC81.font = headerFontLine;
    cellC81.alignment = headerAlignment;

    worksheet.mergeCells('F9:G9');
    const cellF9 = worksheet.getCell('F9');
    cellF9.value = `${vehicles[0]?.font_symbol ?? ''}`;
    cellF9.font = headerFont;
    cellF9.alignment = headerAlignment;

    // رؤوس الجدول
    const startRow = 11;
    const row1 = worksheet.getRow(startRow);
    const row2 = worksheet.getRow(startRow + 1);

    row1.getCell(1).value = 'الرقم';
    row1.getCell(2).value = 'ملف';
    row1.getCell(3).value = 'اللقب و الإسم أو إسم الشركة';
    worksheet.mergeCells(`D${startRow}:E${startRow}`);
    worksheet.getCell(`D${startRow}`).value = 'التوقيت';
    row1.getCell(6).value = 'رقم تسجيل المركبة';
    row1.getCell(7).value = 'المقاعد';
    row1.getCell(8).value = 'الملاحظة';

    row2.getCell(4).value = 'الذهاب          الاياب ';
    row2.getCell(5).value = 'الذهاب          الاياب ';
    row2.getCell(4).alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    row2.getCell(5).alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };

    for (let i = 1; i <= 8; i++) {
      row1.getCell(i).font = headerFont;
      row1.getCell(i).alignment = headerAlignment;
      row1.getCell(i).border = cellBorder;

      if (i >= 4 && i <= 5) {
        row2.getCell(i).font = headerFont;
        row2.getCell(i).alignment = headerAlignment;
        row2.getCell(i).border = cellBorder;
      }
    }

    // بيانات المركبات
    vehicles.forEach((vehicle, index) => {
      const rowIndex = startRow + 2 + index;
      const row = worksheet.getRow(rowIndex);
      row.getCell(1).value = index + 1;
      row.getCell(2).value = vehicle.num_docier_client ?? '';
      row.getCell(3).value = vehicle.fullName_arabe ?? '';
      const go1 = Array.isArray(vehicle.time_depart1)
        ? (vehicle.time_depart1 ?? '')
        : (vehicle.time_depart1 ?? '');
      const go2 = Array.isArray(vehicle.time_depart2)
        ? (vehicle.time_depart2 ?? '')
        : (vehicle.time_depart2 ?? '');
      const return1 = Array.isArray(vehicle.time_depart3)
        ? (vehicle.time_depart3 ?? '')
        : (vehicle.time_depart3 ?? '');
      const return2 = Array.isArray(vehicle.time_depart4)
        ? (vehicle.time_depart4 ?? '')
        : (vehicle.time_depart4 ?? '');

      // تنسيق التوقيت بدقة
      row.getCell(4).value = `${go2.padEnd(6, '     ')} ${go1}`;
      row.getCell(5).value = `${return2.padEnd(6, '     ')} ${return1}`;
      row.getCell(6).value = vehicle.num_bus_registration ?? '';
      row.getCell(7).value = vehicle.Number_of_seats ?? '';
      row.getCell(8).value = vehicle.note_chef_departement ?? '';

      row.eachCell((cell) => {
        cell.alignment = headerAlignment;
        cell.border = cellBorder;
      });

      row.commit();
    });

    const totalSeats = vehicles.reduce(
      (total, vehicle) => total + vehicle.Number_of_seats,
      0,
    );

    // مجموع المقاعد
    const totalRowIndex = startRow + 2 + vehicles.length;

    // دمج الخلايا من A إلى H
    worksheet.mergeCells(`A${totalRowIndex}:H${totalRowIndex}`);

    // خلية المجموع + الخط
    const mergedCell = worksheet.getCell(`A${totalRowIndex}`);
    mergedCell.value = `خط : ${vehicles.length}                                                                                                                                                                  مجموع المقاعد: ${totalSeats} `;
    mergedCell.font = headerFont;
    mergedCell.alignment = headerAlignment;
    mergedCell.border = cellBorder;

    // عرض الأعمدة
    worksheet.columns = [
      { width: 6 },
      { width: 10 },
      { width: 30 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 10 },
      { width: 30 },
    ];

    // توسيط وتحديد الحدود لكل الخلايا
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = headerAlignment;
      });
    });

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
