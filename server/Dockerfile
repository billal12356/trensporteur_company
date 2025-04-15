# استخدم صورة Node.js الرسمية كأساس
FROM node:18-alpine

# تعيين دليل العمل داخل الحاوية
WORKDIR /app

# نسخ ملفات المشروع
COPY package*.json ./

# تثبيت التبعيات
RUN npm install

# نسخ باقي الملفات
COPY . .

# فتح المنفذ الذي يعمل عليه التطبيق
EXPOSE 3000

# تشغيل التطبيق
CMD ["npm", "run", "start"]
