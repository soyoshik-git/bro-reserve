"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";

export default function AdminHub() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      const role = session.user.user_metadata?.role;
      if (role !== "admin") {
        // 管理者でない場合は予約ページへ
        router.push("/dashboard/reservations");
        return;
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-beige/60">認証確認中...</div>
      </div>
    );
  }

  const adminCards = [
    {
      href: "/dashboard/admin/users",
      label: "ユーザー管理",
      description: "スタッフアカウントの作成・編集・削除",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-heading text-beige tracking-wider">ADMIN</h1>
        <p className="text-beige/50 text-sm mt-1">管理者専用メニュー</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-charcoal/50 rounded-xl border border-bronze/20 p-6 backdrop-blur
              hover:border-bronze/50 hover:bg-charcoal/70 transition-all group"
          >
            <div className="text-bronze mb-4 group-hover:scale-110 transition-transform w-fit">
              {card.icon}
            </div>
            <h2 className="text-lg font-heading text-beige tracking-wide mb-1">
              {card.label}
            </h2>
            <p className="text-sm text-beige/50">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
