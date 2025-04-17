import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class ChauffeursService {
  constructor(@InjectModel(Chauffeur.name) private ChauffeurModel: Model<Chauffeur>) { }

  async create(createChauffeurDto: CreateChauffeurDto) {
    const operateur = await this.ChauffeurModel.create(createChauffeurDto)
    return new ResponseBuilder()
      .setStatus(201)
      .setMessage('تم تسجيل السائق بنجاح')
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
      console.log(filterDto);
  
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
      const worksheet = workbook.addWorksheet('المركبة');
  
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
        'المعرف (ID)', 'رقم المستخدم','رقم الطلب','تاريخ الطلب','رقم القيد للناقل','المتعامل','الخط المستغل','ترقيم المركبة'
        ,'طبيعة الخط','اسم و لقب السائق','طبيعة المستخدم','رقم التعريف الوطني NIN','رقم رخصة السياقة','تاريخ الاصدار'
        ,'نهاية صلاحية الصنف','بلدية الاصدار','تاريخ الميلاد','مكان الميلاد','العنوان','رقم شهادة الكفائة المهنية','تاريخ الحصول على شهادة الكفاءة'
        ,'الولاية','رقم التسلسلي','رقم الانتساب الى الصندوق الوطني','المركبة (موقفة او لا)','نوع التوقف','ملاحظة'
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
          op.num_didentification_national_NIN , op.num_permis_conduire,
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
}
