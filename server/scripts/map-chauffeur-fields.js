#!/usr/bin/env node

/**
 * Script to map Arabic field names to Chauffeur schema field names in JSON files
 * Maps all Arabic field names to their English schema equivalents
 * 
 * Usage: node map-chauffeur-fields.js
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

// Path to JSON uploads directory
const uploadsDir = path.join(__dirname, '../uploads/json');

/**
 * Get all JSON files from uploads directory
 */
function getJsonFiles() {
  if (!fs.existsSync(uploadsDir)) {
    console.error(`❌ Directory not found: ${uploadsDir}`);
    process.exit(1);
  }

  return fs
    .readdirSync(uploadsDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => path.join(uploadsDir, file));
}

/**
 * Map field names in a single record
 * Converts Arabic field names to English schema field names
 */
function mapRecord(record) {
  const mapped = {};

  // Map each field using the FIELD_MAPPING
  Object.keys(record).forEach((arabicKey) => {
    const schemaKey = FIELD_MAPPING[arabicKey];

    if (schemaKey === null) {
      // Skip fields that should be removed
      return;
    }

    if (schemaKey) {
      // Map to schema field
      mapped[schemaKey] = record[arabicKey];
    } else {
      // Keep unmapped fields as-is
      console.warn(`⚠️  Unmapped field: "${arabicKey}"`);
      mapped[arabicKey] = record[arabicKey];
    }
  });

  return mapped;
}

/**
 * Process a single JSON file
 */
function processJsonFile(filePath) {
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);

    if (!Array.isArray(data)) {
      console.warn(`⚠️  ${path.basename(filePath)}: Not an array, skipping`);
      return false;
    }

    // Map each record
    const mapped = data.map((record) => mapRecord(record));

    // Write back to file with formatted JSON
    fs.writeFileSync(filePath, JSON.stringify(mapped, null, 2), 'utf-8');
    console.log(`✅ Processed: ${path.basename(filePath)} (${data.length} records mapped)`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${path.basename(filePath)}: ${error.message}`);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔄 Mapping Arabic Field Names to Chauffeur Schema\n');
  console.log(`📁 Source: ${uploadsDir}\n`);
  console.log('📋 Field Mapping:');
  console.log('   رقم القيد للناقل → num_enregistrement_du_transporteur');
  console.log('   المتعامل → operateur');
  console.log('   الخط المستغل → ligne_exploitée');
  console.log('   ترقيم المركبة → num_vehicule');
  console.log('   اسم و لقب السائق → nom_prenom_chauffeur');
  console.log('   ... and more\n');

  const jsonFiles = getJsonFiles();
  if (jsonFiles.length === 0) {
    console.warn('⚠️  No JSON files found in uploads directory');
    process.exit(0);
  }

  console.log(`📄 Found ${jsonFiles.length} JSON file(s)\n`);

  let processed = 0;
  let failed = 0;

  jsonFiles.forEach((filePath) => {
    if (processJsonFile(filePath)) {
      processed++;
    } else {
      failed++;
    }
  });

  console.log(`\n✨ Complete!`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`\n📋 All field names have been converted to Chauffeur schema format.`);
}

// Run the script
main();
