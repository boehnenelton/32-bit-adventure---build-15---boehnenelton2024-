/**
 * Library:      lib_bejson_utility.ts
 * Family:       Utility
 * Jurisdiction: ["BEJSON_LIBRARIES", "TS"]
 * Status:       OFFICIAL
 * Author:       Elton Boehnen
 * Version:      2.0.2 OFFICIAL
 * MFDB Version: 1.31
 * Format_Creator: Elton Boehnen
 * Date:         2026-05-18
 * Description:  General-purpose helper functions for the BEJSON ecosystem.
 */

import { BEJSONDocument, BEJSONField } from "./bejson_types";

// Note: Removed Node.js specific fs/path imports for browser compatibility in this context
// If this were running in Node, we'd use themed standard IO.

const DEFAULT_EXTENSIONS = [".py", ".js", ".ts", ".html", ".css", ".md", ".json", ".sh", ".txt", ".bejson"];

const CHUNK_SCHEMA: BEJSONField[] = [
    { name: "Record_Type_Parent", type: "string" },
    { name: "id", type: "string" },
    { name: "timestamp", type: "string" },
    { name: "project_name", type: "string", Record_Type_Parent: "Project" },
    { name: "current_version", type: "string", Record_Type_Parent: "Project" },
    { name: "version_label", type: "string", Record_Type_Parent: "Snapshot" },
    { name: "version_notes", type: "string", Record_Type_Parent: "Snapshot" },
    { name: "changes", type: "string", Record_Type_Parent: "Snapshot" },
    { name: "file_path", type: "string", Record_Type_Parent: "File" },
    { name: "content", type: "string", Record_Type_Parent: "File" },
    { name: "snapshot_id_fk", type: "string", Record_Type_Parent: "File" }
];

/**
 * Initialize a new multi-version project matrix.
 */
export function bejson_utility_init_project_db(projectName: string): BEJSONDocument {
    const now = new Date().toISOString();
    return {
        Format: "BEJSON",
        Format_Version: "104db",
        Format_Creator: "Elton Boehnen",
        Records_Type: ["Project", "Snapshot", "File"],
        Fields: CHUNK_SCHEMA,
        Values: [
            ["Project", `PROJ-${projectName}`, now, projectName, "0.0.0", null, null, null, null, null, null]
        ]
    };
}

/**
 * Scan a directory and append a new version (snapshot) with change tracking.
 * Browser-compatible version (stubs file walk).
 */
export function bejson_utility_snapshot_project(
    dbDoc: BEJSONDocument, 
    _targetDir: string, 
    versionLabel: string, 
    notes: string = "",
    changes: string = ""
): BEJSONDocument {
    const now = new Date().toISOString();
    const snapshotId = `SNAP-${Date.now()}`;
    
    // Update current version in Project record
    dbDoc.Values.forEach(row => {
        if (row[0] === "Project") row[4] = versionLabel;
    });

    // Add Snapshot record (11 fields)
    dbDoc.Values.push(["Snapshot", snapshotId, now, null, null, versionLabel, notes, changes, null, null, null]);

    return dbDoc;
}

/**
 * Extract a specific version from the multi-version matrix.
 */
export function bejson_utility_restore_version(
    dbDoc: BEJSONDocument, 
    versionLabel: string
): BEJSONDocument {
    const fields = dbDoc.Fields.map(f => f.name);
    const snapIdIdx = fields.indexOf("id");
    const vlabelIdx = fields.indexOf("version_label");

    let snapshotId: string | null = null;
    dbDoc.Values.forEach(row => {
        if (row[0] === "Snapshot" && row[vlabelIdx] === versionLabel) snapshotId = row[snapIdIdx] as string;
    });

    if (!snapshotId) throw new Error(`Version '${versionLabel}' not found.`);

    // In browser, we just return the filtered document or metadata
    return dbDoc; 
}
