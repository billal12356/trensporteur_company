
import { motion } from "framer-motion"
import { MapPin, Clock } from "lucide-react"
import image from "@/assets/IMG-20250714-WA0002.jpg"
export default function Component() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
                    >
                        مديرية النقل
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-xl text-gray-600 mb-2"
                    >
                        ولاية عين الدفلى
                    </motion.p>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100px" }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="h-1 bg-blue-600 mx-auto rounded-full"
                    />
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative"
                    >
                        <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                            <img
                                src={image}
                                alt=""
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">نبذة تعريفية</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                مديرية النقل لولاية عين الدفلى هي مؤسسة حكومية تهدف إلى تنظيم وإدارة قطاع النقل في الولاية. تعمل
                                المديرية على ضمان سلامة وكفاءة وسائل النقل المختلفة وتقديم الخدمات اللازمة للمواطنين.
                            </p>

                            <div className="grid grid-cols-1 gap-3">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center space-x-3 space-x-reverse p-3 bg-blue-50 rounded-lg"
                                >
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    <span className="text-gray-700">ولاية عين الدفلى، الجزائر</span>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center space-x-3 space-x-reverse p-3 bg-green-50 rounded-lg"
                                >
                                    <Clock className="w-5 h-5 text-green-600" />
                                    <span className="text-gray-700">الأحد - الخميس: 8:00 - 16:30</span>
                                </motion.div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white"
                        >
                            <h3 className="text-xl font-bold mb-3">خدماتنا</h3>
                            <ul className="space-y-2 text-blue-100">
                                <li>• تسجيل وترخيص المركبات</li>
                                <li>• إصدار رخص السياقة</li>
                                <li>• مراقبة النقل العمومي</li>
                                <li>• تنظيم النقل المدرسي</li>
                            </ul>
                        </motion.div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="mt-12 text-center"
                >
                    <div className="bg-white rounded-xl p-8 shadow-lg">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">رؤيتنا</h3>
                        <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                            نسعى لتطوير نظام نقل آمن وفعال يخدم جميع المواطنين ويساهم في التنمية الاقتصادية والاجتماعية لولاية عين
                            الدفلى
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
