import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOperateurDto } from './dto/create-operateur-dtw.dto';
import { UpdateOperateurDtwDto } from './dto/update-operateur-dtw.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Operateur } from './operateur-dtw.schema';
import { Model, Types } from 'mongoose';
import { ResponseBuilder } from 'src/common/builder/response.builder';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { Workbook } from 'exceljs';
import { VehiclesService } from 'src/vehicles/vehicles.service';
import { ChauffeursService } from 'src/chauffeurs/chauffeurs.service';
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';
const fontkit = require('@pdf-lib/fontkit');
import { getVisualString } from 'bidi-js';
import * as fs from 'fs';
import * as path from 'path';
import { OperateurQueryBuilder } from 'src/common/builder/OperateurQueryBuilder';
import { Response } from 'express';

import { Document, Packer, Paragraph, TextRun } from 'docx';
import { promisify } from 'util';
function convertToArabicWords(number: number): string {
  const ones = [
    '',
    'واحد',
    'اثنان',
    'ثلاثة',
    'أربعة',
    'خمسة',
    'ستة',
    'سبعة',
    'ثمانية',
    'تسعة',
  ];
  const tens = [
    '',
    'عشرة',
    'عشرون',
    'ثلاثون',
    'أربعون',
    'خمسون',
    'ستون',
    'سبعون',
    'ثمانون',
    'تسعون',
  ];

  if (number === 0) return 'صفر';
  if (number < 10) return ones[number];
  if (number < 20) {
    if (number === 10) return 'عشرة';
    return ones[number - 10] + ' عشر';
  }
  if (number < 100) {
    const ten = Math.floor(number / 10);
    const one = number % 10;
    return (one ? ones[one] + ' و' : '') + tens[ten];
  }

  return number.toString(); // fallback للأعداد الكبيرة
}

type Alignment = 'left' | 'center' | 'right';

function drawAlignedText({
  page,
  text,
  y,
  font,
  fontSize,
  color = rgb(0, 0, 0),
  pageWidth,
  align = 'left',
  margin = 50,
}: {
  page: any;
  text: string;
  y: number;
  font: any;
  fontSize: number;
  color?: any;
  pageWidth: number;
  align?: Alignment;
  margin?: number;
}) {
  const textWidth = font.widthOfTextAtSize(text, fontSize);
  let x = margin;

  if (align === 'center') {
    x = (pageWidth - textWidth) / 2;
  } else if (align === 'right') {
    x = pageWidth - textWidth - margin;
  } else if (align === 'left') {
    x = margin;
  }

  page.drawText(text, {
    x,
    y,
    size: fontSize,
    font,
    color,
  });
}

function drawRetiredLinesTable(page, font, fontSize, data, startX, startY) {
  const rowHeight = 60;
  const columnWidths = [40, 120, 80, 90, 80, 45, 160]; // من اليمين لليسار
  const headers = [
    'الرقم',
    'الخط المستغل',
    'تاريخ الرخصة',
    'رقم تسجيل الشركة',
    'رقم التسليم',
    'المقاعد',
    'ملاحظـة',
  ];

  // رسم رأس الجدول
  let y = startY;
  let x = startX;
  for (let i = 0; i < headers.length; i++) {
    page.drawRectangle({
      x,
      y,
      width: columnWidths[i],
      height: rowHeight,
      borderWidth: 1,
    });

    page.drawText(headers[i], {
      x: x + 3,
      y: y + rowHeight - 15,
      font,
      size: fontSize,
    });

    x += columnWidths[i];
  }

  // رسم الصفوف
  y -= rowHeight;

  data.forEach((row, index) => {
    let x = startX;
    const values = [
      `${index + 1}`,
      row.line,
      row.licenseDate,
      row.companyCode,
      row.deliveryNumber,
      row.seats.toString(),
      row.note,
    ];

    for (let i = 0; i < values.length; i++) {
      page.drawRectangle({
        x,
        y,
        width: columnWidths[i],
        height: rowHeight,
        borderWidth: 1,
      });

      // تقسيم النص لعدة أسطر إذا لزم الأمر
      const lines = values[i].split('\n');
      lines.forEach((line, j) => {
        page.drawText(line, {
          x: x + 3,
          y: y + rowHeight - 15 - j * 12,
          font,
          size: fontSize,
        });
      });

      x += columnWidths[i];
    }

    y -= rowHeight;
  });
}

@Injectable()
export class OperateurDtwService {
  constructor(
    @InjectModel(Operateur.name) private OperateurModel: Model<Operateur>,
    @Inject(forwardRef(() => VehiclesService))
    private readonly vihiculeService: VehiclesService,
    @Inject(forwardRef(() => ChauffeursService))
    private readonly chauffeursService: ChauffeursService,
  ) {}

