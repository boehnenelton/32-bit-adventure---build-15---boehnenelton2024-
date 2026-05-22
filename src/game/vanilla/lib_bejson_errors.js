/**
 * Library:      lib_bejson_errors.js
 * Family:       Core
 * Jurisdiction: ["BEJSON_LIBRARIES", "JS"]
 * Status:       OFFICIAL
 * Author:       Elton Boehnen
 * Version:      2.0.1 OFFICIAL
 * MFDB Version: 1.31
 * Format_Creator: Elton Boehnen
 * Date:         2026-05-18
 * Description:  Global error code catalogue for BEJSON and MFDB ecosystems.
 */

'use strict';

const Errors = {
  // Parsing & IO
  E_INVALID_JSON: 1,
  E_MISSING_MANDATORY_KEY: 2,
  E_INVALID_FORMAT: 3,
  E_INVALID_VERSION: 4,
  E_INVALID_RECORDS_TYPE: 5,
  E_INVALID_FIELDS: 6,
  E_INVALID_VALUES: 7,
  E_TYPE_MISMATCH: 8,
  E_RECORD_LENGTH_MISMATCH: 9,
  E_RESERVED_KEY_COLLISION: 10,
  E_INVALID_RECORD_TYPE_PARENT: 11,
  E_NULL_VIOLATION: 12,
  
  // File System
  E_FILE_NOT_FOUND: 20,
  E_PERMISSION_DENIED: 21,
  E_ATOMIC_WRITE_FAILED: 22,
  
  // Core Operations
  E_CORE_INVALID_VERSION: 30,
  E_CORE_INVALID_OPERATION: 31,
  E_CORE_INDEX_OUT_OF_BOUNDS: 32,
  E_CORE_FIELD_NOT_FOUND: 33,
  E_CORE_TYPE_CONVERSION_FAILED: 34,
  E_CORE_BACKUP_FAILED: 35,
  E_CORE_WRITE_FAILED: 36,
  E_CORE_QUERY_FAILED: 37,
  E_CORE_ENCRYPTION_FAILED: 38,
  E_CORE_DECRYPTION_FAILED: 39,

  // MFDB Specific
  E_MFDB_MANIFEST_NOT_FOUND: 50,
  E_MFDB_ENTITY_NOT_FOUND: 51,
  E_MFDB_SCHEMA_MISMATCH: 52,
  E_MFDB_BIDIRECTIONAL_PATH_FAILED: 53
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Errors;
}
if (typeof window !== 'undefined') {
    window.BEJSON_ERRORS = Errors;
}
