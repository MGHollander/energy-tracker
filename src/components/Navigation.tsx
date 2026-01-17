'use client';

import { useAuth } from "@/lib/auth-context";
import { useHouses } from "@/hooks/useHouses";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

function Navigation() {
    const { user, signOut } = useAuth();
    const { houses } = useHouses();
    const router = useRouter();
    const [selectedHouse, setSelectedHouse] = useState<string>('');

    useEffect(() => {
        if (houses.length > 0) {
            const defaultHouse = houses.find(h => h.is_default);
            setSelectedHouse(defaultHouse?.id || houses[0]?.id || '');
        }
    }, [houses]);

    console.log("Navigation component rendered - validating client-side execution");

    return (
        <header className="bg-white dark:bg-gray-800 shadow">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center text-xl font-bold text-gray-900 dark:text-white">
                            Energy Tracker
                        </Link>
                        {user && (
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                    Dashboard
                                </Link>
                                <Link href="/houses" className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                    Houses
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        {user && houses.length > 0 && (
                            <select
                                value={selectedHouse}
                                onChange={(e) => {
                                    setSelectedHouse(e.target.value);
                                    router.push(`/houses/${e.target.value}`);
                                }}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                {houses.map(house => (
                                    <option key={house.id} value={house.id}>{house.name}</option>
                                ))}
                            </select>
                        )}
                        {user ? (
                            <button onClick={signOut} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                                Sign Out
                            </button>
                        ) : (
                            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Navigation;