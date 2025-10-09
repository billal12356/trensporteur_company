"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet, Info } from "lucide-react"

export function InstructionsCard() {
  return (
    <Card className="w-full max-w-3xl mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">تحميل بيانات المركبات</CardTitle>
        </div>
        <CardDescription className="text-right">اختر نوع البيانات التي تريد تحميلها بصيغة Excel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 text-right">
          <FileSpreadsheet className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-sm mb-1">بين البلديات</h3>
            <p className="text-sm text-muted-foreground">بيانات المركبات التي تعمل بين البلديات المختلفة</p>
          </div>
        </div>

        <div className="flex items-start gap-3 text-right">
          <FileSpreadsheet className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-sm mb-1">ريفي</h3>
            <p className="text-sm text-muted-foreground">بيانات المركبات في المناطق الريفية والنائية</p>
          </div>
        </div>

        <div className="flex items-start gap-3 text-right">
          <FileSpreadsheet className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-sm mb-1">بين الولايات</h3>
            <p className="text-sm text-muted-foreground">بيانات المركبات التي تسافر بين الولايات المختلفة</p>
          </div>
        </div>

        <div className="flex items-start gap-3 text-right">
          <FileSpreadsheet className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-sm mb-1">حضري</h3>
            <p className="text-sm text-muted-foreground">بيانات المركبات في المناطق الحضرية والمدن</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground text-right">
            <strong className="text-foreground">كيفية الاستخدام:</strong> انقر على أي زر لبدء تحميل ملف Excel. سيتم
            تحميل الملف تلقائياً إلى جهازك.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
