/**
 * Library:      lib_bejson_schema.js
 * Family:       Core
 * Jurisdiction: ["BEJSON_LIBRARIES", "JS"]
 * Status:       OFFICIAL
 * Author:       Elton Boehnen
 * Version:      2.0.1 OFFICIAL
 * MFDB Version: 1.31
 * Format_Creator: Elton Boehnen
 * Date:         2026-05-18
 * Description:  Schema management and enforcement for JavaScript.
 */

'use strict';

const BEJSON_SCHEMA = {
    extract(doc) {
        const schema = JSON.parse(JSON.stringify(doc));
        schema.Values = [];
        return schema;
    },

    validate(doc, schema) {
        if (doc.Format_Version !== schema.Format_Version) return false;
        if (doc.Fields.length !== schema.Fields.length) return false;
        return true;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BEJSON_SCHEMA;
}
if (typeof window !== 'undefined') {
    window.BEJSON_SCHEMA = BEJSON_SCHEMA;
}
