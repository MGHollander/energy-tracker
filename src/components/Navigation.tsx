'use client';

import { useAuth } from "@/lib/auth-context";
import { useHouses } from "@/hooks/useHouses";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

function Navigation() {
    const { user, signOut } = useAuth();
    const { houses } = useHouses();
    const router = useRouter();
    const pathname = usePathname();
    const [selectedHouse, setSelectedHouse] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (houses.length > 0) {
            let houseId = selectedHouse; // Start with current selection
            if (pathname.startsWith('/houses/')) {
                const pathParts = pathname.split('/');
                if (pathParts.length >= 3) {
                    const id = pathParts[2];
                    if (houses.some(h => h.id === id)) {
                        houseId = id;
                    }
                }
            } else if (!houseId || !houses.some(h => h.id === houseId)) {
                // If no current selection or invalid, set to default
                const defaultHouse = houses.find(h => h.is_default);
                houseId = defaultHouse?.id || houses[0]?.id || '';
            }
            setSelectedHouse(houseId);
        }
    }, [houses, pathname, selectedHouse]);

    return (
        <header className="bg-white dark:bg-gray-800 shadow">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center text-xl font-bold text-gray-900 dark:text-white">
                            Energy Tracker
                        </Link>
                        {user && (
                             <div className="hidden lg:flex items-center space-x-4 ml-10">
                                 <Link href={selectedHouse ? `/houses/${selectedHouse}` : "/"} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                     Dashboard
                                 </Link>
                                 {user && selectedHouse && (
                                     <Link
                                         href={`/houses/${selectedHouse}/statistics`}
                                         className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                     >
                                         Statistics
                                     </Link>
                                 )}
                                <Link href="/houses" className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                     Houses
                                 </Link>
                             </div>
                         )}
                    </div>
                    <div className="flex items-center">
                        {user && (
                            <>
                                <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white p-2 rounded-md text-3xl">
                                    ☰
                                </button>
                                <div className="hidden lg:flex items-center space-x-4">
                                    <button onClick={signOut} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap">
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                        {!user && (
                            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
             </nav>
             {isOpen && user && (
                 <div className="lg:hidden bg-white dark:bg-gray-800 px-4 py-2 space-y-2 border-t">
                     <Link href={selectedHouse ? `/houses/${selectedHouse}` : "/"} onClick={() => setIsOpen(false)} className="block text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                         Dashboard
                     </Link>
                     {selectedHouse && (
                         <Link
                             href={`/houses/${selectedHouse}/statistics`}
                             onClick={() => setIsOpen(false)}
                             className="block text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                         >
                             Statistics
                         </Link>
                     )}
                    <Link href="/houses" onClick={() => setIsOpen(false)} className="block text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                         Houses
                     </Link>
                     <button onClick={() => { signOut(); setIsOpen(false); }} className="block w-full text-left bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                         Sign Out
                     </button>
                 </div>
             )}
         </header>
    );
}

export default Navigation;