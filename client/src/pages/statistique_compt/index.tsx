import MainContainer from "@/components/MainContainer"
import { fetchVihicules } from "@/redux/slice/vihiculeSlice"
import { AppDispatch, RootState } from "@/redux/store"
import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { fetchVehicleGlobalStats } from "@/redux/slice/stateSlice"

const StatistiqueCompt = () => {
    const dispatch = useDispatch<AppDispatch>()
    const [page] = useState(1)

    // Ref عشان نحدد الجزء اللي نطبعو
    const printRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        dispatch(fetchVihicules({ search: "", page, limit: 1000000 }))
    }, [dispatch, page])

    const { vehicleGlobalStats } = useSelector(
        (state:RootState) => state.stats
    );

    useEffect(() => {
        dispatch(fetchVehicleGlobalStats());
    }, [dispatch]);


    const handlePrint = () => {
        if (printRef.current) {
            const printContent = printRef.current.innerHTML
            const printWindow = window.open("", "", "width=800,height=600")
            if (printWindow) {
                printWindow.document.write(`
          <html>
            <head>
              <title>إحصائيات المركبات</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                th { background-color: #f4f4f4; }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `)
                printWindow.document.close()
                printWindow.print()
            }
        }
    }

    return (
        <MainContainer>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">إحصائيات المركبات</h2>
                    <Button onClick={handlePrint} className="bg-blue-600 text-white hover:bg-blue-700">
                        طباعة
                    </Button>
                </div>

                {/* الجزء اللي نطبعه */}
                <div ref={printRef}>
                    <Table className="border rounded-lg shadow">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">إجمالي المركبات</TableHead>
                                <TableHead className="text-right">المركبات المتوقفة</TableHead>
                                <TableHead className="text-right">مركبات غيّرت الخط</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="text-right font-medium">{vehicleGlobalStats?.totalVehicles}</TableCell>
                                <TableCell className="text-right text-red-600">{vehicleGlobalStats?.stoppedVehicles}</TableCell>
                                <TableCell className="text-right text-blue-600">{vehicleGlobalStats?.changedLineVehicles}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </MainContainer>
    )
}

export default StatistiqueCompt
