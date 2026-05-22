/**
 * Library:      lib_mfdb_core.js
 * Family:       Core
 * Jurisdiction: ["BEJSON_LIBRARIES", "JS"]
 * Status:       OFFICIAL
 * Author:       Elton Boehnen
 * Version:      1.31 OFFICIAL
 * MFDB Version: 1.31
 * Format_Creator: Elton Boehnen
 * Date:         2026-05-18
 * Description:  Multi-file database orchestrator managing manifests and entity synchronization.
 */

'use strict';

// ------------------------------------------------------------------
// Environment / Module Setup
// ------------------------------------------------------------------
const BEJSON = (typeof require !== 'undefined') ? require('./lib_bejson_bejson.js') : (window.BEJSON_CORE || {});
const ERRORS = (typeof require !== 'undefined') ? require('./lib_bejson_errors.js') : (window.BEJSON_ERRORS || {});

const {
  E_CORE_INVALID_VERSION,
  E_CORE_INVALID_OPERATION,
  E_CORE_INDEX_OUT_OF_BOUNDS,
  E_CORE_FIELD_NOT_FOUND,
} = ERRORS;

class MFDBCoreError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'MFDBCoreError';
    this.code = code;
  }
}

// ------------------------------------------------------------------
// Core Logic
// ------------------------------------------------------------------

function mfdb_core_create_manifest(dbName, opts = {}) {
  if (!dbName) throw new MFDBCoreError('DB_Name is required', E_CORE_INVALID_OPERATION);
  
  const fields = [
    { name: "entity_name", type: "string" },
    { name: "file_path",   type: "string" },
    { name: "record_count", type: "integer" }
  ];

  return BEJSON.create104a('mfdb', fields, [], {
    MFDB_Version: "1.31",
    DB_Name: dbName,
    Author: opts.author || 'System',
    Created_At: new Date().toISOString()
  });
}

function mfdb_core_register_entity(manifest, entityName, filePath, count = 0) {
  if (!BEJSON.isValid(manifest)) throw new MFDBCoreError('Invalid manifest', E_CORE_INVALID_OPERATION);
  
  const enIdx = BEJSON.getFieldIndex(manifest, 'entity_name');
  if (manifest.Values.some(v => v[enIdx] === entityName)) {
      throw new MFDBCoreError('Entity already registered', E_CORE_INVALID_OPERATION);
  }

  manifest.Values.push([entityName, filePath, count]);
  return manifest;
}

function mfdb_core_sync_count(manifest, entityName, count) {
  if (!BEJSON.isValid(manifest)) throw new MFDBCoreError('Invalid manifest', E_CORE_INVALID_OPERATION);
  
  const enIdx = BEJSON.getFieldIndex(manifest, 'entity_name');
  const rcIdx = BEJSON.getFieldIndex(manifest, 'record_count');
  
  const row = manifest.Values.find(v => v[enIdx] === entityName);
  if (!row) throw new MFDBCoreError('Entity not found', E_CORE_FIELD_NOT_FOUND);
  
  row[rcIdx] = count;
  return manifest;
}

// ------------------------------------------------------------------
// Exports
// ------------------------------------------------------------------

const MFDBExports = {
  version: "1.31",
  create_manifest: mfdb_core_create_manifest,
  register_entity: mfdb_core_register_entity,
  sync_count:      mfdb_core_sync_count,
  MFDBCoreError
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MFDBExports;
}
if (typeof window !== 'undefined') {
    window.MFDB_CORE = MFDBExports;
}
