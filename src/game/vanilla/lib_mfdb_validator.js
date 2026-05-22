/**
 * Library:      lib_mfdb_validator.js
 * Family:       Core
 * Jurisdiction: ["BEJSON_LIBRARIES", "JS"]
 * Status:       OFFICIAL
 * Author:       Elton Boehnen
 * Version:      1.31 OFFICIAL
 * MFDB Version: 1.31
 * Format_Creator: Elton Boehnen
 * Date:         2026-05-18
 * Description:  Bidirectional path and manifest-entity relationship validator.
 */

'use strict';

const BEJSON_VALIDATOR = (typeof require !== 'undefined') ? require('./lib_bejson_validator.js') : (window.BEJSON_VALIDATOR || {});
const ERRORS = (typeof require !== 'undefined') ? require('./lib_bejson_errors.js') : (window.BEJSON_ERRORS || {});

const { E_INVALID_FORMAT } = ERRORS;

function mfdb_validator_validate_manifest(manifest) {
  const report = BEJSON_VALIDATOR.bejson_validator_get_report(manifest);
  if (manifest.Format_Version !== '104a') return false;
  if (!manifest.DB_Name) return false;
  return true;
}

const MFDBValidatorExports = {
  validate_manifest: mfdb_validator_validate_manifest
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MFDBValidatorExports;
}
if (typeof window !== 'undefined') {
    window.MFDB_VALIDATOR = MFDBValidatorExports;
}
