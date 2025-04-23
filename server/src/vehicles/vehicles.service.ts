import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Vihicles } from './vihicles.schema';
import { Model, Types } from 'mongoose';
import { OperateurDtwService } from 'src/operateur-dtw/operateur-dtw.service';
import { ResponseBuilder } from 'src/common/builder/response.builder';
import { UserQueryBuilder } from 'src/common/builder/pagination.builder';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { Workbook } from 'exceljs';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vihicles.name) private VihicileModel: Model<Vihicles>,
    @Inject(forwardRef(() => OperateurDtwService))
    private readonly operateurService: OperateurDtwService,
  ) { }


  async create(createVehicleDto: CreateVehicleDto) {
    const { num_docier_client, fullName_arabe, fullName_francais } = createVehicleDto
    const operateurNum = await this.operateurService.findByVihicilesandChauffer({ num_docier_client })

    console.log("ope",operateurNum);
    
    if (!operateurNum) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على ملف المتعامل  بهذا الرقم ${num_docier_client}`)
          .setErrors({ _id: 'Operator not found' })
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


    const vihicile = await this.VihicileModel.create(createVehicleDto)
    return new ResponseBuilder()
      .setStatus(201)
      .setMessage('تم تسجيل المركبة بنجاح')
      .setData(vihicile)
      .build()
  }

  async findAll(params: any) {
    const queryBuilder = new UserQueryBuilder()
      .setLimit(Number(params.limit) || 10)
      .setSkip(Number(params.page) || 1)
      .setSort(params.sort || 'asc')
      .setFullNameArabe(params.fullName_arabe)
      .setFullNameFrancais(params.fullName_francais)
      .setSearch(params.search);

    const { query, limit, skip, sort } = queryBuilder.build();

    console.log({ query, limit, skip, sort });

    const data = await this.VihicileModel.find(query)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();

    const total = await this.VihicileModel.countDocuments(query).exec();

    return {
      total,
      limit,
      page: params.page || 1,
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
    return vihicile
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
    };

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
    worksheet.addRow([])
    worksheet.mergeCells('A1:F1');
    titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
    titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E78' } };

    const headerRow = worksheet.addRow([
      'المعرف (ID)', 'رقم الولاية', 'رقم ملف المتعامل في سجل الناقلين', 'اسم ولقب المتعامل (بالعربية)',
      'اسم ولقب المتعامل (بالفرنسية)', 'النشاط', 'العمود 1', 'طبيعة النشاط', 'العمود 2', 'حالة النشاط',
      'العمود 3', 'رقم تسجيل الحافلة او الشاحنة', 'الدائرة', 'البلدية', 'الطراز',
      'الصنف', 'النوع', 'اول سنة استعمال', 'عدد المقاعد',
      'الطاقة', 'رقم رخصة سير المركبة', 'تاريخ رخصة السير', 'مدة صلاحية الرخصة',
      'تاريخ بداية نشاط الخط', 'تاريخ بداية نشاط المركبة', 'نوع الخط', 'العمود 4',
      'رمز الخط', 'نقطة الانطلاق', 'نقطة الوصول', 'نقطة المرور 1',
      'نقطة المرور 2', 'نقطة المرور 3', 'نقطة المرور 4', 'نقطة المرور 5',
      'توقيت بداية الخط', 'توقيت نهاية الخدمة', 'الوتيرة بالدقائق بالنسبة للحضري', 'تاريخ الانطلاق 1', 'تاريخ الانطلاق 2', 'تاريخ الانطلاق 3', 'تاريخ الانطلاق 4', ' المركبة (متوقفة أم لا)', 'نوع التوقف',
      'تاريخ التوقف', 'تاريخ نهاية توقيف مؤقت', 'ملاحظات',
      'المعني بالتحديث', 'ملاحظات رئيس المصلحة', 'المسار'
    ]);


    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0070C0' } };
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
        id++, op.num_wilaya, op.num_docier_client, op.fullName_arabe, op.fullName_francais,
        op.activite, op.colonne1 || "/", op.nature_activite, op.colonne2 || "/", op.status_activite, op.colonne3 || "/",
        op.num_bus_registration, op.circle,
        op.Municipality, op.Style, op.category, op.type,
        op.First_year_of_use, op.Number_of_seats, op.Energy, op.num_driving_license,
        op.driving_license_history, op.driving_license_dure, op.line_activity_start_date,
        op.Vehicle_activity_start_date, op.font_type, op.colonne4, op.font_symbol, op.point_depart,
        op.point_arrive, op.point_Traffic1, op.point_Traffic2,
        op.point_Traffic3, op.point_Traffic4, op.point_Traffic5, op.line_start_time,
        op.line_end_time, op.Pace_per_minute, op.time_depart1, op.time_depart2, op.time_depart3, op.time_depart4,
        op.vihicile_parked, op.type_parked, op.hestoire_parked, op.hestoire_parked_end, op.comments, op.person_concerned,
        op.note_chef_departement, op.path
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

  async findVihiculeByOperateur(num_docier_client: number) {
    const vihicule = await this.VihicileModel
      .find({ num_docier_client })
      .exec();    
    return vihicule
  }

  async findVihiculeByNumBus(query: Record<string, any>) {
    console.log(query);
    
    const find = await this.VihicileModel.findOne({num_bus_registration: query.num_vehicule});
    console.log(find);
    
    return find;
  }

  
}
