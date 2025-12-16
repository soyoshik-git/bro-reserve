"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F7F9] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-wide">
            BRO
          </h1>
          <p className="text-sm text-gray-600">メンズマッサージ予約システム</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/reserve"
            className="block w-full py-4 rounded-2xl font-bold text-black
              bg-[#D9A441] hover:bg-[#E5B751] transition shadow-lg"
          >
            予約する
          </Link>

          <Link
            href="/dashboard/reservations"
            className="block w-full py-4 rounded-2xl font-bold
              bg-white text-[#111827] border border-gray-300
              hover:bg-gray-100 transition"
          >
            予約一覧（管理）
          </Link>
        </div>

        <p className="text-xs text-gray-400 pt-6">© BRO Massage Service</p>
      </div>
    </main>
  );
}
