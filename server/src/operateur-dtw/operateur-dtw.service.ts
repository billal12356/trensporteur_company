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
import * as XLSX from 'xlsx';
import { OperateurQueryBuilder } from 'src/common/builder/OperateurQueryBuilder';
import { Response } from 'express';

import { convertToArabicWords, drawAlignedText, drawRetiredLinesTable, drawArabicReversed } from 'src/common/utils/pdf-utils';

import { Document, Packer, Paragraph, TextRun } from 'docx';
import { promisify } from 'util';
// PDF utilities (convertToArabicWords, drawAlignedText, drawRetiredLinesTable, drawArabicReversed)
// are implemented in src/common/utils/pdf-utils.ts and imported above.

@Injectable()
export class OperateurDtwService {
  constructor(
    @InjectModel(Operateur.name) private OperateurModel: Model<Operateur>,
    @Inject(forwardRef(() => VehiclesService))
    private readonly vihiculeService: VehiclesService,
    @Inject(forwardRef(() => ChauffeursService))
    private readonly chauffeursService: ChauffeursService,
  ) { }

  async create(createOperateurDtwDto: CreateOperateurDto, res: Response) {
    try {
      // ✅ Validate input (NestJS ValidationPipe should already handle this)
      // If DTO validation fails, this won't even run.

      // Create the operateur in DB
      const operateur = await this.OperateurModel.create(createOperateurDtwDto);

      console.log("operateur", operateur)
      if (!operateur) {
        return res.status(404).json({
          message: 'لم يتم إنشاء المتعامل. يرجى التحقق من البيانات.',
        });
      }

      // Generate PDF after successful creation
      // const filePath = await this.generatePDFCreated(
      //   operateur.fullName_arabe,
      //   operateur.address_arabe,
      // );

      // // Send PDF as download
      // return res.download(filePath, 'Operateur-Static.pdf', (err) => {
      //   if (err) {
      //     console.error('❌ Error downloading PDF:', err);
      //     res.status(500).json({ message: 'حدث خطأ أثناء تحميل الملف' });
      //   }
      // });

      return new ResponseBuilder()
        .setStatus(201)
        .setMessage('تم تسجيل المتعامل بنجاح')
        .setData(operateur)
        .build();
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
    console.log("fullName_arabe", fullName_arabe)
    const vihicle =
      await this.vihiculeService.findVihiculeByOperateur(num_docier_client);
    vihicules.push(...vihicle);
    const chauffeur =
      await this.chauffeursService.findChauffeurByOperateur(fullName_arabe);
    console.log("chauffeur", chauffeur)
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

  async generatePDF(id: string, vehicleIds?: string[]): Promise<string> {
    const operateur = await this.OperateurModel.findById(id);
    const num_docier_client = operateur?.num_docier_client;
    const fullName_francais = operateur?.fullName_francais;

    let vihicules =
      await this.vihiculeService.findVihiculeByOperateur(num_docier_client);

    // ✅ Filter by selected vehicle IDs (if provided)
    if (vehicleIds && vehicleIds.length > 0) {
      vihicules = vihicules.filter((v) =>
        vehicleIds.includes(v._id.toString()),
      );
      console.log("vihicules", vihicules)
    }

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

    const firstVehicule = vihicules.filter((v) =>
      v.font_type !== 'نقل مدرسي' && v.font_type !== 'نقل العمال'
    )[0];
    if (
      firstVehicule.font_type === 'بين البلديات' ||
      firstVehicule.font_type === 'بين الولايات'
    ) {
      // ✅ كتابة بيانات المشغل في الصفحة الأولى
      drawArabic(page1, 'عين الدفلة', 380, 105, 14);
      drawArabic(page1, operateur?.fullName_arabe, 300, 215);
      drawArabic(page1, operateur?.date_debut_activite, 285, 315);
      drawArabic(page1, operateur?.num_cate_enregistement, 430, 315);
      drawArabic(page1, firstVehicule?.point_depart, 300, 360);
      drawArabic(page1, firstVehicule?.point_arrive, 320, 382);
      drawArabic(page1, firstVehicule?.point_Traffic1, 342, 415);
      drawArabic(page1, firstVehicule?.point_Traffic2, 270, 415);
      drawArabic(page1, firstVehicule?.point_Traffic3, 190, 415);
      drawArabic(page1, firstVehicule?.point_Traffic4, 110, 415);
      drawArabic(page1, '21:00', 255, 490);
      drawArabic(page1, '5:00', 515, 490);
    }

    if (
      firstVehicule.font_type === 'ريـفي' ||
      firstVehicule.font_type === 'حضري او شبه حضري'
    ) {
      // ✅ كتابة بيانات المشغل في الصفحة الأولى
      drawArabic(page1, 'عين الدفلة', 380, 115, 14);
      drawArabic(page1, operateur?.fullName_arabe, 290, 235);
      drawArabic(page1, operateur?.date_debut_activite, 290, 328);
      drawArabic(page1, operateur?.num_cate_enregistement, 430, 328);
      drawArabic(page1, '', 350, 340);
      drawArabic(page1, firstVehicule?.point_depart, 200, 373);
      drawArabic(page1, firstVehicule?.point_arrive, 65, 373);
      drawArabic(page1, '5:00', 370, 398);
      drawArabic(page1, '22:00', 210, 398);
      drawArabic(page1, '06', 110, 398);

      drawArabic(page1, firstVehicule?.point_Traffic1, 490, 470, 10);
      drawArabic(page1, firstVehicule?.point_Traffic2, 440, 470, 10);
      drawArabic(page1, firstVehicule?.point_Traffic3, 380, 470, 10);
      drawArabic(page1, firstVehicule?.point_Traffic4, 320, 470, 10);
      drawArabic(page1, firstVehicule?.point_depart, 220, 470);
      drawArabic(page1, firstVehicule?.point_arrive, 90, 470);
    }

    if (
      firstVehicule.font_type === 'ريـفي' ||
      firstVehicule.font_type === 'حضري او شبه حضري'
    ) {
      const v = vihicules[0];
      if (v.Number_of_seats !== undefined)
        drawArabic(page1, v.Number_of_seats.toString(), 90, 620);
      if (v.Style) drawArabic(page1, v.Style, 173, 620);
      if (v.type) drawArabic(page1, v.type, 240, 620);
      if (v.category) drawArabic(page1, v.category, 325, 620);
      if (v.num_bus_registration)
        drawArabic(page1, v.num_bus_registration, 420, 620);
    }
    if (
      firstVehicule.font_type === 'بين البلديات' ||
      firstVehicule.font_type === 'بين الولايات'
    ) {
      const v = vihicules[0];
      if (v.Number_of_seats !== undefined)
        drawArabic(page1, v.Number_of_seats.toString(), 80, 640);
      if (v.Style) drawArabic(page1, v.Style, 175, 640);
      if (v.type) drawArabic(page1, v.type, 250, 640);
      if (v.category) drawArabic(page1, v.category, 335, 640);
      if (v.num_bus_registration)
        drawArabic(page1, v.num_bus_registration, 420, 640);
    }

    if (
      firstVehicule.font_type === 'ريـفي' ||
      firstVehicule.font_type === 'حضري او شبه حضري'
    ) {
      drawArabic(page1, 'عين الدفلة', 200, 670);
    }
    if (
      firstVehicule.font_type === 'بين البلديات' ||
      firstVehicule.font_type === 'بين الولايات'
    ) {
      drawArabic(page1, 'عين الدفلة', 205, 680);
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

    /** 🔹 Remove undefined values */
    const updateData = { ...updateOperateurDtwDto };
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    /** 🔹 Check if there's data to update */
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException(
        new ResponseBuilder()
          .setStatus(400)
          .setMessage('لا توجد بيانات للتحديث')
          .setErrors({ update: 'No fields provided for update' })
          .build(),
      );
    }

    const operateur = await this.OperateurModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: false, // ✅ Disable required field validation
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

  async removeAll() {
    const result = await this.OperateurModel.deleteMany({});
    return {
      message: `✅ Deleted ${result.deletedCount} opérateurs.`,
    };
  }

  async exportUsersToExcel(filterDto: any): Promise<string> {
    const query: any = {};

    console.log("filterDto", filterDto)
    if (filterDto.search && filterDto.search.trim()) {
      // Use the same robust search logic as findAll
      const orConditions: any[] = [
        { fullName_arabe: new RegExp(filterDto.search, 'i') },
        { fullName_francais: new RegExp(filterDto.search, 'i') },
        { activite: new RegExp(filterDto.search, 'i') },
        { nature_activite: new RegExp(filterDto.search, 'i') },
        { status_activite: new RegExp(filterDto.search, 'i') },
        { type_client: new RegExp(filterDto.search, 'i') },
        { address_arabe: new RegExp(filterDto.search, 'i') },
        { address_francais: new RegExp(filterDto.search, 'i') },
        { nom_pere_arabe: new RegExp(filterDto.search, 'i') },
        { nom_pere_francais: new RegExp(filterDto.search, 'i') },
        { fullName_mere_arabe: new RegExp(filterDto.search, 'i') },
        { fullName_mere_francais: new RegExp(filterDto.search, 'i') },
        { num_registre_commerce: new RegExp(filterDto.search, 'i') },
        // numeric fields are matched as numbers below when the search is numeric
      ];

      // If search is numeric, also match by exact number
      if (!isNaN(Number(filterDto.search))) {
        orConditions.push({ num_docier_client: Number(filterDto.search) });
        orConditions.push({ num_dhoraire: Number(filterDto.search) });
        orConditions.push({ num_wilaya: Number(filterDto.search) });
        orConditions.push({ num_dacte_naissance: Number(filterDto.search) });
        orConditions.push({ num_didentification_national_NIN: Number(filterDto.search) });
      }

      query.$or = orConditions;
    }
    console.log("query", query)
    const operateurs = await this.OperateurModel.find(query).lean();

    console.log("operateurs", operateurs)
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('المتعاملين');

    // Set the worksheet to display from right to left
    worksheet.views = [
      { rightToLeft: true },
    ];

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
    // Ensure num_didentification_national_NIN is treated as text in Excel
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
        `${op.num_didentification_national_NIN || '/'}`, // Format as text
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
    const fullNameOperateur = operateur.fullName_arabe;
    const chauffeur =
      await this.chauffeursService.findChauffeurByOperateur(fullNameOperateur);
    if (!chauffeur || chauffeur.length === 0) {
      throw new NotFoundException('لا يوجد سائق مرتبط بهذا المتعامل');
    }
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

    // INFO BLOCKS
    const info = {
      company: '/',
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

    const fullNameChauffeur =
      chauffeur[0].nom_prenom_chauffeur?.trim() || 'غير محدد';
    const nameParts = fullNameChauffeur.split(' ');

    const lastNameChauffeur = nameParts
      .slice(0, nameParts.length - 1)
      .join(' ');
    const firstNameChauffeur = nameParts[nameParts.length - 1];

    // INFO DISPLAY
    const infoTop = height - 180;
    const infoBottom = height - 400;
    const infoLeft = 40;
    const infoRight = width - 40;

    console.log("operateur.num_registre_commerce",operateur.num_registre_commerce)
    // Draw info section border
    page.drawLine({ start: { x: infoLeft, y: infoTop }, end: { x: infoRight, y: infoTop }, thickness: 1 });
    page.drawLine({ start: { x: infoLeft, y: infoBottom }, end: { x: infoRight, y: infoBottom }, thickness: 1 });
    page.drawLine({ start: { x: infoLeft, y: infoTop }, end: { x: infoLeft, y: infoBottom }, thickness: 1 });
    page.drawLine({ start: { x: infoRight, y: infoTop }, end: { x: infoRight, y: infoBottom }, thickness: 1 });

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


    //please add ملاحظة here with another text in flex

    // Adding ملاحظة with another text in a flex layout
    drawAlignedText({
      page,
      text: `ملاحظة: ${('إعلان رقم 01 بتاريخ 07/12/2022')}`,
      y: height - 430,
      font: cairoSemiBoldFont,
      fontSize: 16,
      align: 'right',
    });

    // TABLES - Filter vehicles by type
    const schoolVehicles = vihicles.filter(v => v.font_type === 'نقل مدرسي');
    const workerVehicles = vihicles.filter(v => v.font_type === 'نقل العمال');

    // TABLE HEADERS
    const tableHeaderWithObservation = [
      'الرقم',
      'الخط المستغل',
      'تاريخ الرخصة',
      'رقم تسجيل المركبة',
      'الرقم التسلسلي',
      'المقاعد',
      'ملاحظة',
    ];

    const tableHeaderWithoutObservation = [
      'الرقم',
      'الخط المستغل',
      'تاريخ الرخصة',
      'رقم تسجيل المركبة',
      'الرقم التسلسلي',
      'المقاعد',
    ];

    function wrapText(text, font, fontSize, maxWidth) {
      if (!text) return [''];

      const words = text.split(' ');
      const lines = [];
      let line = '';

      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, fontSize);

        if (width <= maxWidth) {
          line = testLine;
        } else {
          if (line) lines.push(line);
          line = word;
        }
      }

      if (line) lines.push(line);
      return lines;
    }

    /**
     * دالة لرسم جدول واحد وإرجاع آخر Y بعد الانتهاء
     */
    const drawTable = (
      pdfDoc,
      page,
      title: string,
      _startX: number, // ignored
      startY: number = 710, // Use the adjusted starting Y position
      rowHeight: number,
      header: string[],
      rows: string[][],
      font: PDFFont,
      fontSize: number,
      columnWidths: number[],
    ): { page: PDFPage; y: number } => {

      // ===== PAGE SETUP =====
      const pageWidth = page.getWidth();
      const leftMargin = 40;
      const rightMargin = 40;
      const usableWidth = pageWidth - leftMargin - rightMargin;
      const tableStartX = leftMargin;

      let tableY = startY;
      let rowIndex = 0;
      const totalRows = rows.length + 1;
      let headerDrawn = false;

      // ===== SCALE COLUMNS =====
      const originalTotal = columnWidths.reduce((s, w) => s + w, 0);
      const scaledWidths = columnWidths.map(
        w => (w / originalTotal) * usableWidth
      );
      const tableTotalWidth = usableWidth;

      // ===== TITLE =====
      const drawHeader = (page, y) => {
        if (!headerDrawn) {
          drawAlignedText({
            page,
            text: title,
            y,
            font: cairoBoldFont,
            fontSize: 16,
            align: 'center',
          });
          headerDrawn = true;
          return y - 30;
        }
        return y;
      };

      tableY = drawHeader(page, tableY);

      // ===== TABLE LOOP =====
      while (rowIndex < totalRows) {

        const extraFontSize = fontSize - 4;

        // Calculate dynamic row height based on content
        let maxLines = 1;
        if (rowIndex > 0) {
          const dataRow = rows[rowIndex - 1];
          for (let colIndex = 0; colIndex < scaledWidths.length; colIndex++) {
            const text = dataRow[header.length - 1 - colIndex] || '';
            const textSize = fontSize - 2;
            const lines = wrapText(text, font, textSize, scaledWidths[colIndex] - 10);
            maxLines = Math.max(maxLines, lines.length);
          }
        }

        // Calculate actual row height - MINIMIZED
        const lineSpacing = 3; // Reduced from 4
        const topPadding = rowIndex === 0 ? 15 : 8; // Reduced padding
        const bottomPadding = 8; // Reduced padding
        const baseHeight = rowIndex === 0
          ? rowHeight
          : Math.max(45, maxLines * (fontSize - 2 + lineSpacing) + topPadding + bottomPadding);
        const actualRowHeight = rowIndex === 0 ? baseHeight : baseHeight + 25; // Reduced from 30

        // ===== PAGE BREAK =====
        if (tableY - actualRowHeight < 100) {
          page = pdfDoc.addPage([750, 842]);
          tableY = page.getHeight() - 50;
          tableY = drawHeader(page, tableY);
        }

        // ===== DRAW ROW BORDERS (Top, Right, Left, Bottom) =====
        const drawLine = (x1, y1, x2, y2) =>
          page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 0.5 });

        // Top border
        drawLine(tableStartX, tableY, tableStartX + tableTotalWidth, tableY);
        // Bottom border
        drawLine(tableStartX, tableY - actualRowHeight, tableStartX + tableTotalWidth, tableY - actualRowHeight);
        // Left border
        drawLine(tableStartX, tableY, tableStartX, tableY - actualRowHeight);
        // Right border
        drawLine(tableStartX + tableTotalWidth, tableY, tableStartX + tableTotalWidth, tableY - actualRowHeight);

        // ===== CELLS =====
        let x = tableStartX;

        for (let colIndex = 0; colIndex < scaledWidths.length; colIndex++) {
          const colWidth = scaledWidths[colIndex];

          const text =
            rowIndex === 0
              ? header[header.length - 1 - colIndex]
              : rows[rowIndex - 1][header.length - 1 - colIndex] || '';

          const textSize = rowIndex === 0 ? fontSize : fontSize - 2;
          const lines = wrapText(text, font, textSize, colWidth - 10);

          // Center text vertically in the cell
          const lineSpacing = 3;
          const totalTextHeight = lines.length * (textSize + lineSpacing);
          const cellContentHeight = rowIndex === 0 ? (rowHeight - 30) : (baseHeight - 25);
          const verticalOffset = (cellContentHeight - totalTextHeight) / 2;

          let textY =
            rowIndex === 0
              ? tableY - 15 - verticalOffset
              : tableY - textSize - 8 - verticalOffset;

          lines.forEach(line => {
            const textX =
              x + colWidth - font.widthOfTextAtSize(line, textSize) - 5;

            page.drawText(line, {
              x: textX,
              y: textY,
              size: textSize,
              font,
            });

            textY -= textSize + 3; // Reduced spacing between lines
          });

          // No vertical borders between columns

          x += colWidth;
        }

        // ===== DATES LINE (INSIDE THE CELL) =====
        if (rowIndex > 0) {
          const dataRow = rows[rowIndex - 1] || [];
          const dateTech = dataRow[header.length] || '/';
          const dateIns = dataRow[header.length + 1] || '/';

          const labelTech = `تاريخ نهاية صلاحية محضر مراقبة التقنية: ${dateTech}`;
          const labelIns = `تاريخ نهاية صلاحية التأمين: ${dateIns}`;

          const wTech = font.widthOfTextAtSize(labelTech, extraFontSize);
          const wIns = font.widthOfTextAtSize(labelIns, extraFontSize);

          const totalWidth = wTech + wIns + 30;
          const startXForDates =
            tableStartX + (tableTotalWidth - totalWidth) / 2;

          // Position dates at the bottom of the cell
          const textYDates = tableY - actualRowHeight + extraFontSize + 5;

          page.drawText(labelTech, {
            x: startXForDates + totalWidth - wTech,
            y: textYDates,
            size: extraFontSize,
            font,
          });

          page.drawText(labelIns, {
            x: startXForDates,
            y: textYDates,
            size: extraFontSize,
            font,
          });
        }

        tableY -= actualRowHeight;
        rowIndex++;
      }

      return { page, y: tableY - 30 };
    };




    let nextY = height - 450;

    // helper to safely get the first existing date-like field from a list of candidate keys
    const getFirstDateField = (v: any, candidates: string[]) => {
      for (const key of candidates) {
        const val = v?.[key];
        if (val) return formatDate(val);
      }
      return '/';
    };

    // Table 1: All vehicles. 'ملاحظة' column filled ONLY for school transport (font_type === 'نقل مدرسي')


    if (vihicles && vihicles.length > 0) {
      // Relative widths (auto-scaled to page) - RTL order
      const columnWidthsWithObservation = [
        50,  // ملاحظة
        70,  // المقاعد
        90,  // الرقم التسلسلي
        120, // رقم تسجيل المركبة
        100, // تاريخ الرخصة
        200, // الخط المستغل
        40,  // الرقم
      ];

      const allLines = vihicles.map((v, i) => [
        String(i + 1),
        `${v.point_depart || ''} - ${v.point_arrive || ''}`,
        formatDate(v.driving_license_history),
        String(v.num_bus_registration || ''),
        String(v.font_symbol || ''),
        String(v.Number_of_seats ?? ''),
        v.font_type === 'نقل مدرسي'
          ? String(v.note_chef_departement || '/')
          : '/',
      ]);

      ({ page, y: nextY } = drawTable(
        pdfDoc,
        page,
        'الخطوط المستغلة',
        0,          // ignored
        nextY,
        65,         // IMPORTANT: header height
        tableHeaderWithObservation,
        allLines,
        cairoSemiBoldFont,
        12,
        columnWidthsWithObservation
      ));
    }



    // Worker Transport Table (without observation column)
    if (workerVehicles.length > 0) {
      // widths must match header length (6) - RTL order
      const columnWidthsWithoutObservation = [60, 70, 100, 80, 120, 40];
      const tableTotalWidth = columnWidthsWithoutObservation.reduce((sum, w) => sum + w, 0);
      const startX = (page.getWidth() - tableTotalWidth) / 2;

      const workerLines = workerVehicles.map((v, i) => [
        String(i + 1),
        `${v.point_depart || ''} - ${v.point_arrive || ''}`,
        formatDate(v.driving_license_history),
        String(v.num_bus_registration || ''),
        String(v.font_symbol || ''),
        String(v.Number_of_seats ?? ''),
        // technical inspection expiry
        getFirstDateField(v, [
          'technical_inspection_expiry',
          'inspection_expiry',
          'technical_control_end',
          'hestoire_parked_end',
        ]),
        // insurance expiry
        getFirstDateField(v, [
          'insurance_expiry',
          'assurance_end',
          'insurance_end_date',
          'insurance_expire',
        ]),
      ]);

      ({ page, y: nextY } = drawTable(
        pdfDoc,
        page,
        'نقل العمال',
        startX,
        nextY,
        48,
        tableHeaderWithoutObservation,
        workerLines,
        cairoSemiBoldFont,
        12,
        columnWidthsWithoutObservation,
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
    const reverseWords = (text: string) => {
      return text
    }


    page.drawText(reverseWords("2022/06/19"), {
      x: 30,
      y: 660,
      size: 14,
      font: customFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(reverseWords("سليم فرحات"), {
      x: 70,
      y: 640,
      size: 14,
      font: customFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(reverseWords('عين الدفلى'), {
      x: 70,
      y: 585,
      size: 14,
      font: customFont,
      color: rgb(0, 0, 0),
    });
    // 🖋️ كتابة اسم / لقب المتعامل
    page.drawText(reverseWords(`${operateur.fullName_arabe || ''}`), {
      x: 350,
      y: 410,
      size: 14,
      font: customFont,
      color: rgb(0, 0, 0),
    });

    // 🏠 كتابة العنوان
    page.drawText(reverseWords(`${operateur.address_arabe || ''}`), {
      x: 380,
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
    drawArabic('عين الدفلة', 90, 670, 10);

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

  async convertAndSave(file: Express.Multer.File) {
    // Step 1: Read the Excel file
    const workbook = XLSX.readFile(file.path);

    // Step 2: Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Step 3: Convert sheet to JSON while keeping empty attributes
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    // Step 4: Ensure uploads/json folder exists
    const jsonDir = path.join(__dirname, '../../uploads/json');
    if (!fs.existsSync(jsonDir)) {
      fs.mkdirSync(jsonDir, { recursive: true });
    }

    // Step 5: Generate JSON file name and path
    const jsonFileName =
      path.basename(file.filename, path.extname(file.filename)) + '.json';
    const jsonFilePath = path.join(jsonDir, jsonFileName);

    // Step 6: Write JSON data to file
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');

    // Step 7 (optional): delete Excel file after conversion
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Step 8: Return response
    return {
      message: '✅ Excel file converted and saved to JSON successfully',
      jsonFile: jsonFileName,
      count: jsonData.length,
      path: jsonFilePath,
    };
  }

  async findOperateurByNumClient(num_client: number) {
    return await this.OperateurModel.find({ num_docier_client: num_client });
  }

  async clearOperateur(): Promise<string> {
    await this.OperateurModel.deleteMany({});
    return '✅ All users have been deleted successfully';
  }
}
