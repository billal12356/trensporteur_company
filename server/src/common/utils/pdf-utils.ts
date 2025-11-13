import { rgb, PDFFont } from 'pdf-lib';

export function convertToArabicWords(number: number): string {
  const ones = [
    '',
    'واحد',
    'اثنان',
    'ثلاثة',
    'أربعة',
    'خمسة',
    'ستة',
    'سبعة',
    'ثمانية',
    'تسعة',
  ];
  const tens = [
    '',
    'عشرة',
    'عشرون',
    'ثلاثون',
    'أربعون',
    'خمسون',
    'ستون',
    'سبعون',
    'ثمانون',
    'تسعون',
  ];

  if (number === 0) return 'صفر';
  if (number < 10) return ones[number];
  if (number < 20) {
    if (number === 10) return 'عشرة';
    return ones[number - 10] + ' عشر';
  }
  if (number < 100) {
    const ten = Math.floor(number / 10);
    const one = number % 10;
    return (one ? ones[one] + ' و' : '') + tens[ten];
  }

  return number.toString();
}

export function drawAlignedText({
  page,
  text,
  y,
  font,
  fontSize,
  color = rgb(0, 0, 0),
  pageWidth,
  align = 'left',
  margin = 50,
}: {
  page: any;
  text: string;
  y: number;
  font: PDFFont;
  fontSize: number;
  color?: any;
  pageWidth?: number;
  align?: 'left' | 'center' | 'right';
  margin?: number;
}) {
  const textWidth = font.widthOfTextAtSize(text, fontSize);
  const pw = pageWidth ?? (typeof page.getWidth === 'function' ? page.getWidth() : 595);
  let x = margin;

  if (align === 'center') {
    x = (pw - textWidth) / 2;
  } else if (align === 'right') {
    x = pw - textWidth - margin;
  } else if (align === 'left') {
    x = margin;
  }

  page.drawText(text, {
    x,
    y,
    size: fontSize,
    font,
    color,
  });
}

export function drawRetiredLinesTable(page, font, fontSize, data, startX, startY) {
  const rowHeight = 60;
  const columnWidths = [40, 120, 80, 90, 80, 45, 160]; // من اليمين لليسار
  const headers = [
    'الرقم',
    'الخط المستغل',
    'تاريخ الرخصة',
    'رقم تسجيل الشركة',
    'رقم التسليم',
    'المقاعد',
    'ملاحظـة',
  ];

  // رسم رأس الجدول
  let y = startY;
  let x = startX;
  for (let i = 0; i < headers.length; i++) {
    page.drawRectangle({
      x,
      y,
      width: columnWidths[i],
      height: rowHeight,
      borderWidth: 1,
    });

    page.drawText(headers[i], {
      x: x + 3,
      y: y + rowHeight - 15,
      font,
      size: fontSize,
    });

    x += columnWidths[i];
  }

  // رسم الصفوف
  y -= rowHeight;

  data.forEach((row, index) => {
    let x = startX;
    const values = [
      `${index + 1}`,
      row.line,
      row.licenseDate,
      row.companyCode,
      row.deliveryNumber,
      row.seats.toString(),
      row.note,
    ];

    for (let i = 0; i < values.length; i++) {
      page.drawRectangle({
        x,
        y,
        width: columnWidths[i],
        height: rowHeight,
        borderWidth: 1,
      });

      const lines = values[i].split('\n');
      lines.forEach((line, j) => {
        page.drawText(line, {
          x: x + 3,
          y: y + rowHeight - 15 - j * 12,
          font,
          size: fontSize,
        });
      });

      x += columnWidths[i];
    }

    y -= rowHeight;
  });
}

export function drawArabicReversed(page, text, x, y, font, size = 12) {
  let str: string;
  if (text instanceof Date) {
    const day = text.getDate().toString().padStart(2, '0');
    const month = (text.getMonth() + 1).toString().padStart(2, '0');
    const year = text.getFullYear();
    str = `${day}/${month}/${year}`;
  } else {
    str = text ? String(text) : '';
  }

  const reversed = str.split('').join('');
  const adjustedY = 842 - y;

  page.drawText(reversed, {
    x,
    y: adjustedY - size,
    font,
    size,
    color: rgb(0, 0, 0),
  });
}
