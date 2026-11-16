import Papa from 'papaparse';

export function parseCsvNames(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const names: string[] = [];
          for (const row of results.data) {
            if (Array.isArray(row) && row.length > 0) {
              const val = String(row[0]).trim();
              if (val.length > 0) {
                names.push(val);
              }
            }
          }
          resolve(names);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => {
        reject(err);
      }
    });
  });
}
