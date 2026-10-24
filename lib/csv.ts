const cell = (value: string | number) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Rows to CSV text (CRLF line endings, quoted where needed). */
export function toCsv(rows: (string | number)[][]) {
  return rows.map((row) => row.map(cell).join(",")).join("\r\n");
}

/** Saves rows as a CSV file; the BOM keeps Excel on UTF-8. */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const url = URL.createObjectURL(
    new Blob([`﻿${toCsv(rows)}`], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
