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

        const cleanedData = {
          ...rawData,
          date_expiration: rawData.date_expiration ? new Date(rawData.date_expiration) : null,
          date_prévue: rawData["date_prévue"] ? new Date(rawData["date_prévue"]) : null,
          date_naissance: rawData.date_naissance ? new Date(rawData.date_naissance) : null,
          modifier_hestoire_registre_commerce: rawData.modifier_hestoire_registre_commerce
            ? new Date(rawData.modifier_hestoire_registre_commerce)
            : null,
          date_debut_activite: rawData.date_debut_activite ? new Date(rawData.date_debut_activite) : null,
          date_arret_activite_temporaire: rawData.date_arret_activite_temporaire
            ? new Date(rawData.date_arret_activite_temporaire)
            : null,
          date_arret_activite_permanent: rawData.date_arret_activite_permanent
            ? new Date(rawData.date_arret_activite_permanent)
            : null,
        };

        const doc = new this.OperateurModel(cleanedData);
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