  async create(createOperateurDtwDto: CreateOperateurDto, res: Response) {
    try {
      // ✅ Validate input (NestJS ValidationPipe should already handle this)
      // If DTO validation fails, this won't even run.

      // Create the operateur in DB
      const operateur = await this.OperateurModel.create(createOperateurDtwDto);

      if (!operateur) {
        return res.status(404).json({
          message: 'لم يتم إنشاء المتعامل. يرجى التحقق من البيانات.',
        });
      }

      // Generate PDF after successful creation
      const filePath = await this.generatePDFCreated(
        operateur.fullName_arabe,
        operateur.address_arabe,
      );

      // Send PDF as download
      return res.download(filePath, 'Operateur-Static.pdf', (err) => {
        if (err) {
          console.error('❌ Error downloading PDF:', err);
          res.status(500).json({ message: 'حدث خطأ أثناء تحميل الملف' });
        }
      });
    } catch (error) {
      console.error('❌ Validation or Server Error:', error);

      // If validation error from DTO
      if (error?.response?.message) {
        return res.status(400).json({
          message: 'خطأ في البيانات المدخلة',
          errors: error, // this will contain all field errors
        });
      }

      // Fallback server error
      return res.status(500).json({
        message: 'حدث خطأ أثناء إنشاء المتعامل',
      });
    }
  }

  async findAll(params: any) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;

    const queryBuilder = new OperateurQueryBuilder()
      .setLimit(limit)
      .setSkip(page)
      .setSort(params.sort || 'asc')
      .setSearch(params.search);

    const { query, limit: finalLimit, skip, sort } = queryBuilder.build();

    const data = await this.OperateurModel.find(query)
      .limit(finalLimit)
      .skip(skip)
      .sort(sort)
      .exec();

    const total = await this.OperateurModel.countDocuments(query).exec();

