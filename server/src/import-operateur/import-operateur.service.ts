import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Operateur } from 'src/operateur-dtw/operateur-dtw.schema';
import * as fs from 'fs';
import * as path from 'path';
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
        console.log("doc", doc)
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
          // Skip header rows (row 2 typically contains headers in Arabic)
          if (i === 0 && jsonData[i]['__EMPTY_38'] === 'متوقف على النشاط أو لا') {
            continue;
          }

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
            const normalizeDependActivite = (value: string) => {
              if (!value) return null;
              if (value.includes('نعم')) return 'نعم';
              if (value.includes('لا')) return 'لا';
              return null;
            };

            const normalizeTypeDepend = (value: string) => {
              if (!value) return null;
              if (value.includes('مؤقت')) return 'مؤقت';
              if (value.includes('نهائي')) return 'نهائي';
              return null;
            };

            // Mapping des colonnes Excel vers le schéma
            const operateurData = {
              num_wilaya: parseNumber(row['__EMPTY']),
              num_docier_client: parseNumber(row['__EMPTY_1']),

              fullName_arabe: row['البحث باسم المتعامل'] || null,
              fullName_francais: row['__EMPTY_2'] || null,

              date_expiration: parseDate(row['__EMPTY_3']),
              date_prévue: parseDate(row['__EMPTY_4']),

              num_dhoraire: parseNumber(row['__EMPTY_5']),
              num_cate_enregistement: parseNumber(row['__EMPTY_6']),

              activite: row['__EMPTY_7'] || null,
              colonne1: row['__EMPTY_8'] || null,

              nature_activite: row['__EMPTY_9'] || null,
              colonne2: row['__EMPTY_10'] || null,

              status_activite: row['__EMPTY_11'] || null,
              colonne3: row['__EMPTY_12'] || null,

              type_client: row['__EMPTY_13'] || null,
              colonne4: row['__EMPTY_14'] || null,

              institution_person_moral: row['__EMPTY_15'] || null,
              fullName_gerent_person_moral: row['__EMPTY_16'] || null,

              num_dacte_naissance: parseNumber(row['__EMPTY_17']),
              num_didentification_national_NIN: parseNumber(row['__EMPTY_18']),

              date_naissance: parseDate(row['__EMPTY_19']),

              lieu_naissance_arabe: row['__EMPTY_20'] || null,
              lieu_naissance_francais: row['__EMPTY_21'] || null,

              nom_pere_arabe: row['__EMPTY_22'] || null,
              nom_pere_francais: row['__EMPTY_23'] || null,

              fullName_mere_arabe: row['__EMPTY_24'] || null,
              fullName_mere_francais: row['__EMPTY_25'] || null,

              communes_naissance_arabe: row['__EMPTY_26'] || null,
              communes_naissance_francais: row['__EMPTY_27'] || null,

              address_arabe: row['__EMPTY_28'] || null,
              address_francais: row['__EMPTY_29'] || null,

              address_municipalité_arabe: row['__EMPTY_30'] || null,
              address_municipalité_francais: row['__EMPTY_31'] || null,

              num_registre_commerce: row['__EMPTY_32'] || null,
              num_registre_commerce_n5: row['__EMPTY_33'] || null,

              hestoire_registre_commerce: parseDate(row['__EMPTY_34']),
              modifier_hestoire_registre_commerce: parseDate(row['__EMPTY_35']),

              date_debut_activite: parseDate(row['__EMPTY_36']),

              num_adherent_caise_national_non_salaire: parseNumber(row['__EMPTY_37']),

              depend_activite: normalizeDependActivite(row['__EMPTY_38']),
              type_depend: normalizeTypeDepend(row['__EMPTY_39']),

              date_arret_activite_temporaire: parseDate(row['__EMPTY_40']),
              date_arret_activite_permanent: parseDate(row['__EMPTY_41']),

              num_telephone_client: row['__EMPTY_42'] || null,
              soccupe: row['__EMPTY_43'] || null,
              note_chef_departement: row['__EMPTY_44'] || null,
            };

            const operateur = new this.OperateurModel(operateurData);
            await operateur.save();
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
