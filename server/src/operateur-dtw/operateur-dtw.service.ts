import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOperateurDtwDto } from './dto/create-operateur-dtw.dto';
import { UpdateOperateurDtwDto } from './dto/update-operateur-dtw.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Operateur } from './operateur-dtw.schema';
import { Model, Types } from 'mongoose';
import { ResponseBuilder } from 'src/common/builder/response.builder';
import { UserQueryBuilder } from 'src/common/builder/pagination.builder';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { Workbook } from 'exceljs';
import { VehiclesService } from 'src/vehicles/vehicles.service';
import { ChauffeursService } from 'src/chauffeurs/chauffeurs.service';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ruralCoordinates } from 'src/constants/rural-coordinates';
const fontkit = require('@pdf-lib/fontkit')
import { getVisualString } from 'bidi-js';
const arabicReshaper = require('arabic-reshaper');
import * as fs from 'fs';
import * as path from 'path';

function convertToArabicWords(num: number): string {
  const ones = [
    '', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة',
    'ستة', 'سبعة', 'ثمانية', 'تسعة'
  ];

  const tens = [
    '', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون',
    'ستون', 'سبعون', 'ثمانون', 'تسعون'
  ];

  const teens = [
    'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر',
    'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'
  ];

  if (num === 0) return 'صفر';
  if (num === 10) return 'عشرة';
  if (num === 11) return teens[0];
  if (num === 12) return teens[1];
  if (num > 12 && num < 20) return teens[num - 11];

  const ten = Math.floor(num / 10);
  const one = num % 10;

  if (one === 0) return tens[ten];
  return `${ones[one]} و${tens[ten]}`;
}



@Injectable()
export class OperateurDtwService {
  constructor(
    @InjectModel(Operateur.name) private OperateurModel: Model<Operateur>,
    @Inject(forwardRef(() => VehiclesService))
    private readonly vihiculeService: VehiclesService,
    @Inject(forwardRef(() => ChauffeursService))
    private readonly chauffeursService: ChauffeursService,
  ) { }

  async create(createOperateurDtwDto: CreateOperateurDtwDto) {
    const operateur = await this.OperateurModel.create(createOperateurDtwDto)
    return new ResponseBuilder()
      .setStatus(201)
      .setMessage('تم تسجيل المتعامل بنجاح')
      .setData(operateur)
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

    const data = await this.OperateurModel.find(query)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();

    const total = await this.OperateurModel.countDocuments(query).exec();

    return {
      total,
      limit,
      page: params.page || 1,
      data,
    };
  }



  async findOne(id: string) {
    const operateur = await this.OperateurModel.findById(id);
    const vihicules = []
    const chauffeurs = []
    const num_docier_client = operateur?.num_docier_client;
    const fullName_arabe = operateur?.fullName_arabe
    const vihicle = await this.vihiculeService.findVihiculeByOperateur(num_docier_client);
    vihicules.push(...vihicle);
    const chauffeur = await this.chauffeursService.findChauffeurByOperateur(fullName_arabe);
    chauffeurs.push(...chauffeur);
    console.log(chauffeurs);
    

    return {
      operateur,
      vihicules,
      chauffeurs
    }
  }

  async drawArabicText(page, text, x, y, font, size = 14) {
    const visual = getVisualString(text);
    page.drawText(visual, { x, y, font, size, color: rgb(0, 0, 0) });
  }

