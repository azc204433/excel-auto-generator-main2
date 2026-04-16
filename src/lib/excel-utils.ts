import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ThermalReport } from '../types';

export const generateThermalExcel = async (report: ThermalReport) => {
  const workbook = new ExcelJS.Workbook();
  const fontMalgun = '맑은 고딕';

  // Process each item as a separate sheet or a vertical block
  // The user's request describes a very specific row-based layout.
  // We'll create one sheet per item if there are multiple, or one long sheet.
  // Given the detail, one sheet per item is often cleaner for "reports".
  
  for (const [index, item] of report.items.entries()) {
    const sheetName = `${item.targetName.substring(0, 20)}_${index + 1}`;
    const worksheet = workbook.addWorksheet(sheetName);

    // Page Setup for A4 Printing
    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToHeight: 1, // Fit to 1 page height
      fitToWidth: 1,  // Fit to 1 page width
      margins: {
        left: 0.852, right: 0.838, // Shifted left by 0.02cm (approx -0.008 inches left, +0.008 inches right)
        top: 0.59, bottom: 0.79, // 1.5cm, 2cm
        header: 0, footer: 0
      },
      horizontalCentered: true,
      verticalCentered: true
    };

    // Set column widths for a balanced look
    worksheet.columns = [
      { width: 18.5 }, // A
      { width: 18.5 }, // B
      { width: 18.5 }, // C
      { width: 18.5 }, // D
      { width: 18.5 }, // E
      { width: 18.5 }, // F
    ];

    // Row 1: Title
    const titleRow = worksheet.addRow(['적외선 열화상분포 측정기록표']);
    worksheet.mergeCells('A1:F1');
    titleRow.getCell(1).font = { name: fontMalgun, size: 20, bold: true };
    titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    titleRow.height = 50;

    // Row 2: Spacer (Merged, No borders)
    const row2 = worksheet.addRow(['']);
    worksheet.mergeCells('A2:F2');
    row2.height = 50;
    row2.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    // No borders for Row 2 as requested

    // Row 3: 측정대상, 사용전압, 측정조건
    const row3 = worksheet.addRow(['측정대상', item.targetName, '사용전압', item.voltage, '측정조건', '-']);
    row3.height = 50;
    row3.eachCell((cell, colNumber) => {
      const isLabel = colNumber === 1 || colNumber === 3 || colNumber === 5;
      cell.font = { name: fontMalgun, size: 10, bold: isLabel };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });

    // Row 4: 1. 판정기준(3상 비교법)
    const row4 = worksheet.addRow(['1. 판정기준(3상 비교법)']);
    worksheet.mergeCells(`A4:F4`);
    row4.getCell(1).font = { name: fontMalgun, size: 10, bold: true };
    row4.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    row4.height = 50;

    // Row 5: 판정요소/구분 Header
    const row5 = worksheet.addRow(['판정요소/구분', '정상', '요주의', '이상', '', '비고']);
    worksheet.mergeCells('D5:E5');
    row5.height = 50;
    row5.eachCell(cell => {
      cell.font = { name: fontMalgun, size: 10, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Row 6: 판정기준 Data
    const row6 = worksheet.addRow(['온도차', '5°C 이하', '5°C 초과~10°C', '10°C이상', '', '-']);
    worksheet.mergeCells('D6:E6');
    row6.height = 50;
    row6.eachCell(cell => {
      cell.font = { name: fontMalgun, size: 10 };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Row 7: ※ 온도차는 최고치와 최저치의 차이임 (Merged, No borders)
    const row7 = worksheet.addRow(['※ 온도차는 최고치와 최저치의 차이임']);
    worksheet.mergeCells('A7:F7');
    row7.height = 50;
    row7.getCell(1).font = { name: fontMalgun, size: 10 };
    row7.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    // No borders for Row 7 as requested

    // Row 8: 2. 부위별 측정온도
    const row8 = worksheet.addRow(['2. 부위별 측정온도']);
    worksheet.mergeCells('A8:F8');
    row8.height = 50;
    row8.getCell(1).font = { name: fontMalgun, size: 10, bold: true };
    row8.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

    // Row 9: 측정부위 Header
    const row9 = worksheet.addRow(['측정부위', 'point 1', 'point 2', 'point 3', '최대온도차', '']);
    worksheet.mergeCells('E9:F9');
    row9.height = 50;
    row9.eachCell((cell) => {
      cell.font = { name: fontMalgun, size: 10, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Row 10: 온도측정 Data
    const row10 = worksheet.addRow(['온도측정', item.point1, item.point2, item.point3, item.maxDiff, '']);
    worksheet.mergeCells('E10:F10');
    row10.height = 50;
    row10.eachCell((cell, colNumber) => {
      cell.font = { name: fontMalgun, size: 10, bold: colNumber === 1 };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Row 11: 3. 측정부위의 Thermographic
    const row11 = worksheet.getRow(11);
    row11.values = ['3. 측정부위의 Thermographic'];
    worksheet.mergeCells('A11:F11');
    row11.height = 50;
    row11.getCell(1).font = { name: fontMalgun, size: 10, bold: true };
    row11.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

    // Row 12: Images
    const row12 = worksheet.getRow(12);
    row12.height = 350; 
    worksheet.mergeCells('A12:C12');
    worksheet.mergeCells('D12:F12');
    
    // Add borders to image cells
    ['A12', 'D12'].forEach(cellRef => {
      const cell = worksheet.getCell(cellRef);
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    if (item.visualImage) {
      try {
        const imageId = workbook.addImage({
          base64: item.visualImage,
          extension: 'png',
        });
        worksheet.addImage(imageId, {
          tl: { col: 0, row: 11 } as any,
          br: { col: 3, row: 12 } as any,
          editAs: 'oneCell'
        });
      } catch (e) { console.error('Visual image error', e); }
    }

    if (item.thermalImage) {
      try {
        const imageId = workbook.addImage({
          base64: item.thermalImage,
          extension: 'png',
        });
        worksheet.addImage(imageId, {
          tl: { col: 3, row: 11 } as any,
          br: { col: 6, row: 12 } as any,
          editAs: 'oneCell'
        });
      } catch (e) { console.error('Thermal image error', e); }
    }

    // Row 13: Image Labels
    const row13 = worksheet.getRow(13);
    row13.values = ['측정부위', '', '', '측정부위 온도 분포', '', ''];
    worksheet.mergeCells('A13:C13');
    worksheet.mergeCells('D13:F13');
    row13.height = 50;
    row13.eachCell(cell => {
      cell.font = { name: fontMalgun, size: 10 };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Row 14: 4. 종합의견
    const row14 = worksheet.getRow(14);
    row14.values = ['4. 종합의견'];
    worksheet.mergeCells('A14:F14');
    row14.height = 50;
    row14.getCell(1).font = { name: fontMalgun, size: 10, bold: true };
    row14.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

    // Row 15-20: 종합의견 Content
    const row15 = worksheet.getRow(15);
    row15.values = [item.opinion || ''];
    worksheet.mergeCells('A15:F20'); 
    
    for (let r = 15; r <= 20; r++) {
      const rObj = worksheet.getRow(r);
      rObj.height = 50;
      for (let c = 1; c <= 6; c++) {
        rObj.getCell(c).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      }
    }
    
    row15.getCell(1).font = { name: fontMalgun, size: 11 };
    row15.getCell(1).alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${report.projectName}_열화상측정보고서.xlsx`);
};
