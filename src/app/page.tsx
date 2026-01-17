"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Auth from "@/components/Auth";
import { useAuth } from "@/lib/auth-context";
import { useHouses } from "@/hooks/useHouses";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { houses, loading: housesLoading } = useHouses();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user && !housesLoading) {
      const defaultHouse = houses.find(h => h.is_default);
      if (defaultHouse) {
        router.push(`/houses/${defaultHouse.id}`);
      } else {
        router.push('/houses');
      }
    }
  }, [authLoading, user, housesLoading, houses, router]);

  if (authLoading || (user && housesLoading)) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Auth />
      </main>
    );
  }

  return null;
}
