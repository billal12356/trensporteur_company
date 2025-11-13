#!/usr/bin/env node

/**
 * Convert Operateur DTW JSON files to match Operateur schema
 * Maps Arabic field names to English schema field names
 * Removes unnecessary fields like "البحث باسم المتعامل" and __EMPTY fields
 * 
 * Usage: node map-operateur-dtw-fields.js
 */

const fs = require('fs');
const path = require('path');

// Mapping from __EMPTY_X indices to Operateur schema field names
// Based on the field order in the Excel/CSV export
const FIELD_INDEX_MAPPING = {
  0: null, // Skip __EMPTY (num_wilaya will be added)
  1: "num_docier_client",  // __EMPTY_1
  2: null, // Skip __EMPTY_2 (French name)
  3: null, // Skip __EMPTY_3
  4: null, // Skip __EMPTY_4
  5: null, // Skip __EMPTY_5
  6: null, // Skip (redundant number)
  7: null, // Skip __EMPTY_7 (activity in Arabic)
  8: null, // Skip __EMPTY_8 (activity in French)
  9: null, // Skip __EMPTY_9 (activity description)
  10: null, // Skip __EMPTY_10 (activity code)
  11: null, // Skip __EMPTY_11 (public/private)
  12: null, // Skip __EMPTY_12
  13: null, // Skip __EMPTY_13 (person type)
  14: null, // Skip __EMPTY_14
  15: null, // Skip __EMPTY_15
  16: null, // Skip empty
  17: null, // Skip empty
  18: null, // Skip empty
  19: null, // Skip empty
  20: null, // Skip empty
  21: null, // Skip empty
  22: null, // Skip empty
  23: null, // Skip empty
  24: null, // Skip empty
  25: null, // Skip empty
  26: null, // Skip empty
  27: null, // Skip empty
  28: null, // Skip empty
  29: null, // Skip empty
  30: "address_arabe", // __EMPTY_30 (wilaya name in Arabic)
  31: "address_francais", // __EMPTY_31 (wilaya name in French)
  32: null, // Skip empty
  33: null, // Skip empty
  34: null, // Skip empty
  35: null, // Skip empty
  36: null, // Skip empty
  37: null, // Skip empty
  38: null, // Skip empty
  39: null, // Skip empty
  40: null, // Skip empty
  41: null, // Skip empty
  42: null, // Skip empty
  43: null, // Skip empty
  44: null, // Skip empty
  45: null, // Skip empty
};

/**
 * Convert a single record
 */
function convertRecord(record) {
  const converted = {
    num_wilaya: record.__EMPTY || 0,
    num_docier_client: record.__EMPTY_1 || 0,
    fullName_arabe: record["البحث باسم المتعامل"] || "",
    fullName_francais: record.__EMPTY_2 || "",
    date_expiration: new Date().toISOString(),
    date_prévue: new Date().toISOString(),
    num_dhoraire: 0,
    num_cate_enregistement: 0,
    activite: record.__EMPTY_7 || "",
    colonne1: "",
    nature_activite: record.__EMPTY_9 || "",
    colonne2: "",
    status_activite: "نشط",
    colonne3: "",
    type_client: "شخص معنوي",
    colonne4: "",
    institution_person_moral: "",
    fullName_gerent_person_moral: "",
    num_dacte_naissance: 0,
    num_didentification_national_NIN: 0,
    date_naissance: new Date().toISOString(),
    lieu_naissance_arabe: "",
    lieu_naissance_francais: "",
    nom_pere_arabe: "",
    nom_pere_francais: "",
    fullName_mere_arabe: "",
    fullName_mere_francais: "",
    communes_naissance_arabe: "",
    communes_naissance_francais: "",
    address_arabe: record.__EMPTY_30 || "",
    address_francais: record.__EMPTY_31 || "",
    address_municipalité_arabe: "",
    address_municipalité_francais: "",
    num_registre_commerce: "",
    num_registre_commerce_n5: "",
    hestoire_registre_commerce: new Date().toISOString(),
    modifier_hestoire_registre_commerce: new Date().toISOString(),
    date_debut_activite: new Date().toISOString(),
    num_adherent_caise_national_non_salaire: 0,
    depend_activite: "لا",
    type_depend: "",
    date_arret_activite_temporaire: null,
    date_arret_activite_permanent: null,
    num_telephone_client: "",
    soccupe: "",
    note_chef_departement: ""
  };

  return converted;
}

/**
 * Process a single JSON file
 */
function processJsonFile(filePath) {
  try {
    console.log(`📖 Reading ${path.basename(filePath)}...`);
    
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);

    if (!Array.isArray(data)) {
      console.error('❌ JSON is not an array');
      return false;
    }

    console.log(`📝 Converting ${data.length} records...`);
    const converted = data.map((record, index) => {
      const result = convertRecord(record);
      if ((index + 1) % 100 === 0) {
        process.stdout.write(`   ${index + 1}/${data.length}\r`);
      }
      return result;
    });

    console.log(`✅ Writing converted data...`);
    fs.writeFileSync(filePath, JSON.stringify(converted, null, 2), 'utf-8');
    console.log(`✨ Completed: ${path.basename(filePath)} (${data.length} records)\n`);
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔄 Converting Operateur DTW JSON Files\n');

  const files = [
    path.join(__dirname, '../uploads/json/1762948769889.json'),
  ];

  let processed = 0;
  let failed = 0;

  files.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      if (processJsonFile(filePath)) {
        processed++;
      } else {
        failed++;
      }
    } else {
      console.warn(`⚠️  File not found: ${path.basename(filePath)}`);
    }
  });

  console.log(`\n✨ Complete!`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`\n📋 All records converted to Operateur schema format`);
  console.log(`📌 Removed fields: "البحث باسم المتعامل", __EMPTY_*, etc.`);
}

// Run the script
main();
