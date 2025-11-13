#!/usr/bin/env node

/**
 * Convert all Arabic field names to English schema field names in 1762948932000.json
 * This script reads the entire JSON file and renames all fields at once
 */

const fs = require('fs');
const path = require('path');

// Mapping from Arabic field names to schema field names
const FIELD_MAPPING = {
  "num_chauffeur": "num_chauffeur",
  "num_demende": "num_demende",
  "hestoire_demende": "hestoire_demende",
  "رقم القيد للناقل": "num_enregistrement_du_transporteur",
  "المتعامل": "operateur",
  "الخط المستغل": "ligne_exploitée",
  "ترقيم المركبة": "num_vehicule",
  "طبيعة الخط": "nature_ligne",
  "اسم و لقب السائق": "nom_prenom_chauffeur",
  "طبيعة المستخدم": "nature_utilisateur",
  "رقم التعريف الوطني": "num_didentification_national_NIN",
  "رقم رخصة السياقة": "num_permis_conduire",
  "تاريخ الإصدار": "date_sortie",
  "نهاية صلاحية الصنف": "date_expiration_article",
  "بلدية الإصدار": "municipalite_emettrice",
  "تاريخ الميلاد": "date_naissance",
  "مكان الميلاد": "lieu_naissance",
  "العنوان": "address",
  "رقم شهادة الكفاءة المهنية": "Num_certificat_compétence_professionnelle",
  "تاريخ الحصول على شهادة الكفاءة المهنية": "date_obtention_certificat_aptitude_professionnelle",
  "الولاية": "wilaya",
  "رقم التسلسلي ": "num_serie",
  "رقم الانتساب الى الصندوق الوطني للعمال الأجراء": "num_membre_fonds_national",
  "المركبة موقفة أو لا": "vihicile_parked",
  "نوع التوقيف": "type_parked",
  "ملاحظة ": "comments",
  "__EMPTY": null, // Fields to remove
};

const filePath = path.join(__dirname, '../uploads/json/1762948932000.json');

/**
 * Convert field names in a single record
 */
function convertRecord(record) {
  const converted = {};

  Object.keys(record).forEach((arabicKey) => {
    const schemaKey = FIELD_MAPPING[arabicKey];

    if (schemaKey === null) {
      // Skip fields marked for removal
      return;
    }

    if (schemaKey) {
      // Use mapped schema field name
      converted[schemaKey] = record[arabicKey];
    } else {
      // Keep unmapped fields as-is
      converted[arabicKey] = record[arabicKey];
    }
  });

  return converted;
}

try {
  console.log('📖 Reading JSON file...');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  if (!Array.isArray(data)) {
    console.error('❌ JSON is not an array');
    process.exit(1);
  }

  console.log(`📝 Converting ${data.length} records...`);
  const converted = data.map((record, index) => {
    const result = convertRecord(record);
    if ((index + 1) % 100 === 0) {
      process.stdout.write(`   ${index + 1}/${data.length}\r`);
    }
    return result;
  });

  console.log(`✅ Conversion complete! Writing to file...`);
  fs.writeFileSync(filePath, JSON.stringify(converted, null, 2), 'utf-8');

  console.log(`\n✨ Success!`);
  console.log(`   File: 1762948932000.json`);
  console.log(`   Records: ${data.length}`);
  console.log(`   Status: All Arabic field names converted to English schema field names`);
} catch (error) {
  console.error(`\n❌ Error: ${error.message}`);
  process.exit(1);
}
