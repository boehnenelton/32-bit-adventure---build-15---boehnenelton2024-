export function parseBEJSON104a(data: any) {
  if (data.Format !== "BEJSON" || data.Format_Version !== "104a") throw new Error("Invalid 104a format");
  const fields = data.Fields.map((f: any) => f.name);
  return data.Values.map((row: any) => { const obj: any = {}; fields.forEach((field: string, i: number) => { obj[field] = row[i]; }); return obj; });
}

export function parseBEJSON104db(data: any) {
  if (data.Format !== "BEJSON" || data.Format_Version !== "104db") throw new Error("Invalid 104db format");
  const fields = data.Fields.map((f: any) => ({ name: f.name, parent: f.Record_Type_Parent }));
  const records: any = {}; data.Records_Type.forEach((type: string) => { records[type] = []; });
  data.Values.forEach((row: any) => {
    const type = row[0];
    if (records[type]) {
      const obj: any = {};
      fields.forEach((field: any, i: number) => { if (field.name !== "Record_Type_Parent" && (!field.parent || field.parent === type)) obj[field.name] = row[i]; });
      records[type].push(obj);
    }
  });
  return records;
}
