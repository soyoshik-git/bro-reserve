"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-navy relative overflow-hidden">
      {/* Background texture/gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-charcoal to-navy opacity-90" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Logo Section */}
        <div className="mb-12 text-center">
          <div className="mb-6 relative w-[280px] h-[280px] mx-auto">
            <Image
              src="/logo.png"
              alt="BRO Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="w-full max-w-md space-y-5">
          <Link
            href="/reserve"
            className="block w-full py-5 px-8 rounded-xl font-bold text-xl text-navy
              bg-beige hover:bg-bronze transition-all duration-300 shadow-2xl
              hover:scale-105 hover:shadow-bronze/50 text-center
              border-2 border-bronze/20"
          >
            予約する
          </Link>

          <Link
            href="/dashboard/reservations"
            className="block w-full py-4 px-8 rounded-xl font-medium text-beige/80
              bg-charcoal/50 hover:bg-charcoal transition-all duration-300
              text-center border border-beige/20 hover:border-beige/40"
          >
            予約一覧（管理）
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-xs text-beige/40 tracking-wider">
            © 2026 BRO MASSAGE SERVICE
          </p>
        </div>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-bronze/30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-bronze/30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-bronze/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-bronze/30" />
    </main>
  );
}
