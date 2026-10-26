"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isUserAuthenticated } from "@/lib/auth";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (isUserAuthenticated()) {
      router.replace("/home");
    } else {
      router.replace("/sign-in");
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#fbfbf9]">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-md bg-[#1e3a2f] text-white flex items-center justify-center font-serif font-bold text-xl mx-auto animate-pulse">
          PS
        </div>
        <p className="font-serif text-sm font-semibold text-stone-700">Connecting to PraanSetu...</p>
      </div>
    </div>
  );
}
