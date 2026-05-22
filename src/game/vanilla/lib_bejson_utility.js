/**
 * Library:      lib_bejson_utility.js
 * Family:       Core
 * Jurisdiction: ["BEJSON_LIBRARIES", "JS"]
 * Status:       OFFICIAL
 * Author:       Elton Boehnen
 * Version:      2.0.2 OFFICIAL
 * MFDB Version: 1.31
 * Format_Creator: Elton Boehnen
 * Date:         2026-05-18
 * Description:  Browser-safe cryptographic and IO utilities.
 */

'use strict';

const BEJSON_Utility = {
    randomId() { return Math.random().toString(36).substr(2, 9); },
    
    async hash(text) {
        const msgUint8 = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BEJSON_Utility;
} else {
    window.BEJSON_Utility = BEJSON_Utility;
}
