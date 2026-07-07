import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateChauffeurDto } from './dto/create-chauffeur.dto';
import { UpdateChauffeurDto } from './dto/update-chauffeur.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Chauffeur } from './chauffeurs.schema';
import { Model, Types } from 'mongoose';
import { ResponseBuilder } from 'src/common/builder/response.builder';
import { UserQueryBuilder } from 'src/common/builder/pagination.builder';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx'
import { Workbook } from 'exceljs';
import { OperateurDtwService } from 'src/operateur-dtw/operateur-dtw.service';
import { VehiclesService } from 'src/vehicles/vehicles.service';
import { ChauffeurQueryBuilder } from 'src/common/builder/ChauffeurQueryBuilder';

@Injectable()
export class ChauffeursService {
  constructor(
    @InjectModel(Chauffeur.name)
    private ChauffeurModel: Model<Chauffeur>,
    @Inject(forwardRef(() => OperateurDtwService))
    private readonly operateurService: OperateurDtwService,
    @Inject(forwardRef(() => VehiclesService))
    private readonly vehiclesService: VehiclesService,
  ) { }

  async create(createChauffeurDto: CreateChauffeurDto, createdBy?: string) {
    const fullName_arabe = createChauffeurDto.operateur
    const num_vehicule = createChauffeurDto.num_vehicule
    const operateur = await this.operateurService.findByVihicilesandChauffer({ fullName_arabe })

    if (!operateur) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على المتعامل  ${fullName_arabe}`)
          .setErrors({ _id: 'Operator not found' })
          .build(),
      );
    }
    const vihicule = await this.vehiclesService.findVihiculeByNumBus({ num_vehicule })

    if (!vihicule) {
      throw new NotFoundException(!
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على المركبة  ${num_vehicule}`)
          .build(),
      );
    }
    const chauffeur = await this.ChauffeurModel.create({ ...createChauffeurDto, createdBy })
    let finalChauffeur: any = chauffeur;
    if (chauffeur && createdBy) {
      finalChauffeur = await this.ChauffeurModel.findById(chauffeur._id).populate('createdBy', 'fullName email role').lean();
    }
    return new ResponseBuilder()
      .setStatus(201)
      .setMessage('تم تسجيل السائق بنجاح')
      .setData(finalChauffeur)
      .build();
  }

  async findAll(params: any, user?: any) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;

    const queryBuilder = new ChauffeurQueryBuilder()
      .setLimit(limit)
      .setSkip(page)
      .setSort(params.sort || 'asc')
      .setSearch(params.search);

    const { query, limit: finalLimit, skip, sort } = queryBuilder.build();

    let queryObj = this.ChauffeurModel.find(query)
      .limit(finalLimit)
      .skip(skip)
      .sort(sort)
      .lean();
      
    if (user?.role === 'admin' || user?.role === 'manager') {
      queryObj = queryObj.populate('createdBy', 'fullName email role');
    }

    const data = await queryObj.exec();

    const total = await this.ChauffeurModel.countDocuments(query).exec();

    return {
      total,
      limit: finalLimit,
      page,
      data,
    };
  }

  async findOne(id: string, user?: any) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        new ResponseBuilder()
          .setStatus(400)
          .setMessage(`المعرف ${id} غير صالح`)
          .setErrors({ _id: 'Invalid ObjectId format' })
          .build(),
      );
    }

    let queryObj = this.ChauffeurModel.findOne({ _id: id }).lean();
    if (user?.role === 'admin' || user?.role === 'manager') {
      queryObj = queryObj.populate('createdBy', 'fullName email role');
    }

    const vihicile = await queryObj.exec();

    if (!vihicile) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على السائق ذو المعرف #${id}`)
          .setErrors({ _id: 'Operator not found' })
          .build(),
      );
    }
    return vihicile
  }

  async update(id: string, updateChauffeurDto: UpdateChauffeurDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        new ResponseBuilder()
          .setStatus(400)
          .setMessage(`المعرف ${id} غير صالح`)
          .setErrors({ _id: 'Invalid ObjectId format' })
          .build(),
      );
    }

    const operateur = await this.ChauffeurModel.findByIdAndUpdate(
      id,
      { $set: updateChauffeurDto },
      {
        new: true,
        runValidators: true,
      },
    ).exec();

    if (!operateur) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على السائق ذو المعرف #${id}`)
          .setErrors({ _id: 'Operator not found' })
          .build(),
      );
    }

    return new ResponseBuilder()
      .setStatus(200)
      .setMessage('تم تحديث السائق بنجاح!')
      .setData(operateur)
      .build();
  }

  async remove(id: string) {
    const operateur = await this.ChauffeurModel.findByIdAndDelete(id);

    if (!operateur) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على السائق ذو المعرف #${id}`)
          .setErrors({ _id: 'User not found' })
          .build(),
      );
    }

    return new ResponseBuilder()
      .setStatus(200)
      .setMessage('تم حذف السائق بنجاح!')
      .build();
  }

  async exportChauffeurToExcel(filterDto: any): Promise<string> {
    // Extract and sanitize search term
    const search = filterDto?.search ? String(filterDto.search).trim() : null;

    const qb = new ChauffeurQueryBuilder()
      .setSearch(search)
      .build();

    console.log('📊 Export Chauffeurs - Search term:', search || '(empty - showing all records)');
    console.log('📋 Generated Query:', JSON.stringify(qb.query));

    const chauffeurs = await this.ChauffeurModel
      .find(qb.query)
      .sort(qb.sort)
      .lean();

    console.log(`✅ Found ${chauffeurs.length} chauffeurs matching criteria`);

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('السائقين');

    /* ================= TITLE ================= */
    const titleRow = worksheet.addRow(['قائمة السائقين']);
    worksheet.addRow([]);
    worksheet.mergeCells('A1:AB1');

    titleRow.getCell(1).font = { bold: true, size: 18, color: { argb: 'FFFFFF' }, name: 'Cairo' };
    titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
    titleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1F3D6D' },
    };
    titleRow.height = 25;

    /* ================= HEADER ================= */
    const headers = [
      'ID',
      'رقم المستخدم',
      'رقم الطلب',
      'تاريخ الطلب',
      'رقم القيد للناقل',
      'المتعامل',
      'الخط المستغل',
      'ترقيم المركبة',
      'طبيعة الخط',
      'اسم و لقب السائق',
      'طبيعة المستخدم',
      'الرقم الوطني للتعريف (NIN)',
      'رقم رخصة السياقة',
      'تاريخ الاصدار',
      'تاريخ الانتهاء',
      'بلدية الاصدار',
      'تاريخ الميلاد',
      'مكان الميلاد',
      'العنوان',
      'رقم شهادة الكفاءة',
      'تاريخ شهادة الكفاءة',
      'الولاية',
      'الرقم التسلسلي',
      'رقم الصندوق الوطني',
      'المركبة موقفة',
      'نوع التوقف',
      'ملاحظة',
    ];

    // Calculate column widths based on header length
    worksheet.columns = headers.map((header) => ({
      width: Math.ceil(header.length * 1.5), // Adjust multiplier for better fit
    }));

    const headerRow = worksheet.addRow(headers);
    headerRow.height = 20;

    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11, name: 'Cairo' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0070C0' } };
      cell.alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    /* ================= DATA ================= */
    let index = 1;
    chauffeurs.forEach((ch, idx) => {
      const row = worksheet.addRow([
        index++,
        ch.num_chauffeur,
        ch.num_demende,
        formatDate(ch.hestoire_demende),
        ch.num_enregistrement_du_transporteur,
        ch.operateur,
        ch.ligne_exploitée || '/',
        ch.num_vehicule,
        ch.nature_ligne || '/',
        ch.nom_prenom_chauffeur,
        ch.nature_utilisateur || '/',
        `${ch.num_didentification_national_NIN || '/'}`,
        ch.num_permis_conduire,
        formatDate(ch.date_sortie),
        formatDate(ch.date_expiration_article),
        ch.municipalite_emettrice,
        formatDate(ch.date_naissance),
        ch.lieu_naissance,
        ch.address,
        ch.Num_certificat_compétence_professionnelle,
        formatDate(ch.date_obtention_certificat_aptitude_professionnelle),
        ch.wilaya,
        ch.num_serie,
        ch.num_membre_fonds_national,
        ch.vihicile_parked ? 'نعم' : 'لا',
        ch.type_parked || '/',
        ch.comments || '/',
      ]);

      row.height = 18;
      const bgColor = idx % 2 === 0 ? 'F2F2F2' : 'FFFFFF';

      row.eachCell(cell => {
        cell.font = { name: 'Cairo', size: 10, color: { argb: '000000' } };
        cell.alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'D3D3D3' } },
          left: { style: 'thin', color: { argb: 'D3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
          right: { style: 'thin', color: { argb: 'D3D3D3' } },
        };
      });
    });

    /* ================= EXCEL OPTIONS ================= */
    worksheet.autoFilter = {
      from: { row: 3, column: 1 },
      to: { row: worksheet.rowCount, column: headers.length },
    };

    // Set the worksheet to display from right to left
    worksheet.views = [
      { rightToLeft: true },
    ];

    /* ================= FILE ================= */
    const exportDir = join(__dirname, '..', 'exports/chauffeurs');
    if (!existsSync(exportDir)) mkdirSync(exportDir, { recursive: true });

    const filePath = join(exportDir, `Chauffeurs_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }


  async getRegistrationStats(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59);
    const data = await this.ChauffeurModel.aggregate([
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

  async findChauffeurByOperateur(fullName_arabe: string) {
    if (!fullName_arabe) return [];

    const cleanedName = fullName_arabe
      .trim()
      .replace(/\s+/g, ' ');

    // Use exact match (with anchors) to avoid returning chauffeurs
    // that belong to a different operateur with a similar name
    return this.ChauffeurModel.find({
      operateur: {
        $regex: `^${cleanedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
        $options: 'i',
      },
    }).lean().exec();
  }


  async importExcel(filePath: any): Promise<void> {
    return new Promise((resolve) => {
      const saveNext = (index: number) => {
        if (index >= filePath.length) {
          console.log("✅ تم استيراد السجلات بنجاح!");
          return resolve();
        }

        const rawData = filePath[index];
        console.log("row", rawData);

        const cleanedData = {
          ...rawData,
          // معالجة التواريخ
          date_sortie: parseDate(rawData.date_sortie),
          date_naissance: parseDate(rawData.date_naissance),
          date_expiration: parseDate(rawData.date_expiration),
          date_prévue: parseDate(rawData.date_prévue),
          modifier_hestoire_registre_commerce: parseDate(rawData.modifier_hestoire_registre_commerce),
          date_debut_activite: parseDate(rawData.date_debut_activite),
          date_arret_activite_temporaire: parseDate(rawData.date_arret_activite_temporaire),
          date_arret_activite_permanent: parseDate(rawData.date_arret_activite_permanent),
          date_obtention_certificat_aptitude_professionnelle: parseDateFromText(rawData.date_obtention_certificat_aptitude_professionnelle),

          // معالجة الحقول المطلوبة إن لم تكن موجودة
          num_chauffeur: rawData.num_chauffeur || null,
        };

        const doc = new this.ChauffeurModel(cleanedData);
        doc.save()
          .then(() => saveNext(index + 1))
          .catch((error) => {
            console.error(`❌ خطأ أثناء الحفظ في السطر ${index + 1}:`, error.message);
            saveNext(index + 1); // متابعة رغم الخطأ
          });
      };

      saveNext(0);
    });
  }

  async clearChauffeurs(): Promise<string> {
    await this.ChauffeurModel.deleteMany({});
    return '✅ All users have been deleted successfully';
  }

  async convertAndSaveToMongoDB(file: Express.Multer.File): Promise<any> {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetNames = workbook.SheetNames;

      const allData = {};
      let savedCount = 0;
      let failedCount = 0;
      const errors = [];

      for (const sheetName of sheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: null,
        });

        allData[sheetName] = jsonData;

        // Save each row to MongoDB
        for (let i = 0; i < jsonData.length; i++) {
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

            // Mapping Excel columns to Chauffeur schema
            const chauffeurData = {
              num_chauffeur: parseNumber(row['رقم المستخدم']),
              num_demende: parseNumber(row['رقم الطلب']),
              hestoire_demende: parseDate(row['تاريخ الطلب']),
              num_enregistrement_du_transporteur: parseNumber(row['رقم القيد للناقل']),
              operateur: row['المتعامل'] || null,
              ligne_exploitée: row['الخط المستغل'] || null,
              num_vehicule: row['ترقيم المركبة'] || null,
              nature_ligne: row['طبيعة الخط'] || null,
              nom_prenom_chauffeur: row['اسم و لقب السائق'] || null,
              nature_utilisateur: row['طبيعة المستخدم'] || null,
              num_didentification_national_NIN: parseNumber(row['رقم التعريف الوطني']),
              num_permis_conduire: row['رقم رخصة السياقة'] || null,
              date_sortie: parseDate(row['تاريخ الإصدار']),
              date_expiration_article: parseDate(row['نهاية صلاحية الصنف']),
              municipalite_emettrice: row['بلدية الإصدار'] || null,
              date_naissance: parseDate(row['تاريخ الميلاد']),
              lieu_naissance: row['مكان الميلاد'] || null,
              address: row['العنوان'] || null,
              Num_certificat_compétence_professionnelle: parseNumber(row['رقم شهادة الكفاءة المهنية']),
              date_obtention_certificat_aptitude_professionnelle: parseDate(row['تاريخ الحصول على شهادة الكفاءة المهنية']),
              wilaya: row['الولاية'] || null,
              num_serie: parseNumber(row['رقم التسلسلي ']),
              num_membre_fonds_national: parseNumber(row['رقم الانتساب الى الصندوق الوطني للعمال الأجراء']),
              vihicile_parked: row['المركبة موقفة أو لا'] || null,
              type_parked: row['نوع التوقيف'] || null,
              comments: row['ملاحظة '] || null,
            };

            const chauffeur = new this.ChauffeurModel(chauffeurData);
            await chauffeur.save();
            savedCount++;
          } catch (error) {
            failedCount++;
            errors.push({
              row: i + 1,
              error: error.message,
            });
            console.error(`خطأ في الصف ${i + 1}:`, error.message);
          }
        }
      }

      // Save to file.json
      const outputPath = path.join(process.cwd(), 'file.json');
      fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2), 'utf-8');

      console.log(`✓ تم حفظ ${savedCount} سجل في MongoDB`);
      console.log(`✗ فشل حفظ ${failedCount} سجل`);
      console.log(`✓ تم حفظ JSON في ${outputPath}`);

      return {
        savedCount,
        failedCount,
        errors: errors.slice(0, 10),
      };
    } catch (error) {
      console.error('خطأ في تحويل Excel:', error);
      throw error;
    }
  }
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const [day, month, year] = dateStr.split('/').map(Number);
  if (!day || !month || !year) return null;

  return new Date(year, month - 1, day);
}

// استخراج التاريخ من نص يحتوي على تاريخ بصيغة "DD/MM/YYYY"
function parseDateFromText(text: any): Date | null {
  if (typeof text !== 'string') return null;

  const match = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;

  const [_, day, month, year] = match;
  return new Date(+year, +month - 1, +day);
}


function formatDate(date?: Date) {
  if (!date) return '/';
  return new Date(date).toLocaleDateString('fr-FR');
}
