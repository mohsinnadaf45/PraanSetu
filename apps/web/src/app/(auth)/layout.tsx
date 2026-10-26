import React from "react";
import { Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#fbfbf9] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-lg bg-[#1e3a2f] text-white flex items-center justify-center font-serif font-bold text-2xl mx-auto shadow-sm">
          PS
        </div>
        <h2 className="mt-4 font-serif text-2xl font-bold tracking-tight text-stone-900">
          PraanSetu
        </h2>
        <p className="mt-1 text-xs text-stone-500 uppercase tracking-widest">
          National Organ Allocation Network
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card border border-stone-200/90 rounded-lg sm:px-10">
          {children}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-500">
          <Shield className="w-3.5 h-3.5 text-emerald-700" />
          <span>Multi-factor authentication & encrypted identity isolation enforced</span>
        </div>
      </div>
    </main>
  );
}
