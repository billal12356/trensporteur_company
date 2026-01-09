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
import path, { join } from 'path';
import { Workbook } from 'exceljs';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import { VihiclesQueryBuilder } from 'src/common/builder/VihiclesQueryBuilder';



@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vihicles.name) private VihicileModel: Model<Vihicles>,
    @Inject(forwardRef(() => OperateurDtwService))
    private readonly operateurService: OperateurDtwService,
  ) { }
  private normalizeVihicileParked(val: any): string | undefined {
    if (!val) return undefined;
    const v = String(val).trim();

    if (['نعم', 'yes', 'oui', '1', 'true'].includes(v)) return 'موقفة';
    if (['لا', 'no', 'non', '0', 'false'].includes(v)) return 'لا';

    return undefined;
  }

  async create(createVehicleDto: CreateVihicleDto) {
    const {
      num_docier_client,
      fullName_arabe,
      fullName_francais,
      num_bus_registration,
    } = createVehicleDto;

    // 🔹 Check if operator exists
    const operateurNum = await this.operateurService.findByVihicilesandChauffer({
      num_docier_client,
    });



    if (!operateurNum) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على ملف المتعامل بهذا الرقم ${num_docier_client}`)
          .setErrors({ _id: 'Operator not found' })
          .build(),
      );
    }

    // 🔹 Check if vehicle already exists
    const existingVehicle = await this.VihicileModel.findOne({
      num_bus_registration,
    });

    if (existingVehicle) {
      const vehicleInfo = {
        fullName_arabe: existingVehicle.fullName_arabe,
        matricule: existingVehicle.num_bus_registration,
        font_type: existingVehicle.font_type,
      };

      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(409)
          .setMessage('المركبة مسجلة من قبل')
          .setErrors('المركبة مسجلة من قبل')
          .setData(vehicleInfo)
          .build(),
      );
    }

    // 🔹 Validate operator’s Arabic name
    if (operateurNum.fullName_arabe !== fullName_arabe) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`اسم المتعامل بالعربية غير مطابق: ${fullName_arabe}`)
          .setErrors({ name: 'Arabic name mismatch' })
          .build(),
      );
    }

    // 🔹 Validate operator’s French name
    if (operateurNum.fullName_francais !== fullName_francais) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`اسم المتعامل بالفرنسية غير مطابق: ${fullName_francais}`)
          .setErrors({ name: 'French name mismatch' })
          .build(),
      );
    }

    // 🔹 Create new vehicle
    const vehicle = await this.VihicileModel.create(createVehicleDto);

    return new ResponseBuilder()
      .setStatus(201)
      .setMessage('تم تسجيل المركبة بنجاح')
      .setData(vehicle)
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

    // Get the existing vehicle first
    const existingVehicle = await this.VihicileModel.findById(id).exec();
    if (!existingVehicle) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على المشغل ذو المعرف #${id}`)
          .setErrors({ _id: 'Operator not found' })
          .build(),
      );
    }

    // Check if num_matricule is being updated
    let updateData: any = { $set: updateVehicleDto };
    if (
      updateVehicleDto.num_bus_registration &&
      updateVehicleDto.num_bus_registration !== existingVehicle.num_bus_registration
    ) {
      // increment num_up if num_matricule has changed
      updateData.$inc = { num_up: 1 };
    }
    await this.VihicileModel.updateMany(
      { num_up: { $exists: false } },
      { $set: { num_up: 0 } }
    );


    const updatedVehicle = await this.VihicileModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    ).exec();

    console.log("updatedVehicle", updatedVehicle)

    return new ResponseBuilder()
      .setStatus(200)
      .setMessage('تم تحديث المشغل بنجاح!')
      .setData(updatedVehicle)
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
    // Extract and sanitize search term
    const search = filterDto?.search ? String(filterDto.search).trim() : null;

    const qb = new VihiclesQueryBuilder()
      .setSearch(search)
      .build();

    console.log('📊 Export Vehicles - Search term:', search || '(empty - showing all records)');
    console.log('📋 Generated Query:', JSON.stringify(qb.query));

    const vihicule = await this.VihicileModel.find(qb.query).lean();

    console.log(`✅ Found ${vihicule.length} vehicles matching criteria`);

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

  // ================= Get Registration Stats =================
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

  // ================= Find Vihicule By Operateur =================
  async findVihiculeByOperateur(num_docier_client: number) {
    const vihicule = await this.VihicileModel.find({
      num_docier_client,
    }).exec();
    return vihicule;
  }

  // ================= Find Vihicule By Num Bus Registration =================
  async findVihiculeByNumBus(query: Record<string, any>) {
    console.log(query);

    const find = await this.VihicileModel.findOne({
      num_bus_registration: query.num_vehicule,
    });
    console.log(find);

    return find;
  }

  // ================ Import From JSON =================
  async importJson(data: any[]) {
    const docs: any[] = [];
    const failed: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const raw = data[i];

      try {
        // ✅ DEFAULT VALUE FOR num_bus_registration
        const numBusRegistration =
          raw.num_bus_registration && raw.num_bus_registration.toString().trim() !== ''
            ? raw.num_bus_registration
            : `UNKNOWN-ROW-${i + 1}`;

        docs.push({
          ...raw,

          num_bus_registration: numBusRegistration, // 👈 هنا الحل

          num_driving_license: raw.num_driving_license ?? 0,

          Vehicle_activity_start_date: raw.Vehicle_activity_start_date
            ? new Date(raw.Vehicle_activity_start_date)
            : new Date(),

          colonne4: raw.colonne4 ?? 'N/A',
          font_symbol: raw.font_symbol ?? '',
          point_depart: raw.point_depart ?? 'غير محدد',
          point_arrive: raw.point_arrive ?? 'غير محدد',

          vihicile_parked: this.normalizeVihicileParked(raw.vihicile_parked),

          type_parked:
            ['مؤقت', 'نهائي'].includes(raw.type_parked)
              ? raw.type_parked
              : undefined,

          __rowIndex: i + 1, // 👈 مهم جدًا
        });

      } catch (e: any) {
        failed.push({
          row: i + 1,
          reason: e.message,
        });
      }
    }

    // ================= Insert =================
    try {
      const result = await this.VihicileModel.insertMany(docs, {
        ordered: false,
      });

      return {
        total: data.length,
        inserted: result.length,
        failed: failed.length,
        failedDetails: failed,
      };

    } catch (e: any) {
      if (e.writeErrors) {
        e.writeErrors.forEach((err: any) => {
          const doc = docs[err.index];

          let reason = 'خطأ غير معروف';

          if (err.code === 11000) {
            reason = 'رقم تسجيل الحافلة مكرر';
          } else if (err.errmsg) {
            reason = err.errmsg;
          }

          failed.push({
            row: doc.__rowIndex,
            reason,
          });
        });
      }

      return {
        total: data.length,
        inserted: e.insertedDocs?.length ?? 0,
        failed: failed.length,
        failedDetails: failed,
      };
    }
  }




  // ================= Search By Line Code =================
  async searchByLineCode(lineCode: string) {
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

  // ================= Export To Excel =================
  async exportToExcel(lineCode: string): Promise<Buffer> {
    const vehicles = await this.searchByLineCode(lineCode);
    console.log("vehicles ", vehicles);

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

  // ================= Export Urban Transport Excel =================
  async exportUrbanTransportExcel(): Promise<Buffer> {
    const data = await this.VihicileModel.find({
      font_type: 'حضري او شبه حضري',
    }).lean();

    // دالة تجيب عدد المتعاملين
    const operateur = async (num_client: number) => {
      const op =
        await this.operateurService.findOperateurByNumClient(num_client);
      return op.length;
    };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('النقل الحضري');

    // 🟦 1) إضافة العنوان مع "padding" عبر ارتفاع الصف
    worksheet.mergeCells('A1:N2'); // ياخذ صفّين = padding عمودي
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'مخطط النقل الحضري بخطوط الحضرية';
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }; // في الوسط
    titleCell.font = {
      name: 'Cairo',
      size: 24,
      bold: true,
      color: { argb: 'FFFFFFFF' }, // أبيض
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' }, // أزرق غامق
    };
    worksheet.getRow(1).height = 40;

    // 🟦 2) صف رؤوس الأعمدة (صف 3 الآن)
    const headerRow = worksheet.addRow([
      'ترخيص وزاري',
      'اقتراح اللجنة',
      'الحد الاقصى للخط + (الترخيص + التعريض + الحالي)',
      'عدد المركبات حاليا',
      'عدد المتعاملين حاليا',
      'عدد المركبات القديمة',
      'النقطة 5',
      'النقطة 4',
      'النقطة 3',
      'النقطة 2',
      'النقطة 1',
      'نقطة الوصول',
      'نقطة الإنطلاق',
      'رمز الخط',
    ]);

    // 🟦 3) AutoFit أعمدة + تنسيق الهيدر
    headerRow.eachCell((cell, colNumber) => {
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
      cell.font = { name: 'Cairo', size: 13, bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D9E1F2' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      // عرض الأعمدة بناءً على طول الكلمة (min 15, max 40)
      const headerText = cell.value?.toString() || '';
      worksheet.getColumn(colNumber).width = Math.min(
        Math.max(headerText.length + 5, 15),
        40,
      );
    });
    headerRow.height = 30;

    // 🟦 4) إدخال البيانات
    for (const item of data) {
      const opCount = await operateur(item.num_docier_client);

      worksheet.addRow({
        ministerial_license: '',
        committee_proposal: item.note_chef_departement || '',
        max_limit: '',
        vehicles_now: '',
        operateurCount: opCount,
        old_vehicles: '',
        point_Traffic5: item.point_Traffic5,
        point_Traffic4: item.point_Traffic4,
        point_Traffic3: item.point_Traffic3,
        point_Traffic2: item.point_Traffic2,
        point_Traffic1: item.point_Traffic1,
        point_arrive: item.point_arrive,
        point_depart: item.point_depart,
        font_symbol: item.font_symbol,
      });
    }

    // 🟦 5) تنسيق الصفوف (وسط + حدود)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 2) {
        // بعد العنوان والهيدر
        row.height = 20;
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Cairo', size: 11 };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }
    });

    // 🟦 6) إرجاع الملف
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  // ================= Export Balady Transport Excel =================
  async exportBaladyExcel(): Promise<Buffer> {
    const vehicles = await this.VihicileModel.find({
      font_type: 'بين البلديات',
    }).exec();

    // ================= Committee Data =================
    const committeeData = [
      { font_symbol: '442001', oldVehicles: 26, committeeOpinion: 26, maxLimit: 26 },
      { font_symbol: '442002', oldVehicles: 14, committeeOpinion: 24, maxLimit: 24 },
      { font_symbol: '442003', oldVehicles: 27, committeeOpinion: 16, maxLimit: 27 },
      { font_symbol: '442005', oldVehicles: 30, committeeOpinion: 30, maxLimit: 30 },
      { font_symbol: '442006', oldVehicles: 31, committeeOpinion: 30, maxLimit: 31 },
      { font_symbol: '442019', oldVehicles: 32, committeeOpinion: 30, maxLimit: 32 },
      { font_symbol: '442020', oldVehicles: 12, committeeOpinion: 17, maxLimit: 11 },
      { font_symbol: '442021', oldVehicles: 6, committeeOpinion: 11, maxLimit: 13 },
      { font_symbol: '442023', oldVehicles: 1, committeeOpinion: 9, maxLimit: 9 },
      { font_symbol: '442024', oldVehicles: 12, committeeOpinion: 16, maxLimit: 10 },
      { font_symbol: '442025', oldVehicles: 4, committeeOpinion: 12, maxLimit: 10 },
      { font_symbol: '442031', oldVehicles: 10, committeeOpinion: 14, maxLimit: 14 },
      { font_symbol: '442036', oldVehicles: 28, committeeOpinion: 20, maxLimit: 28 },
      { font_symbol: '442040', oldVehicles: 33, committeeOpinion: 20, maxLimit: 33 },
      { font_symbol: '442041', oldVehicles: 4, committeeOpinion: 4, maxLimit: 4 },
      { font_symbol: '442042', oldVehicles: 8, committeeOpinion: 15, maxLimit: 23 },
      { font_symbol: '442053', oldVehicles: 2, committeeOpinion: 5, maxLimit: 5 },
      { font_symbol: '442054', oldVehicles: 11, committeeOpinion: 12, maxLimit: 14 },
      { font_symbol: '442058', oldVehicles: 37, committeeOpinion: 31, maxLimit: 42 },
      { font_symbol: '442060', oldVehicles: 6, committeeOpinion: 6, maxLimit: 8 },
      { font_symbol: '442061', oldVehicles: 33, committeeOpinion: 28, maxLimit: 33 },
      { font_symbol: '442068', oldVehicles: 9, committeeOpinion: 10, maxLimit: 13 },
      { font_symbol: '442070', oldVehicles: 0, committeeOpinion: 1, maxLimit: 1 },
      { font_symbol: '442071', oldVehicles: 16, committeeOpinion: 21, maxLimit: 16 },
      { font_symbol: '442079', oldVehicles: 14, committeeOpinion: 19, maxLimit: 19 },
      { font_symbol: '442082', oldVehicles: 3, committeeOpinion: 5, maxLimit: 8 },
      { font_symbol: '442083', oldVehicles: 26, committeeOpinion: 15, maxLimit: 26 },
      { font_symbol: '442097', oldVehicles: 0, committeeOpinion: 4, maxLimit: 4 },
      { font_symbol: '442098', oldVehicles: 3, committeeOpinion: 5, maxLimit: 7 },
      { font_symbol: '442103', oldVehicles: 27, committeeOpinion: 15, maxLimit: 32 },
      { font_symbol: '442104', oldVehicles: 25, committeeOpinion: 23, maxLimit: 25 },
      { font_symbol: '442108', oldVehicles: 10, committeeOpinion: 10, maxLimit: 13 },
      { font_symbol: '442110', oldVehicles: 1, committeeOpinion: 6, maxLimit: 6 },
      { font_symbol: '442111', oldVehicles: 3, committeeOpinion: 3, maxLimit: 3 },
      { font_symbol: '442128', oldVehicles: 5, committeeOpinion: 5, maxLimit: 5 },
      { font_symbol: '442129', oldVehicles: 18, committeeOpinion: 15, maxLimit: 23 },
      { font_symbol: '442147', oldVehicles: 9, committeeOpinion: 9, maxLimit: 9 },
      { font_symbol: '442153', oldVehicles: 5, committeeOpinion: 5, maxLimit: 10 },
      { font_symbol: '442156', oldVehicles: 2, committeeOpinion: 6, maxLimit: 6 },
      { font_symbol: '442176', oldVehicles: 12, committeeOpinion: 12, maxLimit: 20 },
      { font_symbol: '442184', oldVehicles: 3, committeeOpinion: 5, maxLimit: 7 },
      { font_symbol: '442187', oldVehicles: 1, committeeOpinion: 3, maxLimit: 3 },
      { font_symbol: '442191', oldVehicles: 0, committeeOpinion: 5, maxLimit: 5 },
    ];

    const committeeMap = new Map<string, any>();
    committeeData.forEach((c) => committeeMap.set(c.font_symbol, c));

    // ================= Workbook =================
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vehicles');

    worksheet.mergeCells('A1:L1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'مخطط النقل الخاص بالخطوط البلدية';
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.font = {
      name: 'Cairo',
      size: 24,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' },
    };
    worksheet.getRow(1).height = 40;

    const headerRow = worksheet.addRow([
      'راي المدير',
      'راي اللجنة',
      'عدد الرخص التي تم تعويضها',
      'العدد المتفق عليه',
      'ملاحظات رئيس المصلحة',
      'عدد المركبات سابقا',
      'عدد المركبات في الوقت الحالي',
      'عدد المتعاملين في الوقت الحالي',
      'الوصول',
      'الانطلاق',
      'رمز الخط',
      'الرقم',
    ]);

    headerRow.eachCell((cell, col) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.font = { name: 'Cairo', size: 13, bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D9E1F2' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      worksheet.getColumn(col).width = 22;
    });

    // ================= Group Vehicles =================
    const groupedVehicles = new Map<string, any>();

    for (const v of vehicles) {
      const fontSymbol = v.font_symbol?.replace(/-/g, '') ?? 'UNKNOWN';

      const op = await this.operateurService.findOperateurByNumClient(
        v.num_docier_client,
      );
      const opCount = op?.length ?? 0;

      if (!groupedVehicles.has(fontSymbol)) {
        groupedVehicles.set(fontSymbol, {
          fontSymbol,
          point_depart: v.point_depart ?? '',
          point_arrive: v.point_arrive ?? '',
          note: v.note_chef_departement ?? '',
          operateurs: opCount,
          totalVehicles: 1,
        });
      } else {
        const g = groupedVehicles.get(fontSymbol);
        g.operateurs += opCount;
        g.totalVehicles += 1;
        if (v.note_chef_departement && !g.note.includes(v.note_chef_departement)) {
          g.note += ` | ${v.note_chef_departement}`;
        }
      }
    }

    // ================= SORT BY font_symbol ASC =================
    const sortedVehicles = Array.from(groupedVehicles.values()).sort(
      (a, b) => Number(a.fontSymbol) - Number(b.fontSymbol),
    );

    // ================= Rows =================
    let idx = 1;
    for (const v of sortedVehicles) {
      const committee = committeeMap.get(v.fontSymbol);

      const row = worksheet.addRow([
        '',
        committee?.committeeOpinion ?? '',
        '',
        committee?.maxLimit ?? '',
        v.note,
        committee?.oldVehicles ?? '',
        v.totalVehicles,
        v.operateurs,
        v.point_arrive,
        v.point_depart,
        v.fontSymbol,
        idx,
      ]);

      row.eachCell((cell) => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };
        cell.font = { name: 'Cairo', size: 11 };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      idx++;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }


  // ================= Export Rifi Transport Excel =================
  async exportRifiExcel(): Promise<Buffer> {
    const vehicles = await this.VihicileModel.find({
      font_type: 'ريفي',
    }).exec();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vehicles');

    // --- Header title (merged row) ---
    worksheet.mergeCells('A1:L1'); // عندك 12 عمود في الهيدر
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'مخطط النقل الخاص بالخطوط الريفية';
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.font = {
      name: 'Cairo',
      size: 24,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' },
    };
    worksheet.getRow(1).height = 40;

    // --- Column headers ---
    const headerRow = worksheet.addRow([
      'راي المدير',
      'راي اللجنة',
      'ترخيص وزاري',
      'الحد الاقصى للخط (الترخيص + التعريض + الحالي)',
      'عدد المركبات حاليا',
      'عدد المتعاملين حاليا ',
      'عدد المركبات في قديما ',
      'نقطة الوصول',
      'نقطة الانطلاق',
      'رمز الخط',
      'الرقم',
    ]);

    // --- Style headers ---
    headerRow.eachCell((cell, colNumber) => {
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
      cell.font = { name: 'Cairo', size: 13, bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D9E1F2' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      // عرض الأعمدة بناءً على طول الكلمة (min 15, max 40)
      const headerText = cell.value?.toString() || '';
      worksheet.getColumn(colNumber).width = Math.min(
        Math.max(headerText.length + 5, 15),
        40,
      );
    });
    headerRow.height = 30;

    // --- Data rows ---
    let idx = 0;
    for (const v of vehicles) {
      const op = await this.operateurService.findOperateurByNumClient(
        v.num_docier_client,
      );
      const opCount = op?.length ?? 0;

      const row = worksheet.addRow([
        '', // راي المدير
        v.note_chef_departement ?? '', // ملاحظات رئيس المصلحة
        '',
        '',
        '', // عدد المركبات سابقا
        opCount, // عدد المتعاملين حاليا
        '', // عدد المركبات حاليا
        v.point_arrive ?? '', // الوصول
        v.point_depart ?? '', // الانطلاق
        v.font_type ?? '', // رمز الخط
        idx + 1, // الرقم
      ]);

      // Style rows + alternate colors
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 2) {
          // بعد العنوان والهيدر
          row.height = 20;
          row.eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { name: 'Cairo', size: 11 };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          });
        }
      });

      idx++;
    }

    // --- Auto column widths ---
    worksheet.columns.forEach((col) => {
      col.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  // ================= Export Wilay Transport Excel =================
  async exportExcelWilay(): Promise<Buffer> {
    const vehicles = await this.VihicileModel.find({
      font_type: 'بين الولايات',
    }).exec();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vehicles');

    // --- Header title (merged row) ---
    worksheet.mergeCells('A1:M1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'مخطط النقل الخاص بالخطوط الولائية';
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.font = {
      name: 'Cairo',
      size: 24,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' },
    };
    worksheet.getRow(1).height = 40;
    // --- Column headers ---
    const headerRow = worksheet.addRow([
      'راي المدير',
      'اتفاق اللجنة',
      'عدد الرخص التي تم تعويضها',
      'العدد المتفق عليه باخر محضر',
      'ملاحظات رئيس المصلحة',
      'العدد الاقصى حسب محضر الاجتماع',
      'عدد المركبات سابقا',
      'عدد المركبات في الوقت الحالي',
      'عدد المتعاملين في الوقت الحالي',
      'الوصول',
      'الانطلاق',
      'رمز الخط',
      'الرقم',
    ]);

    // --- Style headers ---
    headerRow.eachCell((cell, colNumber) => {
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
      cell.font = { name: 'Cairo', size: 13, bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D9E1F2' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      // عرض الأعمدة بناءً على طول الكلمة (min 15, max 40)
      const headerText = cell.value?.toString() || '';
      worksheet.getColumn(colNumber).width = Math.min(
        Math.max(headerText.length + 5, 15),
        40,
      );
    });
    headerRow.height = 30;

    // --- Data rows ---
    let idx = 0;
    for (const v of vehicles) {
      const op = await this.operateurService.findOperateurByNumClient(
        v.num_docier_client,
      );
      const opCount = op?.length ?? 0;

      const row = worksheet.addRow([
        '', // راي المدير
        '', // اتفاق اللجنة
        '', // عدد الرخص التي تم تعويضها
        '', // العدد المتفق عليه باخر محضر
        v.note_chef_departement ?? '', // ملاحظات رئيس المصلحة
        '', // عدد المركبات سابقا
        '', // عدد المركبات سابقا
        '', // عدد المركبات حاليا
        opCount, // عدد المتعاملين حاليا
        v.point_arrive ?? '', // الوصول
        v.point_depart ?? '', // الانطلاق
        v.font_type ?? '', // رمز الخط
        idx + 1, // الرقم
      ]);

      // Style rows + alternate colors
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 2) {
          // بعد العنوان والهيدر
          row.height = 20;
          row.eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { name: 'Cairo', size: 11 };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          });
        }
      });

      idx++;
    }

    // --- Auto column widths ---
    worksheet.columns.forEach((col) => {
      col.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async clearVehicles(): Promise<string> {
    await this.VihicileModel.deleteMany({});
    return '✅ All users have been deleted successfully';
  }



}
