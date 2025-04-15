"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { HiMenu, HiX } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/context/userContext/UserProvider";

const Navbar = () => {
    const { userData, logout } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenCreate, setIsOpenCreate] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-gray-900 text-white p-4 flex justify-between items-center relative">
            {/* الشعار */}
            <div className="text-lg font-bold">
                <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s"
                    className="w-12 h-12 rounded-full"
                />
            </div>

            {/* زر القائمة للأجهزة المحمولة */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="md:hidden">
                        {mobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-gray-900 text-white w-64 p-2">
                    <ul className="flex flex-col space-y-6 text-lg mt-10">
                        <Link to="/" className="hover:text-pink-400">🏠 Home</Link>
                        <div className="cursor-pointer flex items-center gap-1" onClick={() => setIsOpen(!isOpen)}>
                            📋 Tables <IoIosArrowDown />
                        </div>
                        {isOpen && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pl-4 flex flex-col space-y-3">
                                <Link to="/operateur" className="hover:text-pink-400">👨‍💼 Operateur</Link>
                                <Link to="/chauffeur" className="hover:text-pink-400">🚗 Chauffeur</Link>
                                <Link to="/vehecule" className="hover:text-pink-400">🚛 Véhicule</Link>
                            </motion.div>
                        )}
                        <Link to="/statistique" className="hover:text-pink-400">📊 Statistique</Link>
                        <div className="cursor-pointer flex items-center gap-1" onClick={() => setIsOpenCreate(!isOpenCreate)}>
                            ✏️ Create <IoIosArrowDown />
                        </div>
                        {isOpenCreate && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pl-4 flex flex-col space-y-3">
                                <Link to="/create-operateur" className="hover:text-pink-400">👨‍💼 Create Operateur</Link>
                                <Link to="/create-chauffeur" className="hover:text-pink-400">🚗 Create Chauffeur</Link>
                                <Link to="/create-vehecule" className="hover:text-pink-400">🚛 Create Véhicule</Link>
                            </motion.div>
                        )}
                        {userData ? (
                            <Button onClick={logout} color="error" className="mt-4 cursor-pointer w-full">🚪 Logout</Button>
                        ) : (
                            <Link to="/login" className="bg-pink-500 text-white text-center py-2 rounded-md hover:bg-pink-600 mt-4">
                                🔑 Sign In
                            </Link>
                        )}
                    </ul>
                </SheetContent>
            </Sheet>

            {/* القائمة الرئيسية لسطح المكتب */}
            <div className="hidden md:flex space-x-6">
                <Link to="/" className="hover:text-pink-400">🏠 Home</Link>
                <div className="relative group">
                    <div className="cursor-pointer flex items-center gap-1" onClick={() => setIsOpen(!isOpen)}>
                        📋 Tables <IoIosArrowDown />
                    </div>
                    {isOpen && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute left-0 mt-2 w-64 bg-gray-800 p-4 rounded-lg shadow-lg">
                            <Link to="/operateur" className="block hover:text-pink-400">👨‍💼 Operateur</Link>
                            <Link to="/chauffeur" className="block hover:text-pink-400">🚗 Chauffeur</Link>
                            <Link to="/vehecule" className="block hover:text-pink-400">🚛 Véhicule</Link>
                        </motion.div>
                    )}
                </div>
                <Link to="/statistique" className="hover:text-pink-400">📊 Statistique</Link>
                <div className="relative group">
                    <div className="cursor-pointer flex items-center gap-1" onClick={() => setIsOpenCreate(!isOpenCreate)}>
                        ✏️ Create <IoIosArrowDown />
                    </div>
                    {isOpenCreate && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute  left-0 mt-2 w-64 bg-gray-800 p-4 rounded-lg shadow-lg">
                            <Link to="/create-operateur" className="block hover:text-pink-400">👨‍💼 Create Operateur</Link>
                            <Link to="/create-chauffeur" className="block hover:text-pink-400">🚗 Create Chauffeur</Link>
                            <Link to="/create-vehecule" className="block hover:text-pink-400">🚛 Create Véhicule</Link>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* أزرار تسجيل الدخول والتسجيل لسطح المكتب */}
            <div className="hidden md:flex space-x-4">
                {userData ? (
                    <Button onClick={logout} color="error" className="cursor-pointer ">🚪 Logout</Button>
                ) : (
                    <Link to="/login" className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600">
                        🔑 Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
