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
import { Workbook } from 'exceljs';
import { OperateurDtwService } from 'src/operateur-dtw/operateur-dtw.service';
import { VehiclesService } from 'src/vehicles/vehicles.service';

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

  async create(createChauffeurDto: CreateChauffeurDto) {
    const fullName_francais = createChauffeurDto.operateur
    const num_vehicule = createChauffeurDto.num_vehicule
    const operateur = await this.operateurService.findByVihicilesandChauffer({ fullName_francais })

    if (!operateur) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على المتعامل  ${fullName_francais}`)
          .setErrors({ _id: 'Operator not found' })
          .build(),
      );
    }
    const vihicule = await this.vehiclesService.findVihiculeByNumBus({ num_vehicule })

    if (!vihicule) {
      throw new NotFoundException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage(`لم يتم العثور على المركبة  ${num_vehicule}`)
          .build(),
      );
    }
    const chauffeur = await this.ChauffeurModel.create(createChauffeurDto)
    return new ResponseBuilder()
      .setStatus(201)
      .setMessage('تم تسجيل السائق بنجاح')
      .setData(chauffeur)
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

    const data = await this.ChauffeurModel.find(query)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();

    const total = await this.ChauffeurModel.countDocuments(query).exec();

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

    const vihicile = await this.ChauffeurModel.findOne({ _id: id });

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
    const query: any = {};

    const search = filterDto?.search?.trim?.();
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { fullName_arabe: searchRegex },
        { fullName_francais: searchRegex },
      ];
    };

    const vihicule = await this.ChauffeurModel.find(query).lean();
    console.log(vihicule);

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('السائقين');

    const exportDir = join(__dirname, '..', 'exports/chauffeurs');
    if (!existsSync(exportDir)) {
      mkdirSync(exportDir, { recursive: true });
    }

    const filePath = join(exportDir, 'Chauffeurs.xlsx');

    const titleRow = worksheet.addRow(['قائمة السائقين']);
    worksheet.addRow([])
    worksheet.mergeCells('A1:F1');
    titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
    titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E78' } };

    const headerRow = worksheet.addRow([
      'المعرف (ID)', 'رقم المستخدم', 'رقم الطلب', 'تاريخ الطلب', 'رقم القيد للناقل', 'المتعامل', 'الخط المستغل', 'ترقيم المركبة'
      , 'طبيعة الخط', 'اسم و لقب السائق', 'طبيعة المستخدم', 'رقم التعريف الوطني NIN', 'رقم رخصة السياقة', 'تاريخ الاصدار'
      , 'نهاية صلاحية الصنف', 'بلدية الاصدار', 'تاريخ الميلاد', 'مكان الميلاد', 'العنوان', 'رقم شهادة الكفائة المهنية', 'تاريخ الحصول على شهادة الكفاءة'
      , 'الولاية', 'رقم التسلسلي', 'رقم الانتساب الى الصندوق الوطني', 'المركبة (موقفة او لا)', 'نوع التوقف', 'ملاحظة'
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
        id++, op.num_chauffeur, op.num_demende, op.hestoire_demende, op.num_enregistrement_du_transporteur,
        op.operateur, op.ligne_exploitée || "/", op.num_vehicule, op.nature_ligne || "/", op.nom_prenom_chauffeur, op.nature_utilisateur || "/",
        op.num_didentification_national_NIN, op.num_permis_conduire,
        op.date_sortie, op.date_expiration_article, op.municipalite_emettrice, op.date_naissance,
        op.lieu_naissance, op.address, op.Num_certificat_compétence_professionnelle, op.date_obtention_certificat_aptitude_professionnelle,
        op.wilaya, op.num_serie, op.num_membre_fonds_national,
        op.vihicile_parked, op.type_parked, op.comments
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

  async findChauffeurByOperateur(fullName_francais: string) {
    const chauffeur = await this.ChauffeurModel
      .find({ operateur: fullName_francais })
      .exec();
    return chauffeur
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
