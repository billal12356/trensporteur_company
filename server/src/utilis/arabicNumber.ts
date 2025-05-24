function convertToArabicWords(num: number): string {
    const ones = [
        '', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة',
        'ستة', 'سبعة', 'ثمانية', 'تسعة'
    ];

    const tens = [
        '', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون',
        'ستون', 'سبعون', 'ثمانون', 'تسعون'
    ];

    const teens = [
        'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر',
        'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'
    ];

    if (num === 0) return 'صفر';
    if (num === 10) return 'عشرة';
    if (num === 11) return teens[0];
    if (num === 12) return teens[1];
    if (num > 12 && num < 20) return teens[num - 11];

    const ten = Math.floor(num / 10);
    const one = num % 10;

    if (one === 0) return tens[ten];
    return `${ones[one]} و${tens[ten]}`;
}
