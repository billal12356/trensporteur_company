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
import * as XLSX from 'xlsx';
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

    // 🔹 Auto-fill fields from operator
    createVehicleDto.num_wilaya = operateurNum.num_wilaya;
    createVehicleDto.activite = operateurNum.activite;
    createVehicleDto.colonne1 = operateurNum.colonne1;
    createVehicleDto.nature_activite = operateurNum.nature_activite;
    createVehicleDto.colonne2 = operateurNum.colonne2;
    createVehicleDto.status_activite = operateurNum.status_activite;
    createVehicleDto.colonne3 = operateurNum.colonne3;

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

    // ✅ دمج شروط البحث مع شروط الإيقاف
    const finalQuery: any = {
      $and: [
        // شرط 1: المركبة غير موقوفة أو موقوفة مؤقتاً
        {
          $or: [
            { vihicile_parked: "لا" },
            { vihicile_parked: "نعم", type_parked: "مؤقت" }
          ]
        }
      ]
    };

    // شرط 2: إذا كان هناك بحث، أضفه
    if (query.$or && query.$or.length > 0) {
      finalQuery.$and.push({ $or: query.$or });
    }

    const data = await this.VihicileModel.find(finalQuery)
      .limit(finalLimit)
      .skip(skip)
      .sort(sort)
      .lean()
      .exec();

    const total = await this.VihicileModel.countDocuments(finalQuery).exec();

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

    const vihicile = await this.VihicileModel.findOne({ _id: id }).lean().exec();

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
      throw new BadRequestException('معرف غير صالح');
    }

    const vehicle = await this.VihicileModel.findById(id);

    if (!vehicle) {
      throw new NotFoundException('المركبة غير موجودة');
    }

    /** 🔹 Remove undefined values */
    Object.keys(updateVehicleDto).forEach(key => {
      if (updateVehicleDto[key] === undefined) {
        delete updateVehicleDto[key];
      }
    });

    /** 🔹 If num_docier_client changed, validate operator and auto-fill */
    const clientIdChanged = updateVehicleDto.num_docier_client !== undefined
      && updateVehicleDto.num_docier_client !== vehicle.num_docier_client;
    const targetClientId = updateVehicleDto.num_docier_client ?? vehicle.num_docier_client;

    if (clientIdChanged) {
      const operateurNum = await this.operateurService.findByVihicilesandChauffer({
        num_docier_client: targetClientId,
      });

      if (!operateurNum) {
        throw new NotFoundException(
          new ResponseBuilder()
            .setStatus(404)
            .setMessage(`لم يتم العثور على ملف المتعامل بهذا الرقم ${targetClientId}`)
            .setErrors({ _id: 'Operator not found' })
            .build(),
        );
      }

      // Validate names if provided
      if (updateVehicleDto.fullName_arabe && operateurNum.fullName_arabe !== updateVehicleDto.fullName_arabe) {
        throw new NotFoundException(
          new ResponseBuilder()
            .setStatus(404)
            .setMessage(`اسم المتعامل بالعربية غير مطابق: ${updateVehicleDto.fullName_arabe}`)
            .setErrors({ name: 'Arabic name mismatch' })
            .build(),
        );
      }

      if (updateVehicleDto.fullName_francais && operateurNum.fullName_francais !== updateVehicleDto.fullName_francais) {
        throw new NotFoundException(
          new ResponseBuilder()
            .setStatus(404)
            .setMessage(`اسم المتعامل بالفرنسية غير مطابق: ${updateVehicleDto.fullName_francais}`)
            .setErrors({ name: 'French name mismatch' })
            .build(),
        );
      }

      // Auto-fill operator fields
      updateVehicleDto.num_wilaya = operateurNum.num_wilaya;
      updateVehicleDto.fullName_arabe = operateurNum.fullName_arabe;
      updateVehicleDto.fullName_francais = operateurNum.fullName_francais;
      updateVehicleDto.activite = operateurNum.activite;
      updateVehicleDto.colonne1 = operateurNum.colonne1;
      updateVehicleDto.nature_activite = operateurNum.nature_activite;
      updateVehicleDto.colonne2 = operateurNum.colonne2;
      updateVehicleDto.status_activite = operateurNum.status_activite;
      updateVehicleDto.colonne3 = operateurNum.colonne3;
    }

    /** 🔹 Check for duplicate num_bus_registration */
    if (updateVehicleDto.num_bus_registration && updateVehicleDto.num_bus_registration !== vehicle.num_bus_registration) {
      const existingVehicle = await this.VihicileModel.findOne({
        num_bus_registration: updateVehicleDto.num_bus_registration,
        _id: { $ne: vehicle._id },
      });
      if (existingVehicle) {
        throw new NotFoundException(
          new ResponseBuilder()
            .setStatus(409)
            .setMessage('رقم تسجيل المركبة مسجل من قبل')
            .setErrors('رقم تسجيل المركبة مسجل من قبل')
            .setData({
              fullName_arabe: existingVehicle.fullName_arabe,
              matricule: existingVehicle.num_bus_registration,
            })
            .build(),
        );
      }
    }

    /** 🔹 Check if font_type changed */
    const shouldIncrementNumUp =
      updateVehicleDto.font_type &&
      updateVehicleDto.font_type !== vehicle.font_type;

    /** 🔹 Check if font_symbol changed */
    const isFontSymbolChanged =
      updateVehicleDto.font_symbol &&
      updateVehicleDto.font_symbol !== vehicle.font_symbol;

    /** 🔹 Check if type_parked changed to "نهائي" */
    const isPermanentlyParked =
      updateVehicleDto.type_parked === 'نهائي' &&
      vehicle.type_parked !== 'نهائي';

    /** 🔹 Save old font_symbol value BEFORE merge */
    let savedOldFontSymbol: string | null = null;
    if (isFontSymbolChanged) {
      savedOldFontSymbol = vehicle.font_symbol;
      console.log(`🔄 Changing font_symbol from "${savedOldFontSymbol}" to "${updateVehicleDto.font_symbol}"`);
    }

    /** 🔹 Merge values into existing document */
    Object.assign(vehicle, updateVehicleDto);

    /** 🔹 Restore old_font_symbol AFTER merge */
    if (isFontSymbolChanged && savedOldFontSymbol !== null) {
      vehicle.old_font_symbol = savedOldFontSymbol;
      console.log(`✅ Saved old_font_symbol: ${vehicle.old_font_symbol}`);
    }

    /** 🔹 Increment num_up if font_type OR font_symbol changed */
    if (shouldIncrementNumUp || isFontSymbolChanged) {
      vehicle.num_up = (vehicle.num_up ?? 0) + 1;

      if (shouldIncrementNumUp) {
        console.log(`font_type changed → num_up incremented to ${vehicle.num_up}`);
      }
      if (isFontSymbolChanged) {
        console.log(`font_symbol changed → num_up incremented to ${vehicle.num_up}`);
      }
    }

    /** 🔹 Update permanent parking fields */
    if (isPermanentlyParked) {
      vehicle.is_permanently_parked = true;
      vehicle.permanent_parking_date = new Date();
      console.log(`Vehicle permanently parked at ${vehicle.permanent_parking_date}`);
    }
    else if (shouldIncrementNumUp || isFontSymbolChanged) {
      vehicle.is_permanently_parked = true;
      vehicle.permanent_parking_date = new Date();
      console.log(`Vehicle updated (font changed) → marked as permanently parked at ${vehicle.permanent_parking_date}`);
    }

    /** 🔹 Save - validates only modified fields */
    const updatedVehicle = await vehicle.save({ validateModifiedOnly: true });

    return new ResponseBuilder()
      .setStatus(200)
      .setMessage('تم تحديث المركبة بنجاح')
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
        op.num_wilaya || '/',
        op.num_docier_client || '/',
        op.fullName_arabe || '/',
        op.fullName_francais || '/',
        op.activite || '/',
        op.colonne1 || '/',
        op.nature_activite || '/',
        op.colonne2 || '/',
        op.status_activite || '/',
        op.colonne3 || '/',
        op.num_bus_registration || '/',
        op.circle || '/',
        op.Municipality || '/',
        op.Style || '/',
        op.category || '/',
        op.type || '/',
        op.First_year_of_use || '/',
        op.Number_of_seats || '/',
        op.Energy || '/',
        op.num_driving_license || '/',
        formatDate(op.driving_license_history) || '/',
        formatDate(op.driving_license_dure) || '/',
        formatDate(op.line_activity_start_date) || '/',
        formatDate(op.Vehicle_activity_start_date) || '/',
        op.font_type || '/',
        op.colonne4 || '/',
        op.font_symbol || '/',
        op.point_depart || '/',
        op.point_arrive || '/',
        op.point_Traffic1 || '/',
        op.point_Traffic2 || '/',
        op.point_Traffic3 || '/',
        op.point_Traffic4 || '/',
        op.point_Traffic5 || '/',
        op.line_start_time || '/',
        op.line_end_time || '/',
        op.Pace_per_minute || '/',
        op.time_depart1 || '/',
        op.time_depart2 || '/',
        op.time_depart3 || '/',
        op.time_depart4 || '/',
        op.vihicile_parked || '/',
        op.type_parked || '/',
        op.hestoire_parked || '/',
        op.hestoire_parked_end || '/',
        op.comments || '/',
        op.person_concerned || '/',
        op.note_chef_departement || '/',
        op.path || '/',
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

    worksheet.views = [
      { rightToLeft: true },
    ];


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
    }).lean().exec();
    return vihicule;
  }

  // ================= Find Vihicule By Num Bus Registration =================
  async findVihiculeByNumBus(query: Record<string, any>) {
    console.log(query);

    const find = await this.VihicileModel.findOne({
      num_bus_registration: query.num_vehicule,
    }).lean().exec();
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
    }).lean().exec();
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
    cellG5.value = `عين الدفلى في:${formatDate(Date.now(), false)}`;
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
    cellF8.value = vehicles[0]?.point_depart + ' - ' + vehicles[0]?.point_arrive;
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
      row.getCell(2).value = vehicle.num_docier_client || '/';
      row.getCell(3).value = vehicle.fullName_arabe || '/';
      const go1 = Array.isArray(vehicle.time_depart1)
        ? (vehicle.time_depart1 || '/')
        : (vehicle.time_depart1 || '/');
      const go2 = Array.isArray(vehicle.time_depart2)
        ? (vehicle.time_depart2 || '/')
        : (vehicle.time_depart2 || '/');
      const return1 = Array.isArray(vehicle.time_depart3)
        ? (vehicle.time_depart3 || '/')
        : (vehicle.time_depart3 || '/');
      const return2 = Array.isArray(vehicle.time_depart4)
        ? (vehicle.time_depart4 || '/')
        : (vehicle.time_depart4 || '/');

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
    const vehicles = await this.VihicileModel.find({
      font_type: "حضري أو شبه حضري",
    }).lean();

    const committeeData = [
      { font_symbol: "443001", oldVehicles: 5, committeeOpinion: "0" },
      { font_symbol: "443002", oldVehicles: 5, committeeOpinion: "3" },
      { font_symbol: "443003", oldVehicles: 1, committeeOpinion: "0" },
      { font_symbol: "443004", oldVehicles: 1, committeeOpinion: "0" },
      { font_symbol: "443011", oldVehicles: 2, committeeOpinion: "6" },
      { font_symbol: "443015", oldVehicles: 1, committeeOpinion: "0" },
      { font_symbol: "443016", oldVehicles: 0, committeeOpinion: "3" },
      { font_symbol: "443005", oldVehicles: 1, committeeOpinion: "1" },
      { font_symbol: "443006", oldVehicles: 2, committeeOpinion: "1" },
      { font_symbol: "443007", oldVehicles: 6, committeeOpinion: "0" },
      { font_symbol: "443012", oldVehicles: 1, committeeOpinion: "3" },
      { font_symbol: "443013", oldVehicles: 0, committeeOpinion: "*" },
      { font_symbol: "443008", oldVehicles: 1, committeeOpinion: "2" },
      { font_symbol: "443009", oldVehicles: 1, committeeOpinion: "2" },
      { font_symbol: "443010", oldVehicles: 1, committeeOpinion: "0" },
    ];

    const committeeMap = new Map<string, any>();
    committeeData.forEach(c => committeeMap.set(c.font_symbol, c));

    // ================= GROUPING =================
    const grouped = new Map<string, any>();

    for (const v of vehicles) {
      const symbol = v.font_symbol ?? 'UNKNOWN';

      const isFinal =
        v.type_parked &&
        v.type_parked.toString().trim() === 'نهائي';

      if (!grouped.has(symbol)) {
        grouped.set(symbol, {
          vehicles: [],
          parkedNames: [],
          parkedDates: [],
          parkedFinalCount: 0,
        });
      }

      const group = grouped.get(symbol);
      group.vehicles.push(v);

      if (isFinal) {
        group.parkedFinalCount++;

        if (v.fullName_arabe && !group.parkedNames.includes(v.fullName_arabe.trim())) {
          group.parkedNames.push(v.fullName_arabe.trim());
        }

        if (v.hestoire_parked) {
          const formattedDate = new Date(v.hestoire_parked)
            .toISOString()
            .split('T')[0];

          if (!group.parkedDates.includes(formattedDate)) {
            group.parkedDates.push(formattedDate);
          }
        }
      }
    }

    // ================= WORKBOOK =================
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('النقل الحضري');

    worksheet.mergeCells('A1:R2');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'مخطط النقل الحضري بخطوط الحضرية';
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.font = { name: 'Cairo', size: 22, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
    worksheet.getRow(1).height = 40;

    const headerRow = worksheet.addRow([
      'ملاحظة',
      'ترخيص وزاري',
      'اقتراح اللجنة',
      'عدد الرخص التي تم تعويضها',
      'تاريخ التوقف اوالالغاء',
      'اسم و لقب المتعامل الموقف',
      'توقيعات النهائية',
      'الحد الاقصى للخط',
      'عدد المركبات حاليا',
      'عدد المتعاملين حاليا',
      'عدد المركبات قديما',
      'النقطة 5',
      'النقطة 4',
      'النقطة 3',
      'النقطة 2',
      'النقطة 1',
      'نقطة الوصول',
      'نقطة الإنطلاق',
      'رمز الخط',
    ]);

    headerRow.eachCell((cell, col) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.font = { name: 'Cairo', size: 13, bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      worksheet.getColumn(col).width =
        col === 5 ? 40 :
          col === 4 ? 25 :
            22;
    });

    // ================= DATA =================
    const sortedSymbols = Array.from(grouped.keys()).sort();

    for (const symbol of sortedSymbols) {
      const groupData = grouped.get(symbol);
      const group = groupData.vehicles;
      const committee = committeeMap.get(symbol);

      const uniqueOperators = new Set(
        group.map(v => v.num_docier_client).filter(Boolean),
      );

      const first = group[0];

      const row = worksheet.addRow([
        '',
        '',
        '',
        committee?.committeeOpinion ?? '',
        groupData.parkedDates.length > 0
          ? groupData.parkedDates.join(' - ')
          : '',
        groupData.parkedNames.length > 0
          ? groupData.parkedNames.join(' - ')
          : '',
        groupData.parkedFinalCount,
        '',
        group.length,
        uniqueOperators.size,
        committee?.oldVehicles ?? '',
        first?.point_Traffic5 ?? '',
        first?.point_Traffic4 ?? '',
        first?.point_Traffic3 ?? '',
        first?.point_Traffic2 ?? '',
        first?.point_Traffic1 ?? '',
        first?.point_arrive ?? '',
        first?.point_depart ?? '',
        symbol,
      ]);

      row.eachCell(cell => {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.font = { name: 'Cairo', size: 11 };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }



  // ================= Export Balady Transport Excel fixed=================
  async exportBaladyExcel(): Promise<Buffer> {
    try {
      // ================= STEP 1: Fetch Vehicles =================
      const vehicles = await this.VihicileModel.find({
        font_type: 'بين البلديات',
      }).exec();

      // ================= STEP 2: Committee Data =================
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

      // ================= STEP 3: Group Vehicles =================
      const groupedVehicles = new Map<string, any>();

      for (const vehicle of vehicles) {
        const fontSymbol = vehicle.font_symbol?.replace(/-/g, '') ?? 'UNKNOWN';

        const isFinal =
          vehicle.type_parked &&
          vehicle.type_parked.toString().trim() === 'نهائي';

        if (!groupedVehicles.has(fontSymbol)) {
          groupedVehicles.set(fontSymbol, {
            fontSymbol,
            point_depart: vehicle.point_depart ?? '',
            point_arrive: vehicle.point_arrive ?? '',
            totalVehicles: 0,
            parkedFinalCount: 0,
            parkedNames: [],
            parkedDates: [],
          });
        }

        const group = groupedVehicles.get(fontSymbol)!;
        group.totalVehicles += 1;

        if (isFinal) {
          group.parkedFinalCount += 1;

          if (
            vehicle.fullName_arabe &&
            !group.parkedNames.includes(vehicle.fullName_arabe.trim())
          ) {
            group.parkedNames.push(vehicle.fullName_arabe.trim());
          }

          // ✅ إضافة تاريخ التوقف
          if (vehicle.hestoire_parked) {
            const formattedDate = new Date(vehicle.hestoire_parked)
              .toISOString()
              .split('T')[0]; // YYYY-MM-DD

            if (!group.parkedDates.includes(formattedDate)) {
              group.parkedDates.push(formattedDate);
            }
          }
        }
      }


      const sortedVehicles = Array.from(groupedVehicles.values()).sort(
        (a, b) => Number(a.fontSymbol) - Number(b.fontSymbol)
      );

      // ================= STEP 4: Create Workbook =================
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Vehicles');

      // 🎨 DESIGN: Set worksheet properties
      worksheet.properties.defaultRowHeight = 25;
      worksheet.properties.defaultColWidth = 20;

      // 🎨 DESIGN: Title row with merged cells and styling
      worksheet.mergeCells('A1:P1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'مخطط النقل الخاص بالخطوط البلدية';
      titleCell.font = {
        name: 'Cairo',
        size: 16,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F4E78' }, // Dark blue
      };
      worksheet.getRow(1).height = 35;

      // 🎨 DESIGN: Headers with professional styling
      const headers = [
        'ملاحظة',
        'راي المدير',
        'راي اللجنة',
        'عدد الرخص التي تم تعويضها',
        'تاريخ التوقف اوالالغاء',
        'اسم و لقب المتعامل الموقف',
        'توقيعات النهائية',
        'العدد المخصص للتعويض',
        'العدد المتفق عليه',
        'عدد المركبات سابقا',
        'عدد المركبات في الوقت الحالي',
        'عدد المتعاملين في الوقت الحالي',
        'الوصول',
        'الانطلاق',
        'رمز الخط',
        'الرقم',
      ];

      const headerRow = worksheet.addRow(headers);
      worksheet.getRow(2).height = 30;

      headerRow.eachCell((cell, col) => {
        // 🎨 DESIGN: Header font and colors
        cell.font = {
          name: 'Cairo',
          size: 12,
          bold: true,
          color: { argb: 'FFFFFFFF' },
        };

        // 🎨 DESIGN: Header alignment
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true,
        };

        // 🎨 DESIGN: Header background color (blue gradient)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' }, // Medium blue
        };

        // 🎨 DESIGN: Header borders
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF1F4E78' } },
          left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
          bottom: { style: 'medium', color: { argb: 'FF1F4E78' } },
          right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        };

        // 🎨 DESIGN: Column widths (special width for names column)
        worksheet.getColumn(col).width = col === 5 ? 40 : 22;
      });

      // ================= STEP 5: Insert Rows with Design =================
      let rowIndex = 1;

      for (const vehicle of sortedVehicles) {
        const committee = committeeMap.get(vehicle.fontSymbol);
        const number_allocated_compensation = vehicle.totalVehicles - committee?.committeeOpinion;
        console.log(number_allocated_compensation)


        const rowData = [
          '',
          '',
          '',
          Math.abs(number_allocated_compensation) ?? '',
          vehicle.parkedDates && vehicle.parkedDates.length > 0
            ? vehicle.parkedDates.join(' - ')
            : '',
          vehicle.parkedNames.length > 0
            ? vehicle.parkedNames.join(' - ')
            : '',
          vehicle.parkedFinalCount,
          Math.abs(number_allocated_compensation) ?? '',
          committee?.committeeOpinion ?? '',
          committee?.oldVehicles ?? '',
          vehicle.totalVehicles,
          '',
          vehicle.point_arrive,
          vehicle.point_depart,
          vehicle.fontSymbol,
          rowIndex,
        ];

        const dataRow = worksheet.addRow(rowData);

        // 🎨 DESIGN: Alternating row colors for better readability
        const isEvenRow = rowIndex % 2 === 0;
        const rowFillColor = isEvenRow ? 'FFFFFFFF' : 'FFF2F2F2'; // White / Light gray

        dataRow.eachCell((cell, colNumber) => {
          // 🎨 DESIGN: Data font
          cell.font = {
            name: 'Cairo',
            size: 11,
          };

          // 🎨 DESIGN: Data alignment (special for names column)
          cell.alignment =
            colNumber === 5
              ? { vertical: 'middle', horizontal: 'right', wrapText: true }
              : { vertical: 'middle', horizontal: 'center' };

          // 🎨 DESIGN: Alternating row background
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: rowFillColor },
          };

          // 🎨 DESIGN: Cell borders
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          };

          // 🎨 DESIGN: Highlight important columns with different color
          if ([6, 7, 8, 9, 10].includes(colNumber)) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: isEvenRow ? 'FFEFF6FC' : 'FFE7F0F7' }, // Light blue tint
            };
          }
        });

        rowIndex++;
      }

      // 🎨 DESIGN: Freeze panes (keep title and headers visible when scrolling)
      worksheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 2, // Freeze first 2 rows
          activeCell: 'A3',
          topLeftCell: 'A3',
        },
      ];

      // 🎨 DESIGN: Auto-filter on header row
      worksheet.autoFilter = {
        from: { row: 2, column: 1 },
        to: { row: 2, column: 15 },
      };

      // 🎨 DESIGN: Print settings for professional output
      worksheet.pageSetup = {
        paperSize: 9, // A4
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        printTitlesRow: '1:2', // Repeat title and header on each page
        margins: {
          left: 0.5,
          right: 0.5,
          top: 0.75,
          bottom: 0.75,
          header: 0.3,
          footer: 0.3,
        },
      };

      // 🎨 DESIGN: Add workbook metadata
      workbook.creator = 'Balady Transport System';
      workbook.lastModifiedBy = 'System';
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.company = 'Balady Transport';
      workbook.title = 'مخطط النقل الخاص بالخطوط البلدية';

      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);

    } catch (error) {
      console.error('Error exporting Balady Excel:', error);
      throw new Error(`Failed to export Balady Excel: ${error.message}`);
    }
  }







  // ================= Export Rifi Transport Excel =================
  async exportRifiExcel(): Promise<Buffer> {
    const vehicles = await this.VihicileModel.find({
      font_type: 'ريـفي',
    }).lean();

    const committeeData = [
      { font_symbol: '444066', oldVehicles: 10, committeeOpinion: 10 },
      { font_symbol: '444190', oldVehicles: 2, committeeOpinion: 7 },
      { font_symbol: '444198', oldVehicles: 0, committeeOpinion: 8 },
      { font_symbol: '444475', oldVehicles: 0, committeeOpinion: 3 },
      { font_symbol: '444103', oldVehicles: 3, committeeOpinion: 4 },
      { font_symbol: '444368', oldVehicles: 8, committeeOpinion: 13 },
      { font_symbol: '444067', oldVehicles: 6, committeeOpinion: 4 },
      { font_symbol: '444206', oldVehicles: 4, committeeOpinion: 4 },
      { font_symbol: '444476', oldVehicles: 0, committeeOpinion: 3 },
      { font_symbol: '444477', oldVehicles: 0, committeeOpinion: 3 },
      { font_symbol: '444478', oldVehicles: 0, committeeOpinion: 3 },
      { font_symbol: '444479', oldVehicles: 0, committeeOpinion: 3 },
      { font_symbol: '444480', oldVehicles: 0, committeeOpinion: 3 },
      { font_symbol: '444481', oldVehicles: 0, committeeOpinion: 3 },
      { font_symbol: '444482', oldVehicles: 0, committeeOpinion: 3 },
      { font_symbol: '444516', oldVehicles: 0, committeeOpinion: 3 },
      { font_symbol: '444483', oldVehicles: 0, committeeOpinion: 3 },
      { font_symbol: '444222', oldVehicles: 7, committeeOpinion: 11 },
      { font_symbol: '444445', oldVehicles: 4, committeeOpinion: 6 },
      { font_symbol: '444035', oldVehicles: 4, committeeOpinion: 5 },
      { font_symbol: '444471', oldVehicles: 0, committeeOpinion: 2 },
      { font_symbol: '444484', oldVehicles: 1, committeeOpinion: 3 },
      { font_symbol: '444210', oldVehicles: 3, committeeOpinion: 5 },
      { font_symbol: '444384', oldVehicles: 1, committeeOpinion: 5 },
      { font_symbol: '444413', oldVehicles: 4, committeeOpinion: 8 },
      { font_symbol: '444472', oldVehicles: 0, committeeOpinion: 2 },
      { font_symbol: '444361', oldVehicles: 10, committeeOpinion: 6 },
      { font_symbol: '444468', oldVehicles: 2, committeeOpinion: 5 },
      { font_symbol: '444464', oldVehicles: 0, committeeOpinion: 4 },
      { font_symbol: '444450', oldVehicles: 5, committeeOpinion: 8 },
      { font_symbol: '444473', oldVehicles: 0, committeeOpinion: 2 },
      { font_symbol: '444310', oldVehicles: 0, committeeOpinion: 6 },
      { font_symbol: '444485', oldVehicles: 0, committeeOpinion: 3 },
      { font_symbol: '444505', oldVehicles: 0, committeeOpinion: 4 },
      { font_symbol: '444223', oldVehicles: 2, committeeOpinion: 6 },
      { font_symbol: '444486', oldVehicles: 0, committeeOpinion: 3 },
      { font_symbol: '444411', oldVehicles: 3, committeeOpinion: 7 },
      { font_symbol: '444447', oldVehicles: 1, committeeOpinion: 4 },
      { font_symbol: '444448', oldVehicles: 3, committeeOpinion: 5 },
      { font_symbol: '444506', oldVehicles: 1, committeeOpinion: 4 },
      { font_symbol: '444452', oldVehicles: 0, committeeOpinion: 6 },
      { font_symbol: '444470', oldVehicles: 2, committeeOpinion: 2 },
      { font_symbol: '444487', oldVehicles: 0, committeeOpinion: 3 },
      { font_symbol: '444003', oldVehicles: 12, committeeOpinion: 15 },
      { font_symbol: '444189', oldVehicles: 3, committeeOpinion: 5 },
      { font_symbol: '444446', oldVehicles: 1, committeeOpinion: 2 },
    ];

    const committeeMap = new Map<string, any>();
    committeeData.forEach(c => committeeMap.set(c.font_symbol, c));

    // ================= GROUPING WITH FINAL LOGIC =================
    const grouped = new Map<string, any>();

    for (const v of vehicles) {
      const fontSymbol = v.font_symbol?.replace(/-/g, '') ?? 'UNKNOWN';
      const isFinal = v.type_parked?.trim() === 'نهائي';

      if (!grouped.has(fontSymbol)) {
        grouped.set(fontSymbol, {
          vehicles: [],
          parkedNames: [],
          parkedDates: [],
          parkedFinalCount: 0,
        });
      }

      const group = grouped.get(fontSymbol);
      group.vehicles.push(v);

      if (isFinal) {
        group.parkedFinalCount++;

        if (v.fullName_arabe && !group.parkedNames.includes(v.fullName_arabe.trim())) {
          group.parkedNames.push(v.fullName_arabe.trim());
        }

        if (v.hestoire_parked) {
          const formattedDate = new Date(v.hestoire_parked)
            .toISOString()
            .split('T')[0];

          if (!group.parkedDates.includes(formattedDate)) {
            group.parkedDates.push(formattedDate);
          }
        }
      }
    }

    // ================= WORKBOOK =================
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('النقل الريفي');

    worksheet.mergeCells('A1:O1');
    worksheet.getCell('A1').value = 'مخطط النقل الخاص بالخطوط الريفية';

    const headerRow = worksheet.addRow([
      'ملاحظة',
      'راي المدير',
      'راي اللجنة',
      'عدد الرخص التي تم تعويضها',
      'تاريخ التوقف اوالالغاء',
      'اسم و لقب المتعامل الموقف',
      'توقيعات النهائية',
      'ترخيص وزاري',
      'الحد الاقصى للخط',
      'عدد المركبات حاليا',
      'عدد المتعاملين حاليا',
      'عدد المركبات قديما',
      'نقطة الوصول',
      'نقطة الانطلاق',
      'رمز الخط',
      'الرقم',
    ]);

    headerRow.eachCell((cell, col) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.font = { name: 'Cairo', size: 13, bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      worksheet.getColumn(col).width =
        col === 5 ? 40 :
          col === 4 ? 25 :
            22;
    });

    // ================= DATA =================
    let idx = 1;
    const sortedSymbols = Array.from(grouped.keys()).sort();

    for (const fontSymbol of sortedSymbols) {
      const groupData = grouped.get(fontSymbol);
      const vehiclesForSymbol = groupData.vehicles;
      const committee = committeeMap.get(fontSymbol);

      const uniqueOperators = new Set(
        vehiclesForSymbol.map(v => v.num_docier_client).filter(Boolean)
      );

      const firstVehicle = vehiclesForSymbol[0];

      const row = worksheet.addRow([
        '',
        '',
        '',
        committee?.committeeOpinion ?? '',
        groupData.parkedDates.length > 0
          ? groupData.parkedDates.join(' - ')
          : '',
        groupData.parkedNames.length > 0
          ? groupData.parkedNames.join(' - ')
          : '',
        groupData.parkedFinalCount,
        '',
        '',
        vehiclesForSymbol.length,
        uniqueOperators.size,
        committee?.oldVehicles ?? '',
        firstVehicle?.point_arrive ?? '',
        firstVehicle?.point_depart ?? '',
        fontSymbol,
        idx,
      ]);

      row.eachCell(cell => {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
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



  // ================= Export Wilay Transport Excel =================
  async exportExcelWilay(): Promise<Buffer> {
    const vehicles = await this.VihicileModel.find({
      font_type: 'بين الولايات',
    }).lean();

    const committeeData = [{ font_symbol: '441001', oldVehicles: null, committeeOpinion: '6' }, { font_symbol: '441002', oldVehicles: null, committeeOpinion: '1 طلب ترخيص' }, { font_symbol: '441003', oldVehicles: null, committeeOpinion: '6' }, { font_symbol: '441004', oldVehicles: null, committeeOpinion: '6' }, { font_symbol: '441005', oldVehicles: 25, committeeOpinion: '15' }, { font_symbol: '441006', oldVehicles: 21, committeeOpinion: '21' }, { font_symbol: '441010', oldVehicles: 24, committeeOpinion: '11' }, { font_symbol: '441012', oldVehicles: 21, committeeOpinion: '10' }, { font_symbol: '441014', oldVehicles: 2, committeeOpinion: '2 مع طلب ترخيص وزاري' }, { font_symbol: '441015', oldVehicles: 19, committeeOpinion: '14' }, { font_symbol: '441016', oldVehicles: 0, committeeOpinion: '5' }, { font_symbol: '441022', oldVehicles: 13, committeeOpinion: '10' }, { font_symbol: '441023', oldVehicles: 17, committeeOpinion: '14' }, { font_symbol: '441025', oldVehicles: 20, committeeOpinion: '12' }, { font_symbol: '441026', oldVehicles: 3, committeeOpinion: 'طلب الترخيص 6' }, { font_symbol: '441030', oldVehicles: 13, committeeOpinion: '10 برمجة اجتماع' }, { font_symbol: '441033', oldVehicles: 3, committeeOpinion: 'الحذف مع التسوية' }, { font_symbol: '441042', oldVehicles: 3, committeeOpinion: '2' }, { font_symbol: '441044', oldVehicles: 17, committeeOpinion: '5' }, { font_symbol: '441045', oldVehicles: 10, committeeOpinion: '12' }, { font_symbol: '441046', oldVehicles: 10, committeeOpinion: '9 برمجة اجتماع' }, { font_symbol: '441048', oldVehicles: 6, committeeOpinion: '4' }, { font_symbol: '441049', oldVehicles: 10, committeeOpinion: '6' }, { font_symbol: '441050', oldVehicles: 1, committeeOpinion: '4' }, { font_symbol: '441052', oldVehicles: 12, committeeOpinion: '12' }, { font_symbol: '441053', oldVehicles: 6, committeeOpinion: '6 مع عقد اجتماع' }, { font_symbol: '441057', oldVehicles: 0, committeeOpinion: '1' }, { font_symbol: '441066', oldVehicles: 5, committeeOpinion: '6 مع عقد اجتماع' }, { font_symbol: '441067', oldVehicles: null, committeeOpinion: '2' }, { font_symbol: '441068', oldVehicles: null, committeeOpinion: '4' }, { font_symbol: '441071', oldVehicles: 2, committeeOpinion: '1' }, { font_symbol: '441072', oldVehicles: null, committeeOpinion: '2' }, { font_symbol: '441075', oldVehicles: null, committeeOpinion: '2' }, { font_symbol: '441076', oldVehicles: null, committeeOpinion: '2' }, { font_symbol: '441077', oldVehicles: null, committeeOpinion: '2' }, { font_symbol: '441078', oldVehicles: null, committeeOpinion: '2' }, { font_symbol: '441079', oldVehicles: null, committeeOpinion: '2' }, { font_symbol: '441080', oldVehicles: null, committeeOpinion: '2' }, { font_symbol: '441081', oldVehicles: null, committeeOpinion: '2' }, { font_symbol: '441082', oldVehicles: null, committeeOpinion: '4' },];

    const committeeMap = new Map<string, any>();
    committeeData.forEach(c => committeeMap.set(c.font_symbol, c));

    // ================= GROUPING WITH FINAL LOGIC =================
    const grouped = new Map<string, any>();

    for (const v of vehicles) {
      const symbol = v.font_symbol?.replace(/-/g, '') ?? 'UNKNOWN';
      const isFinal = v.type_parked?.trim() === 'نهائي';

      if (!grouped.has(symbol)) {
        grouped.set(symbol, {
          vehicles: [],
          parkedNames: [],
          parkedDates: [],
          parkedFinalCount: 0,
        });
      }

      const group = grouped.get(symbol);
      group.vehicles.push(v);

      if (isFinal) {
        group.parkedFinalCount++;

        if (v.fullName_arabe && !group.parkedNames.includes(v.fullName_arabe.trim())) {
          group.parkedNames.push(v.fullName_arabe.trim());
        }

        if (v.hestoire_parked) {
          const formattedDate = new Date(v.hestoire_parked)
            .toISOString()
            .split('T')[0];

          if (!group.parkedDates.includes(formattedDate)) {
            group.parkedDates.push(formattedDate);
          }
        }
      }
    }

    // ================= Workbook =================
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('النقل الولائي');

    worksheet.mergeCells('A1:Q1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'مخطط النقل الخاص بالخطوط الولائية';
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.font = { name: 'Cairo', size: 22, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
    worksheet.getRow(1).height = 40;

    const headerRow = worksheet.addRow([
      'ملاحظة',
      'راي المدير',
      'ملاحظات رئيس المصلحة',
      'راي اللجنة',
      'عدد الرخص التي تم تعويضها',
      'تاريخ التوقف اوالالغاء',
      'اسم و لقب المتعامل الموقف',
      'توقيعات النهائية',
      'العدد المتفق عليه باخر محضر',
      'العدد الاقصى حسب محضر الاجتماع',
      'عدد المركبات قديما',
      'عدد المركبات حاليا',
      'عدد المتعاملين حاليا',
      'الوصول',
      'الانطلاق',
      'رمز الخط',
      'الرقم',
    ]);

    headerRow.eachCell((cell, col) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.font = { name: 'Cairo', size: 13, bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      worksheet.getColumn(col).width =
        col === 5 ? 40 :
          col === 4 ? 25 :
            22;
    });

    // ================= DATA =================
    let idx = 1;
    const sortedSymbols = Array.from(grouped.keys()).sort();

    for (const symbol of sortedSymbols) {
      const groupData = grouped.get(symbol);
      const list = groupData.vehicles;
      const committee = committeeMap.get(symbol);

      const uniqueOperators = new Set(
        list.map(v => v.num_docier_client).filter(Boolean)
      );

      const first = list[0];

      const row = worksheet.addRow([
        '',
        '',
        first?.note_chef_departement ?? '',
        '',
        committee?.committeeOpinion ?? '',
        groupData.parkedDates.length > 0
          ? groupData.parkedDates.join(' - ')
          : '',
        groupData.parkedNames.length > 0
          ? groupData.parkedNames.join(' - ')
          : '',
        groupData.parkedFinalCount,
        '',
        '',
        committee?.oldVehicles ?? '',
        list.length,
        uniqueOperators.size,
        first?.point_arrive ?? '',
        first?.point_depart ?? '',
        symbol,
        idx,
      ]);

      row.eachCell(cell => {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
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



  async clearVehicles(): Promise<string> {
    await this.VihicileModel.deleteMany({});
    return '✅ All users have been deleted successfully';
  }



  async convertAndSaveToMongoDB(file: Express.Multer.File): Promise<any> {
    try {
      console.log("file.buffer", file.buffer);
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetNames = workbook.SheetNames;

      const allData = {};
      let savedCount = 0;
      let failedCount = 0;
      let totalProcessed = 0;
      const errors = [];

      for (const sheetName of sheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        console.log("worksheet", worksheet);

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: null,
        });

        allData[sheetName] = jsonData;

        // Save each row to MongoDB
        for (let i = 0; i < jsonData.length; i++) {
          totalProcessed++;
          try {
            const row = jsonData[i];

            // Convert dates from Excel format to JavaScript Date
            const parseDate = (dateStr: any) => {
              if (!dateStr) return null;
              const date = new Date(dateStr);
              return isNaN(date.getTime()) ? null : date;
            };

            // Convert to number safely
            const parseNumber = (value: any) => {
              if (!value || value === '') return null;
              const num = Number(value);
              return isNaN(num) ? null : num;
            };

            // Normalize enum values
            const normalizeVehicleParked = (value: string) => {
              if (!value) return null;
              if (value.includes('نعم')) return 'نعم';
              if (value.includes('لا')) return 'لا';
              return null;
            };

            const normalizeTypeParked = (value: string) => {
              if (!value) return null;
              if (value.includes('مؤقت')) return 'مؤقت';
              if (value.includes('نهائي')) return 'نهائي';
              return null;
            };

            // Column mapping: Excel headers -> Schema fields
            const columnMapping = {
              '__EMPTY': 'num_wilaya',
              '__EMPTY_1': 'num_docier_client',
              'البحث باسم المتعامل بالعربية': 'fullName_arabe',
              'البحث باسم المتعامل بالفرنسية': 'fullName_francais',
              '__EMPTY_2': 'activite',
              '__EMPTY_3': 'colonne1',
              '__EMPTY_4': 'nature_activite',
              '__EMPTY_5': 'colonne2',
              '__EMPTY_6': 'status_activite',
              '__EMPTY_7': 'colonne3',
              'البحث بترقيم المركبة': 'num_bus_registration',
              '__EMPTY_8': 'circle',
              '__EMPTY_9': 'Municipality',
              '__EMPTY_10': 'Style',
              '__EMPTY_11': 'category',
              '__EMPTY_12': 'type',
              '__EMPTY_13': 'First_year_of_use',
              '__EMPTY_14': 'total_load_trucks',
              '__EMPTY_15': 'restricted_load',
              '__EMPTY_16': 'Number_of_seats',
              '__EMPTY_17': 'Energy',
              '__EMPTY_18': 'num_driving_license',
              '__EMPTY_19': 'driving_license_history',
              '__EMPTY_20': 'driving_license_dure',
              '__EMPTY_21': 'line_activity_start_date',
              '__EMPTY_22': 'Vehicle_activity_start_date',
              '__EMPTY_23': 'font_type',
              '__EMPTY_24': 'colonne4',
              '__EMPTY_25': 'font_symbol',
              '__EMPTY_26': 'point_depart',
              '__EMPTY_27': 'point_arrive',
              '__EMPTY_28': 'point_Traffic1',
              '__EMPTY_29': 'point_Traffic2',
              '__EMPTY_30': 'point_Traffic3',
              '__EMPTY_31': 'point_Traffic4',
              '__EMPTY_32': 'point_Traffic5',
              '__EMPTY_33': 'line_start_time',
              '__EMPTY_34': 'line_end_time',
              '__EMPTY_35': 'Pace_per_minute',
              '__EMPTY_36': 'time_depart1',
              '__EMPTY_37': 'time_depart2',
              '__EMPTY_38': 'time_depart3',
              '__EMPTY_39': 'time_depart4',
              '__EMPTY_40': 'vihicile_parked',
              '__EMPTY_41': 'type_parked',
              '__EMPTY_42': 'hestoire_parked',
              '__EMPTY_43': 'hestoire_parked_end',
              '__EMPTY_44': 'comments',
              '__EMPTY_45': 'person_concerned',
              '__EMPTY_46': 'note_chef_departement',
              '__EMPTY_47': 'path',
            };

            // Map and convert Excel data to schema fields
            const vihiclesData: any = {};

            for (const [excelColumn, schemaField] of Object.entries(columnMapping)) {
              const value = row[excelColumn];

              // Apply appropriate conversion based on field type
              if (value === null || value === undefined || value === '') {
                vihiclesData[schemaField] = null;
                continue;
              }

              // Date fields
              if ([
                'driving_license_history',
                'driving_license_dure',
                'line_activity_start_date',
                'Vehicle_activity_start_date',
                'hestoire_parked',
                'hestoire_parked_end'
              ].includes(schemaField)) {
                vihiclesData[schemaField] = parseDate(value);
              }
              // Number fields
              else if ([
                'num_wilaya',
                'num_docier_client',
                'First_year_of_use',
                'total_load_trucks',
                'restricted_load',
                'Number_of_seats',
                'num_driving_license'
              ].includes(schemaField)) {
                vihiclesData[schemaField] = parseNumber(value);
              }
              // Enum fields with normalization
              else if (schemaField === 'vihicile_parked') {
                vihiclesData[schemaField] = normalizeVehicleParked(value);
              }
              else if (schemaField === 'type_parked') {
                vihiclesData[schemaField] = normalizeTypeParked(value);
              }
              // String fields
              else {
                vihiclesData[schemaField] = value;
              }
            }

            // Also save original Excel column names as additional fields
            for (const [key, value] of Object.entries(row)) {
              const cleanKey = key.trim();
              // Only add if not already mapped
              if (!columnMapping[key]) {
                vihiclesData[cleanKey] = value;
              }
            }

            // Create and save the document
            const vihicle = new this.VihicileModel(vihiclesData);
            await vihicle.save();
            savedCount++;
          } catch (error) {
            failedCount++;
            errors.push({
              row: i + 1,
              error: error.message,
              data: jsonData[i],
            });
            console.error(`خطأ في الصف ${i + 1}:`, error.message);
          }
        }
      }

      // Save to file.json
      const outputPath = path.join(process.cwd(), 'file-vehuc.json');
      fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2), 'utf-8');

      console.log(`✓ تم حفظ ${savedCount} سجل في MongoDB`);
      console.log(`✗ فشل حفظ ${failedCount} سجل`);
      console.log(`✓ تم معالجة ${totalProcessed} سجل إجمالي`);
      console.log(`✓ تم حفظ JSON في ${outputPath}`);

      return {
        savedCount,
        failedCount,
        totalProcessed,
        jsonPath: outputPath,
        errors: errors.slice(0, 10),
      };
    } catch (error) {
      console.error('خطأ في تحويل Excel:', error);
      throw error;
    }
  }


  async addFieldToVehicles() {
    try {
      // ✅ إضافة جميع الحقول الجديدة في استعلام واحد
      const allNewFields = await this.VihicileModel.updateMany(
        {},  // ⬅️ فاضي = كل السجلات
        {
          $set: {
            num_up: 0,
            is_permanently_parked: false,
            permanent_parking_date: null,
            old_font_symbol: null  // ✅ الحقل الجديد
          }
        }
      );

      console.log(`✅ تم إضافة جميع الحقول الجديدة لـ ${allNewFields.modifiedCount} مركبة`);

      return {
        success: true,
        message: 'تم إضافة جميع الحقول الجديدة بنجاح',
        modified_count: allNewFields.modifiedCount,
        fields_added: ['num_up', 'is_permanently_parked', 'permanent_parking_date', 'old_font_symbol']
      };

    } catch (error) {
      console.log("❌ خطأ:", error);
      throw error;
    }
  }

  async findByFontSymbol(fontSymbol: string) {
    console.log("fontSymbol", fontSymbol)
    const vehicle = await this.VihicileModel.findOne({
      font_symbol: fontSymbol,
    });
    console.log("vehicle", vehicle)

    if (!vehicle) {
      throw new NotFoundException('رمز الخط خاطئ');
    }

    return {
      point_depart: vehicle.point_depart,
      point_arrive: vehicle.point_arrive,
      font_symbol: vehicle.font_symbol,
    };
  }

  async findVehicleById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف غير صالح');
    }

    const vehicle = await this.VihicileModel.findById(id);

    if (!vehicle) {
      throw new NotFoundException('المركبة غير موجودة');
    }

    return vehicle;
  }

}
function formatDate(date?: Date | string | null): string {
  if (!date) return '/';

  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) return '/';

  return d.toLocaleDateString('fr-FR'); // dd/mm/yyyy
}

