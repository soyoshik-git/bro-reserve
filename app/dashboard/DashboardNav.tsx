"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";

export default function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const email = session.user.email || "";
      const name = email.split("@")[0];
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      const role = session.user.user_metadata?.role;
      setIsAdmin(role === "admin");
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

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3000);
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

  const adminIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const isAdminActive = pathname.startsWith("/dashboard/admin");

  return (
    <>
      {/* トースト */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] px-5 py-3
          bg-charcoal border border-bronze/40 rounded-xl shadow-2xl shadow-navy/60
          text-beige text-sm font-medium whitespace-nowrap
          animate-fade-in">
          {toast}
        </div>
      )}

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
                  {isAdmin && (
                    <p className="text-xs text-bronze mt-0.5">管理者</p>
                  )}
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
            {/* 予約・スケジュール */}
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

            {/* 管理者 */}
            {isAdmin ? (
              <Link
                href="/dashboard/admin"
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all
                  ${isAdminActive ? "text-bronze" : "text-beige/40 hover:text-beige/70"}`}
              >
                {adminIcon}
                <span className="text-xs font-medium">管理者</span>
                {isAdminActive && (
                  <span className="absolute bottom-0 w-12 h-0.5 bg-bronze rounded-full" />
                )}
              </Link>
            ) : (
              <button
                onClick={() => showToast("管理者のみアクセスできます")}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-all
                  text-beige/20 cursor-not-allowed"
              >
                {adminIcon}
                <span className="text-xs font-medium">管理者</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
