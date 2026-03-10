"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";

export default function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const email = session.user.email || "";
      const name = email.split("@")[0];
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    };
    fetchUser();
  }, []);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems = [
    {
      href: "/dashboard/reservations",
      label: "予約",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      href: "/dashboard/schedule",
      label: "スケジュール",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur border-b border-bronze/20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-xl font-heading text-beige tracking-widest">BRO</span>

          {/* ユーザーメニュー */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                text-beige/80 hover:text-beige hover:bg-charcoal/50 transition-all"
            >
              {/* ユーザーアイコン */}
              <div className="w-7 h-7 rounded-full bg-bronze/30 border border-bronze/50
                flex items-center justify-center text-xs font-bold text-bronze">
                {userName ? userName[0] : "?"}
              </div>
              <span className="text-sm font-medium">{userName || "..."}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* ドロップダウン */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-charcoal border border-bronze/20
                rounded-xl shadow-2xl shadow-navy/50 overflow-hidden">
                <div className="px-4 py-3 border-b border-bronze/10">
                  <p className="text-xs text-beige/40">ログイン中</p>
                  <p className="text-sm font-bold text-beige">{userName}</p>
                </div>
                {/* 将来: アカウント設定 */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-300
                    hover:bg-red-500/10 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ボトムナビ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur border-t border-bronze/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all
                    ${isActive ? "text-bronze" : "text-beige/40 hover:text-beige/70"}`}
                >
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 w-12 h-0.5 bg-bronze rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
