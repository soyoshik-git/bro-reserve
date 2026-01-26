"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        setError("ログインに失敗しました。メールアドレスとパスワードを確認してください。");
        setIsLoading(false);
        return;
      }

      if (data.session) {
        // ログイン成功
        window.location.href = "/dashboard/reservations";
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("予期しないエラーが発生しました。");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-navy relative flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-charcoal to-navy opacity-90" />

      <div className="relative z-10 max-w-md w-full mx-auto p-6">
        <div className="bg-charcoal/50 border border-bronze/20 rounded-xl p-8 backdrop-blur">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading text-beige mb-2 tracking-wider">
              STAFF LOGIN
            </h1>
            <p className="text-beige/60 text-sm">管理画面へのログイン</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-beige/80 mb-2 tracking-wide">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-navy/50 border border-beige/20 rounded-lg p-4 text-beige
                  placeholder-beige/30 focus:outline-none focus:ring-2 focus:ring-bronze transition"
                placeholder="admin@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-beige/80 mb-2 tracking-wide">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-navy/50 border border-beige/20 rounded-lg p-4 text-beige
                  placeholder-beige/30 focus:outline-none focus:ring-2 focus:ring-bronze transition"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all
                ${
                  isLoading
                    ? "bg-navy/30 text-beige/30 cursor-not-allowed"
                    : "bg-beige text-navy shadow-2xl hover:bg-bronze hover:scale-105 border-2 border-bronze/20"
                }`}
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-beige/60 hover:text-beige text-sm transition">
              ← トップページへ戻る
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