    return {
      total,
      limit: finalLimit,
      page,
      data,
    };
  }

  async findOne(id: string) {
    const operateur = await this.OperateurModel.findById(id);
    const vihicules = [];
    const chauffeurs = [];
    const num_docier_client = operateur?.num_docier_client;
    const fullName_arabe = operateur?.fullName_arabe;
    const vihicle =
      await this.vihiculeService.findVihiculeByOperateur(num_docier_client);
    vihicules.push(...vihicle);
    const chauffeur =
      await this.chauffeursService.findChauffeurByOperateur(fullName_arabe);
    chauffeurs.push(...chauffeur);
    console.log(chauffeurs);

    return {
      operateur,
      vihicules,
      chauffeurs,
    };
  }

  async drawArabicText(page, text, x, y, font, size = 10) {
    const visual = getVisualString(text);
    page.drawText(visual, { x, y, font, size, color: rgb(0, 0, 0) });
  }

  async generatePDF(id: string): Promise<string> {
    const operateur = await this.OperateurModel.findById(id);
    const num_docier_client = operateur?.num_docier_client;
    const fullName_francais = operateur?.fullName_francais;

    const vihicules =
      await this.vihiculeService.findVihiculeByOperateur(num_docier_client);

    if (!vihicules || vihicules.length === 0) {
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

    const fontPath = path.join(
      process.cwd(),
      'dist',
      'assets',
      'fonts',
      'Cairo-Bold.ttf',
    );
    const customFont = await pdfDoc.embedFont(fs.readFileSync(fontPath));

    // /** 🖼️ تحميل صورة الخلفية للصفحة الأولى */
    // const bgPath1 = path.join(process.cwd(), 'dist', 'assets', 'rifiPdf.png');
    // if (!fs.existsSync(bgPath1)) {
    //   throw new Error(`❌ لم يتم العثور على الصورة: ${bgPath1}`);
    // }
    // const bgImage1 = await pdfDoc.embedPng(fs.readFileSync(bgPath1));

    // /** 🖼️ تحميل صورة الخلفية للصفحة الثانية */
    // const bgPath2 = path.join(process.cwd(), 'dist', 'assets', 'tablepdf.png');
    // if (!fs.existsSync(bgPath2)) {
    //   throw new Error(`❌ لم يتم العثور على الصورة: ${bgPath2}`);
    // }
    // const bgImage2 = await pdfDoc.embedPng(fs.readFileSync(bgPath2));

    /** 📄 الصفحة الأولى */
    const page1 = pdfDoc.addPage([595, 842]); // A4
    // const { width: w1, height: h1 } = page1.getSize();
    // page1.drawImage(bgImage1, { x: 0, y: 0, width: w1, height: h1 });

    // دالة لكتابة النص بالعربية في صفحة معينة
    const drawArabic = (
      page: any,
      text: any,
      x: number,
      y: number,
      size = 12,
    ) => {
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
      const adjustedY = 842 - y;

      page.drawText(reversed, {
        x,
        y: adjustedY - size,
        font: customFont,
        size,
        color: rgb(0, 0, 0),
      });
    };

    const firstVehicule = vihicules[0];

    if (
      firstVehicule.font_type === 'بين البلديات' ||
      firstVehicule.font_type === 'بين الولايات'
    ) {
      // ✅ كتابة بيانات المشغل في الصفحة الأولى
      drawArabic(page1, 'عين الدفلة', 380, 105, 14);
      drawArabic(page1, operateur?.fullName_arabe, 300, 215);
      drawArabic(page1, operateur?.date_debut_activite, 285, 307);
      drawArabic(page1, operateur?.num_cate_enregistement, 430, 307);
      drawArabic(page1, firstVehicule?.point_depart, 300, 353);
      drawArabic(page1, firstVehicule?.point_arrive, 320, 375);
      drawArabic(page1, firstVehicule?.point_Traffic1, 342, 400);
      drawArabic(page1, firstVehicule?.point_Traffic2, 270, 400);
      drawArabic(page1, firstVehicule?.point_Traffic3, 190, 400);
      drawArabic(page1, firstVehicule?.point_Traffic4, 110, 400);
      drawArabic(page1, '21:00', 255, 483);
      drawArabic(page1, '5:00', 500, 483);
    }

    if (firstVehicule.font_type === 'ريـفي' || firstVehicule.font_type === 'نقل حضري') {
      // ✅ كتابة بيانات المشغل في الصفحة الأولى
      drawArabic(page1, 'عين الدفلة', 380, 115, 14);
      drawArabic(page1, operateur?.fullName_arabe, 300, 235);
      drawArabic(page1, operateur?.date_debut_activite, 290, 328);
      drawArabic(page1, operateur?.num_cate_enregistement, 430, 328);
      drawArabic(page1, '', 350, 340);
      drawArabic(page1, firstVehicule?.point_depart, 200, 373);
      drawArabic(page1, firstVehicule?.point_arrive, 65, 373);
      drawArabic(page1, '5:00', 370, 398);
      drawArabic(page1, '22:00', 210, 398);
      drawArabic(page1, '06', 110, 398);

      drawArabic(page1, firstVehicule?.point_Traffic1, 490, 470);
      drawArabic(page1, firstVehicule?.point_Traffic2, 440, 470);
      drawArabic(page1, firstVehicule?.point_Traffic3, 380, 470);
      drawArabic(page1, firstVehicule?.point_Traffic4, 320, 470);
      drawArabic(page1, firstVehicule?.point_depart, 200, 470);
      drawArabic(page1, firstVehicule?.point_arrive, 80, 470);
    }

    if (vihicules.length === 1 && firstVehicule.font_type === 'ريـفي' || firstVehicule.font_type === 'نقل حضري') {
      const v = vihicules[0];
      if (v.Number_of_seats !== undefined)
        drawArabic(page1, v.Number_of_seats.toString(), 100, 620);
      if (v.Style) drawArabic(page1, v.Style, 175, 620);
      if (v.type) drawArabic(page1, v.type, 250, 620);
      if (v.category) drawArabic(page1, v.category, 315, 620);
      if (v.num_bus_registration)
        drawArabic(page1, v.num_bus_registration, 405, 620);
    }
    if (
      (vihicules.length === 1 && firstVehicule.font_type === 'بين البلديات') ||
      firstVehicule.font_type === 'بين الولايات'
    ) {
      const v = vihicules[0];
      if (v.Number_of_seats !== undefined)
        drawArabic(page1, v.Number_of_seats.toString(), 100, 627);
      if (v.Style) drawArabic(page1, v.Style, 175, 627);
      if (v.type) drawArabic(page1, v.type, 255, 627);
      if (v.category) drawArabic(page1, v.category, 325, 627);
      if (v.num_bus_registration)
        drawArabic(page1, v.num_bus_registration, 405, 627);
    }

    if (firstVehicule.font_type === 'ريـفي' || firstVehicule.font_type === 'نقل حضري') {
      drawArabic(page1, 'عين الدفلة', 200, 670);
    }
    if (
      firstVehicule.font_type === 'بين البلديات' ||
      firstVehicule.font_type === 'بين الولايات'
    ) {
      drawArabic(page1, 'عين الدفلة', 210, 660);
    }

    /** 📄 الصفحة الثانية (الجدول) */
    if (vihicules.length > 1) {
      const page2 = pdfDoc.addPage([595, 842]);
      // const { width: w2, height: h2 } = page2.getSize();
      // page2.drawImage(bgImage2, { x: 0, y: 0, width: w2, height: h2 });

      const tableStartY = 710;
      const rowHeight = 25;

      vihicules.forEach((v, index) => {
        const y = tableStartY - rowHeight * (index + 1);
        page2.drawText(String(v.num_bus_registration || ''), {
          x: 420,
          y,
          size: 10,
          font: customFont,
        });
        page2.drawText(String(v.category || ''), {
          x: 330,
          y,
          size: 10,
          font: customFont,
        });
        page2.drawText(String(v.type || ''), {
          x: 260,
          y,
          size: 10,
          font: customFont,
        });
        page2.drawText('حافلة', { x: 180, y, size: 10, font: customFont });
        page2.drawText(String(v.Number_of_seats || ''), {
          x: 100,
          y,
          size: 10,
          font: customFont,
        });
      });

      const total = vihicules.length;
      const arabicNumber = convertToArabicWords(total);
      page2.drawText(`${arabicNumber} (${total}) حافلة`, {
        x: 420,
        y: 150,
        size: 12,
        font: customFont,
      });
    }

    /** 💾 حفظ PDF */
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(
      process.cwd(),
      'dist',
      'output',
      `vehicle-info.pdf`,
    );
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
      'رقم ملف المتعامل',
      'اسم ولقب المتعامل (بالعربية)',
      'اسم ولقب المتعامل (بالفرنسية)',
      'تاريخ انتهاء الصلاحية',
      'تاريخ المقررة',
      'رقم المقررة',
      'رقم بطاقة القيد',
      'النشاط',
      'العمود 1',
      'طبيعة النشاط',
      'العمود 2',
      'حالة النشاط',
      'العمود 3',
      'نوع المتعامل',
      'العمود 4',
      'شكل الشركة أو المؤسسة',
      'اسم ولقب المسير',
      'رقم شهادة الميلاد',
      'الرقم الوطني للتعريف (NIN)',
      'تاريخ الميلاد',
      'مكان الميلاد (بالعربية)',
      'مكان الميلاد (بالفرنسية)',
      'اسم الأب (بالعربية)',
      'اسم الأب (بالفرنسية)',
      'اسم ولقب الأم (بالعربية)',
      'اسم ولقب الأم (بالفرنسية)',
      'بلدية الميلاد (بالعربية)',
      'بلدية الميلاد (بالفرنسية)',
      'العنوان (بالعربية)',
      'العنوان (بالفرنسية)',
      'بلدية العنوان (بالعربية)',
      'بلدية العنوان (بالفرنسية)',
      'رقم السجل التجاري',
      'الرقم الفرعي للسجل التجاري',
      'تاريخ السجل التجاري',
      'تاريخ تعديل السجل التجاري',
      'تاريخ بدء النشاط',
      'رقم الانتساب إلى الصندوق الوطني للعمال غير الأجراء',
      'حالة النشاط (متوقف أم لا)',
      'نوع التوقف',
      'تاريخ التوقف المؤقت عن النشاط',
      'تاريخ التوقف النهائي عن النشاط',
      'رقم هاتف المتعامل',
      'المعني بالتحديث',
      'ملاحظات رئيس المصلحة',
    ]);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } }; // خط أبيض
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0070C0' },
      }; // خلفية زرقاء
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
        id++,
        op.num_wilaya || '/',
        op.num_docier_client || '/',
        op.fullName_arabe || '/',
        op.fullName_francais || '/',
        op.date_expiration || '/',
        op.date_prévue || '/',
        op.num_dhoraire || '/',
        op.num_cate_enregistement || '/',
        op.activite || '/',
        op.colonne1 || '/',
        op.nature_activite || '/',
        op.colonne2 || '/',
        op.status_activite || '/',
        op.colonne3 || '/',
        op.type_client || '/',
        op.colonne4 || '/',
        op.institution_person_moral || '/',
        op.fullName_gerent_person_moral || '/',
        op.num_dacte_naissance || '/',
        op.num_didentification_national_NIN || '/',
        op.date_naissance || '/',
        op.lieu_naissance_arabe || '/',
        op.lieu_naissance_francais || '/',
        op.nom_pere_arabe || '/',
        op.nom_pere_francais || '/',
        op.fullName_mere_arabe || '/',
        op.fullName_mere_francais || '/',
        op.communes_naissance_arabe || '/',
        op.communes_naissance_francais || '/',
        op.address_arabe || '/',
        op.address_francais || '/',
        op.address_municipalité_arabe || '/',
        op.address_municipalité_francais || '/',
        op.num_registre_commerce || '/',
        op.num_registre_commerce_n5 || '/',
        op.hestoire_registre_commerce || '/',
        op.modifier_hestoire_registre_commerce || '/',
        op.date_debut_activite || '/',
        op.num_adherent_caise_national_non_salaire || '/',
        op.depend_activite || '/',
        op.type_depend || '/',
        op.date_arret_activite_temporaire || '/',
        op.date_arret_activite_permanent || '/',
        op.num_telephone_client || '/',
        op.soccupe || '/',
        op.note_chef_departement || '/',
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
    console.log('Start Date:', startDate.toISOString());
    console.log('End Date:', endDate.toISOString());
    const data = await this.OperateurModel.aggregate([
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

  async findByVihicilesandChauffer(query: Record<string, any>) {
    console.log(query);

    const find = await this.OperateurModel.findOne(query);
    console.log(find);

    return find;
  }

  async generatepdfs(id: string, res: Response) {
    const operateur = await this.OperateurModel.findById(id).lean();
    if (!operateur) throw new NotFoundException('الناقل غير موجود');
    const fullNameOperateur = operateur.fullName_francais;
    const chauffeur =
      await this.chauffeursService.findChauffeurByOperateur(fullNameOperateur);
    const num_op = operateur?.num_docier_client;
    const vihicles = await this.vihiculeService.findVihiculeByOperateur(num_op);
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const cairoBoldPath = path.join(
      __dirname,
      '..',
      'assets',
      'fonts',
      'Cairo-Bold.ttf',
    );
    const cairoSemiBoldPath = path.join(
      __dirname,
      '..',
      'assets',
      'fonts',
      'Cairo-SemiBold.ttf',
    );

    const cairoBoldFont = await pdfDoc.embedFont(
      fs.readFileSync(cairoBoldPath),
    );
    const cairoSemiBoldFont = await pdfDoc.embedFont(
      fs.readFileSync(cairoSemiBoldPath),
    );

    let page = pdfDoc.addPage([750, 842]);
    const { width, height } = page.getSize();

    const drawAlignedText = ({
      page,
      text,
      y,
      font,
      fontSize,
      align,
    }: {
      page: any;
      text: string;
      y: number;
      font: any;
      fontSize: number;
      align: 'left' | 'center' | 'right';
    }) => {
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      let x = 0;
      if (align === 'center') x = (page.getWidth() - textWidth) / 2;
      else if (align === 'right') x = page.getWidth() - textWidth - 30;
      else x = 30;
      page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
    };

    // HEADER
    drawAlignedText({
      page,
      text: 'الجمهورة الجزائرية الديمقراطية الشعبية',
      y: height - 25,
      font: cairoBoldFont,
      fontSize: 20,
      align: 'center',
    });
    // right
    const marginRight = 50; // مسافة من يمين الورقة
    const x = page.getWidth() - marginRight;

    const texts = [
      { text: 'وزارة النقل', font: cairoSemiBoldFont, fontSize: 16 },
      { text: 'مديرية النقل', font: cairoSemiBoldFont, fontSize: 16 },
      { text: 'لولاية عين الدفلة', font: cairoSemiBoldFont, fontSize: 16 },
      { text: 'مصلحة النقل البري', font: cairoSemiBoldFont, fontSize: 16 },
      { text: 'مكتب نقل المسافرين', font: cairoSemiBoldFont, fontSize: 16 },
    ];

    texts.forEach((t, i) => {
      page.drawText(t.text, {
        x: x - t.font.widthOfTextAtSize(t.text, t.fontSize), // يمين مضبوط
        y: height - 25 - i * 20,
        size: t.fontSize,
        font: t.font,
        color: rgb(0, 0, 0),
      });
    });

    // CENTERED TITLE
    drawAlignedText({
      page,
      text: 'بطاقة تقنية للناقل',
      y: height - 160,
      font: cairoBoldFont,
      fontSize: 16,
      align: 'center',
    });

    // INFO BLOCKS — you should replace these hardcoded values with data from `operateur`
    const info = {
      registerNumber: '17',
      activityStartDate: '10/11/1990',
      lastName: 'مراح',
      firstName: 'امحمد',
      phone: '0794560554',
      company: '/',
      birthDate: '02/12/1958',
      birthPlace: 'برج الامير خالد',
      fatherName: 'محمد',
      address: 'شارع جيش التحرير بئر ولد خليفة',
      commerceRegister: '3817409 A99',
      commerceRegisterDate: '10/11/1990',
      exploitationNumber: '673',
      exploitationDate: '10/11/1990',
      date: '14/07/2025',
    };
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

    const fullNameChauffeur = chauffeur[0].nom_prenom_chauffeur?.trim() || '';
    const nameParts = fullNameChauffeur.split(' ');

    const lastNameChauffeur = nameParts
      .slice(0, nameParts.length - 1)
      .join(' '); // "بن عيسى"
    const firstNameChauffeur = nameParts[nameParts.length - 1];
    // INFO DISPLAY
    drawAlignedText({
      page,
      text: `عين الدفلة في : ${formatDate(Date.now(), true)}`,
      y: height - 80,
      font: cairoSemiBoldFont,
      fontSize: 16,
      align: 'left',
    });
    drawAlignedText({
      page,
      text: `رقم القيد في سجل الناقلين العموميين لاشخاص  : ${chauffeur[0]?.num_enregistrement_du_transporteur}`,
      y: height - 200,
      font: cairoSemiBoldFont,
      fontSize: 16,
      align: 'right',
    });
    drawAlignedText({
      page,
      text: `تاريخ بداية النشاط : ${formatDate(operateur.date_debut_activite, true)}`,
      y: height - 200,
      font: cairoSemiBoldFont,
      fontSize: 16,
      align: 'left',
    });

    drawAlignedText({
      page,
      text: `لقب الناقل : ${lastNameChauffeur}`,
      y: height - 230,
      font: cairoSemiBoldFont,
      fontSize: 16,
      align: 'right',
    });
    drawAlignedText({
      page,
      text: `اسم الناقل : ${firstNameChauffeur}`,
      y: height - 230,
      font: cairoSemiBoldFont,
      fontSize: 16,
      align: 'center',
    });
    drawAlignedText({
      page,
      text: `رقم الهاتف : ${operateur.num_telephone_client ? operateur.num_telephone_client : '/'}`,
      y: height - 230,
      font: cairoSemiBoldFont,
      fontSize: 16,
      align: 'left',
    });

    drawAlignedText({
      page,
      text: `الشركة : ${info.company}`,
      y: height - 260,
      font: cairoSemiBoldFont,
      fontSize: 16,
      align: 'right',
    });

    drawAlignedText({
      page,
      text: `تاريخ الميلاد : ${formatDate(operateur.date_naissance, true)}`,
      y: height - 290,
      font: cairoSemiBoldFont,
      fontSize: 16,
      align: 'right',
    });
    drawAlignedText({
      page,
      text: `مكان الميلاد  : ${operateur.lieu_naissance_arabe}`,
      y: height - 290,
      font: cairoSemiBoldFont,
      fontSize: 16,
      align: 'center',
    });
    drawAlignedText({
      page,
      text: `اسم الاب : ${operateur.nom_pere_arabe}`,
      y: height - 290,
      font: cairoSemiBoldFont,
      fontSize: 16,
      align: 'left',
    });

    drawAlignedText({
      page,
      text: `العنوان او المقر الاجتماعي : ${operateur.address_arabe}`,
      y: height - 320,
      font: cairoSemiBoldFont,
      fontSize: 16,
      align: 'right',
    });
    drawAlignedText({
      page,
      text: `رقم السجل التجاري  : ${operateur.num_registre_commerce}`,
      y: height - 350,
      font: cairoSemiBoldFont,
      fontSize: 16,
      align: 'right',
    });
    drawAlignedText({
      page,
      text: `تاريخ السجل التجاري  : ${formatDate(operateur.hestoire_registre_commerce, true)}`,
      y: height - 350,
      font: cairoSemiBoldFont,
      fontSize: 16,
      align: 'left',
    });
    drawAlignedText({
      page,
      text: `مقر الاستغلال رقم   : ${operateur.num_dhoraire}`,
      y: height - 380,
      font: cairoSemiBoldFont,
      fontSize: 16,
      align: 'right',
    });
    drawAlignedText({
      page,
      text: `بتاريخ  : ${formatDate(operateur.date_prévue, true)}`,
      y: height - 380,
      font: cairoSemiBoldFont,
      fontSize: 16,
      align: 'left',
    });

    // TABLE
    // رأس الجدول
    const tableHeader = [
      'الرقم',
      'الخط المستغل',
      'تاريخ الرخصة',
      'رقم تسجيل المركبة',
      'الرقم التسلسلي',
      'المقاعد',
      'ملاحظة',
    ];

    // تحويل المركبات لصفوف
    const excludedLines: string[][] = vihicles.map((v, i) => [
      String(i + 1),
      `${v.point_depart} - ${v.point_arrive}`,
      formatDate(v.driving_license_history),
      String(v.num_bus_registration),
      String(v.font_symbol),
      String(v.Number_of_seats),
      v.font_type === 'نقل المدري' ? String(v.note_chef_departement || '') : '',
    ]);

    // تعريف عرض الأعمدة
    const columnWidths = [110, 50, 100, 130, 90, 170, 40]; // من اليمين لليسار
    const tableTotalWidth = columnWidths.reduce((sum, w) => sum + w, 0);
    const startX = (page.getWidth() - tableTotalWidth) / 2;

    /**
     * دالة لرسم جدول واحد وإرجاع آخر Y بعد الانتهاء
     */
    const drawTable = (
      pdfDoc,
      page,
      title: string,
      startX: number,
      startY: number,
      rowHeight: number,
      header: string[],
      rows: string[][],
      font: PDFFont,
      fontSize: number,
      columnWidths: number[],
    ): { page: PDFPage; y: number } => {
      let tableY = startY;
      let rowIndex = 0;
      const totalRows = rows.length + 1; // الهيدر + الصفوف

      const drawHeader = (page, y) => {
        drawAlignedText({
          page,
          text: title,
          y,
          font: cairoBoldFont,
          fontSize: 16,
          align: 'center',
        });
        return y - 30;
      };

      // رسم العنوان لأول مرة
      tableY = drawHeader(page, tableY);

      while (rowIndex < totalRows) {
        const y = tableY - rowHeight;

        // 🔥 لو ما بقاش مكان نضيف صفحة جديدة
        if (y < 100) {
          page = pdfDoc.addPage([750, 842]);
          tableY = page.getHeight() - 50;

          // نرسم العنوان مرة ثانية
          tableY = drawHeader(page, tableY);
        }

        // رسم المستطيل الخارجي للصف
        page.drawRectangle({
          x: startX,
          y: tableY - rowHeight,
          width: tableTotalWidth,
          height: rowHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 0.5,
        });

        let x = startX;

        // رسم الأعمدة
        for (let colIndex = 0; colIndex < columnWidths.length; colIndex++) {
          const colWidth = columnWidths[colIndex];
          const text =
            rowIndex === 0
              ? header[header.length - 1 - colIndex]
              : rows[rowIndex - 1][header.length - 1 - colIndex];

          const textWidth = font.widthOfTextAtSize(text, fontSize);
          const maxTextWidth = colWidth - 10;

          const safeText =
            textWidth > maxTextWidth
              ? text.slice(
                  0,
                  Math.floor((maxTextWidth / textWidth) * text.length),
                ) + '…'
              : text;

          const textX =
            x + colWidth - font.widthOfTextAtSize(safeText, fontSize) - 5;
          const textY = tableY - rowHeight / 2 + fontSize / 2 - 2;

          page.drawText(safeText, {
            x: textX,
            y: textY,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });

          x += colWidth;
        }

        tableY -= rowHeight;
        rowIndex++;
      }

      return { page, y: tableY - 30 };
    };

    // ---------------------------
    // استدعاء عدة جداول
    // ---------------------------

    // البداية من أعلى الصفحة
    let nextY = height - 450;

    ({ page, y: nextY } = drawTable(
      pdfDoc,
      page,
      'الخطوط المستثناة',
      startX,
      nextY,
      48,
      tableHeader,
      excludedLines,
      cairoSemiBoldFont,
      12,
      columnWidths,
    ));

    const workerLines = vihicles
      .map((v, i) => [
        String(i + 1),
        `${v.point_depart} - ${v.point_arrive}`,
        formatDate(v.driving_license_history),
        String(v.num_bus_registration),
        String(v.font_symbol),
        String(v.Number_of_seats),
        v.font_type === 'نقل العمال'
          ? String(v.note_chef_departement || '')
          : '',
      ])
      .filter((row) => row[6] !== ''); // keep only rows where font_type === "نقل العمال"

    if (workerLines.length > 0) {
      ({ page, y: nextY } = drawTable(
        pdfDoc,
        page,
        'نقل العمال',
        startX,
        nextY,
        48,
        tableHeader,
        workerLines,
        cairoSemiBoldFont,
        12,
        columnWidths,
      ));
    }

    // Save and send response
    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=operateur.pdf');
    res.send(Buffer.from(pdfBytes));
  }

  //find name and address word
  // async generatePdf(res: Response, id: String) {
  //   const operateur = await this.OperateurModel.findById(id);
  //   if (!operateur) {
  //     throw new NotFoundException('لم يتم العثور على المتعامل');
  //   }
  //   const pdfDoc = await PDFDocument.create();
  //   pdfDoc.registerFontkit(fontkit);

  //   // تحميل الخط العربي
  //   const fontPath = path.join(
  //     __dirname,
  //     '..',
  //     'assets',
  //     'fonts',
  //     'Cairo-Bold.ttf',
  //   );
  //   const fontBytes = fs.readFileSync(fontPath);
  //   const customFont = await pdfDoc.embedFont(fontBytes);

  //   // إنشاء صفحة جديدة A4
  //   const page = pdfDoc.addPage([595, 842]);
  //   const { width, height } = page.getSize();

  //   // ✅ تحميل صورة الخلفية
  //   // const backgroundPath = path.join(
  //   //   process.cwd(),
  //   //   'src',
  //   //   'assets',
  //   //   'background.jpg',
  //   // );
  //   // const backgroundBytes = fs.readFileSync(backgroundPath);
  //   // const backgroundImage = await pdfDoc.embedJpg(backgroundBytes);

  //   // ✅ رسم الصورة لتغطي الصفحة بالكامل
  //   page.drawImage(backgroundImage, {
  //     x: 0,
  //     y: 0,
  //     width,
  //     height,
  //   });

  //   // 🔁 دالة لعكس ترتيب الكلمات فقط (مش الحروف)
  //   const reverseWords = (text: string) =>
  //     text ? text.split(' ').reverse().join(' ') : '';

  //   // 🖋️ كتابة اسم / لقب المتعامل
  //   page.drawText(reverseWords(`${operateur.fullName_arabe}`), {
  //     x: 420, // أقرب لليسار
  //     y: 410,
  //     size: 14,
  //     font: customFont,
  //     color: rgb(0, 0, 0),
  //   });

  //   // 🏠 كتابة العنوان
  //   page.drawText(reverseWords(`${operateur.address_arabe}`), {
  //     x: 400,
  //     y: 380,
  //     size: 14,
  //     font: customFont,
  //     color: rgb(0, 0, 0),
  //   });

  //   // 📄 تجهيز الملف للإرسال
  //   const pdfBytes = await pdfDoc.save();

  //   res.set({
  //     'Content-Type': 'application/pdf',
  //     'Content-Disposition': 'inline; filename=transport.pdf',
  //     'Content-Length': pdfBytes.length,
  //   });

  //   res.end(Buffer.from(pdfBytes));
  // }
  async generatePdf(res: Response, id: string) {
    // ✅ جلب المتعامل من قاعدة البيانات
    const operateur = await this.OperateurModel.findById(id);
    if (!operateur) {
      throw new NotFoundException('لم يتم العثور على المتعامل');
    }

    // ✅ إنشاء ملف PDF جديد
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // ✅ تحميل الخط العربي
    const fontPath = path.join(
      __dirname,
      '..',
      'assets',
      'fonts',
      'Cairo-Bold.ttf',
    );
    const fontBytes = fs.readFileSync(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes);

    // ✅ إنشاء صفحة جديدة A4
    const page = pdfDoc.addPage([595, 842]);

    // 🔁 دالة لعكس ترتيب الكلمات فقط (مش الحروف)
    const reverseWords = (text: string) =>
      text ? text.split(' ').reverse().join(' ') : '';

    // 🖋️ كتابة اسم / لقب المتعامل
    page.drawText(reverseWords(`${operateur.fullName_arabe || ''}`), {
      x: 420,
      y: 410,
      size: 14,
      font: customFont,
      color: rgb(0, 0, 0),
    });

    // 🏠 كتابة العنوان
    page.drawText(reverseWords(`${operateur.address_arabe || ''}`), {
      x: 400,
      y: 380,
      size: 14,
      font: customFont,
      color: rgb(0, 0, 0),
    });

    // 📄 تجهيز الملف للإرسال
    const pdfBytes = await pdfDoc.save();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=transport.pdf',
      'Content-Length': pdfBytes.length,
    });

    res.end(Buffer.from(pdfBytes));
  }

  async generatePDFCreated(
    fullName_arabe: string,
    address_arabe: string,
  ): Promise<string> {
    // إنشاء PDF جديد
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // تحميل الخط العربي
    const fontPath = path.join(
      process.cwd(),
      'dist',
      'assets',
      'fonts',
      'Cairo-Bold.ttf',
    );
    const customFont = await pdfDoc.embedFont(fs.readFileSync(fontPath));

    // إنشاء صفحة A4
    const page = pdfDoc.addPage([595, 842]);

    // دالة لكتابة النص بالعربية (من اليمين لليسار)
    const drawArabic = (text: string, x: number, y: number, size = 14) => {
      const adjustedY = 842 - y;
      page.drawText(text, {
        x,
        y: adjustedY - size,
        font: customFont,
        size,
        color: rgb(0, 0, 0),
      });
    };

    // ---------------------------
    // 📝 المحتوى الثابت + الديناميكي
    // ---------------------------

    drawArabic('2022/06/19', 60, 198, 12);
    drawArabic('سليم فرحات', 95, 217, 12);
    drawArabic('عين الدفلى', 90, 262, 12);

    // البيانات القادمة من قاعدة البيانات
    drawArabic(fullName_arabe || 'غير معروف', 297, 412, 16);
    drawArabic(address_arabe || 'بدون عنوان', 354, 462, 14);

    drawArabic('خدمة', 420, 514, 14);
    drawArabic('عين الدفلى', 90, 670, 10);

    // ---------------------------
    // 💾 حفظ PDF مؤقتًا
    // ---------------------------

    const pdfBytes = await pdfDoc.save();
    const outputDir = path.join(process.cwd(), 'dist', 'output');
    fs.mkdirSync(outputDir, { recursive: true });

    const fileName = `Operateur-${fullName_arabe || 'Static'}.pdf`;
    const outputPath = path.join(outputDir, fileName);

    fs.writeFileSync(outputPath, pdfBytes);

    // ---------------------------
    // 📤 إرسال الملف مباشرة إلى الـ Frontend
    // ---------------------------

    return outputPath;
  }

  async findOperateurByNumClient(num_client: number) {
    return await this.OperateurModel.find({ num_docier_client: num_client });
  }
}
