/**
 * Utilities for exporting data to Excel and PDF
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
// @ts-ignore - jspdf-autotable doesn't have proper TypeScript types
import autoTable from 'jspdf-autotable';

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title?: string;
  totals?: { label: string; value: number }[];
}

/**
 * Export data to Excel file
 */
export function exportToExcel(data: ExportData, filename: string = 'reporte'): void {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Prepare data for Excel
  const excelData: (string | number)[][] = [];

  // Add title if provided
  if (data.title) {
    excelData.push([data.title]);
    excelData.push([]); // Empty row
  }

  // Add headers
  excelData.push(data.headers);

  // Add rows
  data.rows.forEach((row) => {
    excelData.push(row);
  });

  // Add totals if provided
  if (data.totals && data.totals.length > 0) {
    excelData.push([]); // Empty row
    // Find the last numeric column index
    const lastNumericColIndex = data.headers.length - 1;
    data.totals.forEach((total) => {
      const totalRow: (string | number)[] = new Array(data.headers.length).fill('');
      totalRow[0] = total.label;
      totalRow[lastNumericColIndex] = total.value;
      excelData.push(totalRow);
    });
  }

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  // Set column widths
  const maxWidths = data.headers.map((_, colIndex) => {
    let maxWidth = data.headers[colIndex].length;
    data.rows.forEach((row) => {
      const cellValue = String(row[colIndex] || '');
      if (cellValue.length > maxWidth) {
        maxWidth = cellValue.length;
      }
    });
    return { wch: Math.min(maxWidth + 2, 50) }; // Max width 50
  });
  worksheet['!cols'] = maxWidths;

  // Format currency columns (detect numeric columns from headers)
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const headerRow = range.s.r;
  const currencyKeywords = ['monto', 'iva', 'percepción', 'retención', 'ganancias', 'iibb'];
  
  // Find columns that contain currency-related headers
  const currencyColumns: number[] = [];
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: C });
    const headerValue = String(worksheet[cellAddress]?.v || '').toLowerCase();
    if (currencyKeywords.some(keyword => headerValue.includes(keyword))) {
      currencyColumns.push(C);
    }
  }
  
  // Apply number format to currency columns
  for (let R = range.s.r + 1; R <= range.e.r; R++) {
    currencyColumns.forEach((colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: colIndex });
      if (worksheet[cellAddress] && typeof worksheet[cellAddress].v === 'number') {
        worksheet[cellAddress].z = '#,##0.00'; // Number format with thousands separator and 2 decimals
      }
    });
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');

  // Generate Excel file and download
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export data to PDF file
 */
export function exportToPDF(data: ExportData, filename: string = 'reporte'): void {
  // Create a new PDF document
  const doc = new jsPDF();

  // Add title if provided
  if (data.title) {
    doc.setFontSize(16);
    doc.text(data.title, 14, 20);
    doc.setFontSize(10);
  }

  // Prepare data for table
  const tableData = data.rows.map((row) => row.map((cell) => String(cell || '')));

  // Add table
  autoTable(doc, {
    head: [data.headers],
    body: tableData,
    startY: data.title ? 30 : 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 20, right: 14, bottom: 20, left: 14 },
  });

  // Add totals if provided
  if (data.totals && data.totals.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 20;
    let currentY = finalY + 10;

    data.totals.forEach((total) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(total.label, 14, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(total.value), 180, currentY, { align: 'right' });
      currentY += 7;
    });
  }

  // Save PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Prepare purchases book data for export
 */
export function preparePurchasesBookData(records: any[]): ExportData {
  return {
    title: 'Libro de Compras',
    headers: ['Fecha', 'Proveedor', 'Obra', 'Monto', 'IVA', 'Percepción IVA', 'Percepción IIBB'],
    rows: records.map((record) => [
      formatDate(record.date),
      record.supplier?.name || record.supplierName || '-',
      record.work?.name || record.workName || '-',
      Number(record.amount || 0),
      Number(record.vat_amount || 0),
      Number(record.vat_perception || 0),
      Number(record.iibb_perception || 0),
    ]),
  };
}

/**
 * Prepare perceptions report data for export
 */
export function preparePerceptionsData(
  records: any[],
  totals?: { total_vat_perception: number; total_iibb_perception: number },
): ExportData {
  return {
    title: 'Reporte de Percepciones',
    headers: ['Fecha', 'Proveedor', 'Obra', 'Percepción IVA', 'Percepción IIBB'],
    rows: records.map((record) => [
      formatDate(record.date),
      record.supplier?.name || record.supplierName || '-',
      record.work?.name || record.workName || '-',
      Number(record.vat_perception || 0),
      Number(record.iibb_perception || 0),
    ]),
    totals: totals
      ? [
          { label: 'Total Percepción IVA', value: Number(totals.total_vat_perception || 0) },
          { label: 'Total Percepción IIBB', value: Number(totals.total_iibb_perception || 0) },
        ]
      : undefined,
  };
}

/**
 * Prepare withholdings report data for export
 */
export function prepareWithholdingsData(
  records: any[],
  totals?: { total_vat_withholding: number; total_income_tax_withholding: number },
): ExportData {
  return {
    title: 'Reporte de Retenciones',
    headers: ['Fecha', 'Proveedor', 'Obra', 'Retención IVA', 'Retención Ganancias'],
    rows: records.map((record) => [
      formatDate(record.date),
      record.supplier?.name || record.supplierName || '-',
      record.work?.name || record.workName || '-',
      Number(record.vat_withholding || 0),
      Number(record.income_tax_withholding || 0),
    ]),
    totals: totals
      ? [
          { label: 'Total Retención IVA', value: Number(totals.total_vat_withholding || 0) },
          { label: 'Total Retención Ganancias', value: Number(totals.total_income_tax_withholding || 0) },
        ]
      : undefined,
  };
}

/**
 * Format date for display
 */
function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateString;
  }
}

