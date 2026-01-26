"use client";

import Link from "next/link";

export default function ReserveCompletePage() {
  return (
    <main className="min-h-screen bg-navy relative flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-charcoal to-navy opacity-90" />

      <div className="relative z-10 max-w-2xl mx-auto p-6 text-center">
        <div className="bg-charcoal/50 border-2 border-bronze/30 shadow-2xl shadow-bronze/20 rounded-xl p-12 backdrop-blur">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-bronze/20 rounded-full flex items-center justify-center border-2 border-bronze">
              <svg 
                className="w-10 h-10 text-bronze" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-heading text-beige mb-6 tracking-wider">
            BOOKING RECEIVED
          </h1>

          <p className="text-beige/80 mb-8 leading-relaxed">
            ご予約問い合わせを受け付けました。
            <br />
            <br />
            スタッフが内容を確認後、
            <br />
            改めて確定のご連絡を差し上げます。
            <br />
            <br />
            しばらくお待ちください。
          </p>

          <div className="space-y-4">
            <Link
              href="/"
              className="block w-full py-4 px-8 rounded-xl font-bold text-navy
                bg-beige hover:bg-bronze transition-all duration-300 shadow-xl
                hover:scale-105 border-2 border-bronze/20"
            >
              トップページへ
            </Link>

            <Link
              href="/reserve"
              className="block w-full py-3 px-8 rounded-xl font-medium text-beige/80
                bg-navy/50 hover:bg-navy transition-all duration-300
                border border-beige/20 hover:border-beige/40"
            >
              続けて予約する
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