  async generatePDF(id: string): Promise<string> {
    const operateur = await this.OperateurModel.findById(id);
    const num_docier_client = operateur?.num_docier_client;
    const fullName_francais = operateur?.fullName_francais;

    const vihicules = await this.vihiculeService.findVihiculeByOperateur(num_docier_client);

    console.log(vihicules.length);

    if (!vihicules) {
      throw new BadRequestException(
        new ResponseBuilder()
          .setStatus(400)
          .setMessage('المركبات لا توجد')
          .setErrors({ _id: 'Invalid ObjectId format' })
          .build(),
      );
    }
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontPath = path.join(process.cwd(), 'dist', 'assets', 'fonts', 'Cairo-Bold.ttf');
    const customFont = await pdfDoc.embedFont(fs.readFileSync(fontPath));

    const page = pdfDoc.addPage([595, 842]); // A4 portrait

    // دالة لطباعة النص العربي من اليمين لليسار
    const drawArabic = (text: any, x: number, y: number, size = 14) => {
      let str: string;

      if (text instanceof Date) {
        const day = text.getDate().toString().padStart(2, '0');
        const month = (text.getMonth() + 1).toString().padStart(2, '0');
        const year = text.getFullYear();
        str = `${day}/${month}/${year}`;
      } else {
        str = text ? String(text) : '';
      }

      const reversed = str.split('').join('');
      const pageHeight = 842;
      const adjustedY = pageHeight - y;

      page.drawText(reversed, {
        x,
        y: adjustedY - size,
        font: customFont,
        size,
        color: rgb(0, 0, 0),
      });
    };

    // ✅ كتابة بيانات المشغل فقط في الصفحة الأولى
    drawArabic("عين الدفلة", 405, 90); // الولاية
    drawArabic(operateur?.fullName_arabe, 280, 200, 14); // الاسم الكامل
    drawArabic(operateur?.date_debut_activite, 260, 280); // تاريخ بداية النشاط
    drawArabic(operateur?.num_cate_enregistement, 450, 280); // رقم بطاقة التسجيل
    if (vihicules[0].font_type === "بين البلديات" || vihicules[0].font_type === "بين الولايات") {
      drawArabic(vihicules[0]?.point_depart, 350, 340); // نقطة الانطلاق
      drawArabic(vihicules[0]?.point_arrive, 350, 380); // نقطة الوصول
      drawArabic(vihicules[0]?.point_Traffic1, 350, 420); // نقطة الوصول
      drawArabic(vihicules[0]?.point_Traffic2, 250, 420); // نقطة الوصول
      drawArabic(vihicules[0]?.point_Traffic3, 150, 420); // نقطة الوصول
      drawArabic(vihicules[0]?.point_Traffic4, 50, 420); // نقطة الوصول
      drawArabic("21:00", 230, 540);
      drawArabic("5:00", 500, 540);
    }
    if (vihicules[0].font_type === "ريـفي") {
      drawArabic("", 350, 340);
      drawArabic(vihicules[0]?.point_depart, 200, 340);
      drawArabic(vihicules[0]?.point_arrive, 100, 340);
      drawArabic("5:00", 350, 390);
      drawArabic("22:00", 200, 390);
      drawArabic("06", 100, 390);
    }
    drawArabic(vihicules[0]?.point_Traffic1, 500, 490); // نقطة الوصول
    drawArabic(vihicules[0]?.point_Traffic2, 440, 490); // نقطة الوصول
    drawArabic(vihicules[0]?.point_Traffic3, 380, 490); // نقطة الوصول
    drawArabic(vihicules[0]?.point_Traffic4, 320, 490);
    drawArabic(vihicules[0]?.point_depart, 200, 490); // نقطة الانطلاق
    drawArabic(vihicules[0]?.point_arrive, 80, 490);

    if (vihicules.length === 1) {
      const [vehicule] = vihicules;

      if (vehicule.Number_of_seats !== undefined)
        drawArabic(vehicule.Number_of_seats.toString(), 50, 746);

      if (vehicule.Style)
        drawArabic(vehicule.Style, 100, 746);

      if (vehicule.type)
        drawArabic(vehicule.type, 200, 746);

      if (vehicule.category)
        drawArabic(vehicule.category, 300, 746);

      if (vehicule.num_bus_registration)
        drawArabic(vehicule.num_bus_registration, 400, 746);
    }

    if (vihicules[0].font_type === "بين البلديات" || vihicules[0].font_type === "بين الولايات") {
      drawArabic("عين الدفلة", 150, 777);
    }

    // ✅ في حالة وجود مركبات، أضف صفحة جديدة فيها الجدول
    if (vihicules.length > 1) {
      const page2 = pdfDoc.addPage([595, 842]);



      const tableStartY = 740;
      const rowHeight = 25;

      const headerX = [420, 330, 240, 160, 60];



      vihicules.forEach((v, index) => {
        const y = tableStartY - (rowHeight * (index + 1));
        page2.drawText(String(v.num_bus_registration || ''), { x: 420, y, size: 10, font: customFont });
        page2.drawText(String(v.category || ''), { x: 330, y, size: 10, font: customFont });
        page2.drawText(String(v.type || ''), { x: 240, y, size: 10, font: customFont });
        page2.drawText('حافلة', { x: 160, y, size: 10, font: customFont });
        page2.drawText(String(v.Number_of_seats || ''), { x: 60, y, size: 10, font: customFont });
      });

      const total = vihicules.length;
      const arabicNumber = convertToArabicWords(total); // دالة لتحويل الرقم إلى كلمات عربية
      page2.drawText(`${arabicNumber} (${total}) حافلة`, {
        x: 460,
        y: 150,
        size: 12,
        font: customFont,
      });

    }

    const pdfBytes = await pdfDoc.save();

    const outputPath = path.join(process.cwd(), 'dist', 'output', `vehicle-info.pdf`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, pdfBytes);

    return outputPath;
  }



