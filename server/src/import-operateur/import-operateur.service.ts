import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Operateur } from 'src/operateur-dtw/operateur-dtw.schema';

import { OperateurDtwService } from 'src/operateur-dtw/operateur-dtw.service';
import { Operateurs } from 'src/seed/type/operateurs';
import * as XLSX from 'xlsx'
@Injectable()
export class ImportOperateurService {
  constructor(@InjectModel(Operateur.name) private OperateurModel: Model<Operateur>,
  ) { }

  importExcel(filePath: any): Promise<void> {
    return new Promise((resolve) => {
      // تنفيذ التكرار باستخدام حلقة for التقليدية بدل for..of للتمكن من التعامل مع promise بشكل متسلسل
      const saveNext = (index: number) => {
        if (index >= filePath.length) {
          console.log("✅ تم استيراد السجلات بنجاح!");
          return resolve();
        }
        const rawData = filePath[index];
        console.log("row", rawData);

        // Helper: convert Excel serial or dd/mm/yyyy to Date
        const parsePossibleExcelDate = (value: any): Date | null => {
          if (value === undefined || value === null || value === '') return null;
          if (typeof value === 'number') {
            // Excel serial
            const epoch = new Date(Date.UTC(1899, 11, 30));
            const ms = Math.round(value * 24 * 60 * 60 * 1000);
            return new Date(epoch.getTime() + ms);
          }
          if (typeof value === 'string') {
            const m = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (m) {
              const day = Number(m[1]), month = Number(m[2]), year = Number(m[3]);
              return new Date(year, month - 1, day);
            }
            const d = new Date(value);
            if (!isNaN(d.getTime())) return d;
          }
          return null;
        };

        // Sanitize and fill missing french fields using arabic equivalents when possible
        const cleanedData: any = {
          ...rawData,
          date_expiration: parsePossibleExcelDate(rawData.date_expiration),
          date_prévue: parsePossibleExcelDate(rawData['date_prévue']),
          date_naissance: parsePossibleExcelDate(rawData.date_naissance),
          modifier_hestoire_registre_commerce: parsePossibleExcelDate(rawData.modifier_hestoire_registre_commerce),
          date_debut_activite: parsePossibleExcelDate(rawData.date_debut_activite),
          date_arret_activite_temporaire: parsePossibleExcelDate(rawData.date_arret_activite_temporaire),
          date_arret_activite_permanent: parsePossibleExcelDate(rawData.date_arret_activite_permanent),
        };

        // Fill French equivalents if missing
        try {
          cleanedData.fullName_francais = rawData.fullName_francais || rawData.fullName_arabe || rawData['fullName_arabe'] || '';
          cleanedData.lieu_naissance_francais = rawData.lieu_naissance_francais || rawData.lieu_naissance_arabe || '';
          cleanedData.nom_pere_francais = rawData.nom_pere_francais || rawData.nom_pere_arabe || '';
          cleanedData.fullName_mere_francais = rawData.fullName_mere_francais || rawData.fullName_mere_arabe || '';
          cleanedData.communes_naissance_francais = rawData.communes_naissance_francais || rawData.communes_naissance_arabe || '';
          cleanedData.address_francais = rawData.address_francais || rawData.address_arabe || '';
          cleanedData.address_municipalité_francais = rawData.address_municipalité_francais || rawData.address_municipalité_arabe || '';
          cleanedData.num_registre_commerce_n5 = rawData.num_registre_commerce_n5 || rawData.num_registre_commerce || '';

          // Numeric coercions (use 0 when missing to satisfy required numeric fields; adjust if you prefer skipping)
          cleanedData.num_cate_enregistement = rawData.num_cate_enregistement !== undefined && rawData.num_cate_enregistement !== ''
            ? Number(rawData.num_cate_enregistement)
            : 0;
          cleanedData.num_wilaya = rawData.num_wilaya !== undefined && rawData.num_wilaya !== '' ? Number(rawData.num_wilaya) : 0;
          cleanedData.num_docier_client = rawData.num_docier_client !== undefined && rawData.num_docier_client !== '' ? Number(rawData.num_docier_client) : 0;
          cleanedData.num_dacte_naissance = rawData.num_dacte_naissance !== undefined && rawData.num_dacte_naissance !== '' ? Number(rawData.num_dacte_naissance) : 0;
          cleanedData.num_didentification_national_NIN = rawData.num_didentification_national_NIN !== undefined && rawData.num_didentification_national_NIN !== '' ? Number(rawData.num_didentification_national_NIN) : 0;

          // Valid enum values only for type_depend and depend_activite
          const validTypeDepend = ['مؤقت', 'نهائي'];
          cleanedData.type_depend = validTypeDepend.includes(rawData.type_depend) ? rawData.type_depend : undefined;
          const validDependActivite = ['نعم', 'لا'];
          cleanedData.depend_activite = validDependActivite.includes(rawData.depend_activite) ? rawData.depend_activite : undefined;
        } catch (err) {
          // if access fails, proceed with best-effort cleanedData
        }

        const doc = new this.OperateurModel(cleanedData);
        console.log("doc",doc)
        doc.save()
          .then(() => saveNext(index + 1))
          .catch((error) => {
            console.error("❌ خطأ أثناء الحفظ:", error.message);
            saveNext(index + 1); // متابعة التكرار رغم الخطأ
          });
      };

      saveNext(0); // بدء التكرار
    });
  }


  


}
