#!/usr/bin/env node

/**
 * Script to populate missing Chauffeur schema fields in all JSON files
 * Reads JSON files from uploads/json folder and adds all chauffeur schema fields
 * with default empty values so they're ready for database insertion
 * 
 * Usage: node populate-chauffeur-fields.js
 */

const fs = require('fs');
const path = require('path');

// All chauffeur schema fields extracted from chauffeurs.schema.ts
const CHAUFFEUR_FIELDS = {
  num_chauffeur: undefined,
  num_demende: undefined,
  hestoire_demende: '',
  num_enregistrement_du_transporteur: undefined,
  operateur: '',
  ligne_exploitée: '',
  num_vehicule: '',
  nature_ligne: '',
  nom_prenom_chauffeur: '',
  nature_utilisateur: '',
  num_didentification_national_NIN: undefined,
  num_permis_conduire: '',
  date_sortie: '',
  date_expiration_article: '',
  municipalite_emettrice: '',
  date_naissance: '',
  lieu_naissance: '',
  address: '',
  Num_certificat_compétence_professionnelle: undefined,
  date_obtention_certificat_aptitude_professionnelle: '',
  wilaya: '',
  num_serie: undefined,
  num_membre_fonds_national: undefined,
  vihicile_parked: '',
  type_parked: '',
  comments: '',
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
 * Populate missing fields in a single record
 * Keeps existing values and only adds missing fields
 */
function populateRecord(record) {
  const populated = { ...record };
  
  // Add all schema fields, keeping existing values
  Object.keys(CHAUFFEUR_FIELDS).forEach((field) => {
    if (!(field in populated)) {
      populated[field] = CHAUFFEUR_FIELDS[field];
    }
  });

  return populated;
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

    // Populate each record with missing fields
    const populated = data.map((record) => populateRecord(record));

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(populated, null, 2), 'utf-8');
    console.log(`✅ Processed: ${path.basename(filePath)} (${data.length} records)`);
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
  console.log('🔧 Populating Chauffeur Schema Fields in JSON Files\n');
  console.log(`📁 Source: ${uploadsDir}\n`);

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
  console.log(`\n📋 All records now have complete Chauffeur schema fields and are ready for database insertion.`);
}

// Run the script
main();