  async update(id: string, updateOperateurDtwDto: UpdateOperateurDtwDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        new ResponseBuilder()
          .setStatus(400)
          .setMessage(`المعرف ${id} غير صالح`)
          .setErrors({ _id: 'Invalid ObjectId format' })
          .build(),
      );
    }

    const operateur = await this.OperateurModel.findByIdAndUpdate(
      id,
      { $set: updateOperateurDtwDto },
      {
        new: true,
        runValidators: true,
      },
    ).exec();

    if (!operateur) {
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
      .setData(operateur)
      .build();
  }


  async remove(id: string) {
    const operateur = await this.OperateurModel.findByIdAndDelete(id);

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


  async exportUsersToExcel(filterDto: any): Promise<string> {
    const query: any = {};

    if (filterDto.search && filterDto.search.trim()) {
      const searchRegex = { $regex: filterDto.search, $options: 'i' };
      query.$or = [
        { fullName_arabe: searchRegex },
        { fullName_francais: searchRegex },
      ];
    }
    const operateurs = await this.OperateurModel.find(query).lean();

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('المتعاملين');

    const exportDir = join(__dirname, '..', 'exports/operateurs');
    if (!existsSync(exportDir)) {
      mkdirSync(exportDir, { recursive: true });
    }

    const filePath = join(exportDir, 'Operateurs.xlsx');

    const titleRow = worksheet.addRow(['قائمة المتعاملين']);
    worksheet.addRow([])
    worksheet.mergeCells('A1:F1');
    titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
    titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E78' } };

    const headerRow = worksheet.addRow([
      'المعرف (ID)', 'رقم الولاية', 'رقم ملف المتعامل', 'اسم ولقب المتعامل (بالعربية)',
      'اسم ولقب المتعامل (بالفرنسية)', 'تاريخ انتهاء الصلاحية', 'تاريخ المقررة', 'رقم المقررة',
      'رقم بطاقة القيد', 'النشاط', 'العمود 1', 'طبيعة النشاط', 'العمود 2', 'حالة النشاط',
      'العمود 3', 'نوع المتعامل', 'العمود 4', 'شكل الشركة أو المؤسسة', 'اسم ولقب المسير',
      'رقم شهادة الميلاد', 'الرقم الوطني للتعريف (NIN)', 'تاريخ الميلاد', 'مكان الميلاد (بالعربية)',
      'مكان الميلاد (بالفرنسية)', 'اسم الأب (بالعربية)', 'اسم الأب (بالفرنسية)', 'اسم ولقب الأم (بالعربية)',
      'اسم ولقب الأم (بالفرنسية)', 'بلدية الميلاد (بالعربية)', 'بلدية الميلاد (بالفرنسية)', 'العنوان (بالعربية)',
      'العنوان (بالفرنسية)', 'بلدية العنوان (بالعربية)', 'بلدية العنوان (بالفرنسية)', 'رقم السجل التجاري',
      'الرقم الفرعي للسجل التجاري', 'تاريخ السجل التجاري', 'تاريخ تعديل السجل التجاري', 'تاريخ بدء النشاط',
      'رقم الانتساب إلى الصندوق الوطني للعمال غير الأجراء', 'حالة النشاط (متوقف أم لا)', 'نوع التوقف',
      'تاريخ التوقف المؤقت عن النشاط', 'تاريخ التوقف النهائي عن النشاط', 'رقم هاتف المتعامل',
      'المعني بالتحديث', 'ملاحظات رئيس المصلحة'
    ]);


    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } }; // خط أبيض
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0070C0' } }; // خلفية زرقاء
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    let id = 1;
    operateurs.forEach((op) => {
      const row = worksheet.addRow([
        id++, op.num_wilaya || "/", op.num_docier_client || "/", op.fullName_arabe || "/", op.fullName_francais || "/",
        op.date_expiration || "/", op.date_prévue || "/", op.num_dhoraire || "/", op.num_cate_enregistement || "/", op.activite || "/",
        op.colonne1 || "/", op.nature_activite || "/", op.colonne2 || "/", op.status_activite || "/", op.colonne3 || "/", op.type_client || "/",
        op.colonne4 || "/", op.institution_person_moral || "/", op.fullName_gerent_person_moral || "/", op.num_dacte_naissance || "/",
        op.num_didentification_national_NIN || "/", op.date_naissance || "/", op.lieu_naissance_arabe || "/", op.lieu_naissance_francais || "/",
        op.nom_pere_arabe || "/", op.nom_pere_francais || "/", op.fullName_mere_arabe || "/", op.fullName_mere_francais || "/",
        op.communes_naissance_arabe || "/", op.communes_naissance_francais || "/", op.address_arabe || "/",
        op.address_francais || "/", op.address_municipalité_arabe || "/", op.address_municipalité_francais || "/", op.num_registre_commerce || "/", op.num_registre_commerce_n5 || "/",
        op.hestoire_registre_commerce || "/", op.modifier_hestoire_registre_commerce || "/", op.date_debut_activite || "/",
        op.num_adherent_caise_national_non_salaire || "/", op.depend_activite || "/", op.type_depend || "/", op.date_arret_activite_temporaire || "/",
        op.date_arret_activite_permanent || "/", op.num_telephone_client || "/", op.soccupe || "/", op.note_chef_departement || "/"
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

  // احصائيات بعدد المسجلين في كل يوم بين تاريخين
  async getRegistrationStats(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59);
    console.log("Start Date:", startDate.toISOString());
    console.log("End Date:", endDate.toISOString());
    const data = await this.OperateurModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    console.log(data);

    return data.map(item => ({
      date: item._id,
      count: item.count
    }));
  }





  async findByVihicilesandChauffer(query: Record<string, any>) {
    console.log(query);

    const find = await this.OperateurModel.findOne(query);
    console.log(find);

    return find;
  }


}
