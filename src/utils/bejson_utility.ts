/**
 * Jurisdiction: ["TYPESCRIPT", "BROWSER", "BEJSON_UTILITY"]
 * Author:      AI Agent (Adapted from Elton Boehnen's v1.3.1)
 * Version:     1.3.1-BROWSER
 * Description: Browser-compatible BEJSON Utility for multi-version snapshot management.
 */

export interface BEJSONField {
    name: string;
    type: string;
    Record_Type_Parent?: string;
}

export interface BEJSONDocument {
    Format: string;
    Format_Version: string;
    Format_Creator: string;
    Records_Type: string[];
    Fields: BEJSONField[];
    Values: any[][];
}

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
 * Create a new snapshot of current files and return the updated database.
 */
export function bejson_utility_snapshot_project(
    dbDoc: BEJSONDocument, 
    files: Record<string, any>, 
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

    // Add File records
    Object.entries(files).forEach(([relPath, contentObj]) => {
        const content = typeof contentObj === 'string' ? contentObj : JSON.stringify(contentObj, null, 2);
        // File row (11 fields)
        dbDoc.Values.push(["File", `FILE-${relPath}`, now, null, null, null, null, null, relPath, content, snapshotId]);
    });

    return dbDoc;
}

/**
 * Extract a specific version from the multi-version matrix.
 */
export function bejson_utility_restore_version(
    dbDoc: BEJSONDocument, 
    versionLabel: string
): Record<string, any> {
    const fields = dbDoc.Fields.map(f => f.name);
    const snapIdIdx = fields.indexOf("id");
    const vlabelIdx = fields.indexOf("version_label");
    const fpathIdx = fields.indexOf("file_path");
    const contIdx = fields.indexOf("content");
    const fkIdx = fields.indexOf("snapshot_id_fk");

    let snapshotId: string | null = null;
    dbDoc.Values.forEach(row => {
        if (row[0] === "Snapshot" && row[vlabelIdx] === versionLabel) snapshotId = row[snapIdIdx];
    });

    if (!snapshotId) throw new Error(`Version '${versionLabel}' not found.`);

    const restoredFiles: Record<string, any> = {};

    dbDoc.Values.forEach(row => {
        if (row[0] === "File" && row[fkIdx] === snapshotId) {
            const relPath = row[fpathIdx];
            const content = row[contIdx];
            if (relPath) {
                try {
                    restoredFiles[relPath] = JSON.parse(content);
                } catch {
                    restoredFiles[relPath] = content;
                }
            }
        }
    });

    return restoredFiles;
}
