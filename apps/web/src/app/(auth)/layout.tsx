import React from "react";
import { Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-md bg-accent text-white flex items-center justify-center font-serif font-bold text-2xl mx-auto">
          PS
        </div>
        <h2 className="mt-4 font-serif text-2xl font-bold tracking-tight text-ink">
          PraanSetu
        </h2>
        <p className="mt-1 text-xs text-ink-secondary uppercase tracking-widest">
          National Organ Allocation Network
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-6 border border-ink-border rounded-md sm:px-10">
          {children}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-secondary">
          <Shield className="w-3.5 h-3.5 text-status-green" />
          <span>Multi-factor authentication & encrypted identity isolation enforced</span>
        </div>
      </div>
    </main>
  );
}

