"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import Link from "next/link";

export default function ReserveFormPage() {
  const params = useSearchParams();

  const date = params.get("date");
  const time = params.get("time");
  const staff = params.get("staff");

  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("60");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !tel || !email) {
      alert("必須項目を入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      // 重複チェック
      const { data: conflictData, error: conflictError } = await supabase.rpc(
        'check_reservation_conflict',
        {
          p_staff: staff,
          p_date: date,
          p_time: time,
          p_course: parseInt(course),
          p_exclude_id: null
        }
      );

      if (conflictError) {
        console.error("重複チェックエラー:", conflictError);
        alert("予約の確認中にエラーが発生しました");
        setIsSubmitting(false);
        return;
      }

      if (conflictData === true) {
        alert("申し訳ございません。この時間帯は既に予約が入っています。別の時間帯をお選びください。");
        setIsSubmitting(false);
        return;
      }

      // 予約登録
      const { error } = await supabase.from("reservations").insert({
        staff,
        date,
        time,
        name,
        tel,
        email,
        course: parseInt(course),
        note,
        status: "pending",
      });

      if (error) {
        console.error("予約登録エラー:", error);
        alert("予約登録に失敗しました");
        setIsSubmitting(false);
        return;
      }

      window.location.href = "/reserve/complete";
    } catch (err) {
      console.error("予期しないエラー:", err);
      alert("予約処理中にエラーが発生しました");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-navy relative">
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-charcoal to-navy opacity-90" />

      <div className="relative z-10 max-w-2xl mx-auto p-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-heading text-beige tracking-wider">BOOKING FORM</h1>
          <Link 
            href="/reserve"
            className="text-beige/60 hover:text-beige transition text-sm"
          >
            ← 戻る
          </Link>
        </div>

        {/* 予約概要 */}
        <div className="bg-charcoal/50 border border-bronze/20 rounded-xl p-6 mb-6 backdrop-blur">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-beige/50 mb-1 tracking-wide">STAFF</p>
              <p className="font-bold text-beige text-lg">{staff}</p>
            </div>
            <div>
              <p className="text-xs text-beige/50 mb-1 tracking-wide">DATE</p>
              <p className="font-bold text-beige text-lg">{date}</p>
            </div>
            <div>
              <p className="text-xs text-beige/50 mb-1 tracking-wide">TIME</p>
              <p className="font-bold text-beige text-lg">{time}</p>
            </div>
          </div>
        </div>

        {/* フォーム */}
        <div className="bg-charcoal/50 border border-bronze/20 rounded-xl p-6 backdrop-blur space-y-5">
          {/* 名前 */}
          <div>
            <label className="text-sm text-beige/80 font-bold tracking-wide block mb-2">
              お名前 <span className="text-bronze">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-navy/50 border border-beige/20 rounded-lg p-4 text-beige
                placeholder-beige/30 focus:outline-none focus:ring-2 focus:ring-bronze transition"
              placeholder="山田 太郎"
              required
            />
          </div>

          {/* 電話番号 */}
          <div>
            <label className="text-sm text-beige/80 font-bold tracking-wide block mb-2">
              電話番号 <span className="text-bronze">*</span>
            </label>
            <input
              type="tel"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              className="w-full bg-navy/50 border border-beige/20 rounded-lg p-4 text-beige
                placeholder-beige/30 focus:outline-none focus:ring-2 focus:ring-bronze transition"
              placeholder="09012345678"
              required
            />
          </div>

          {/* メール */}
          <div>
            <label className="text-sm text-beige/80 font-bold tracking-wide block mb-2">
              メールアドレス <span className="text-bronze">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-navy/50 border border-beige/20 rounded-lg p-4 text-beige
                placeholder-beige/30 focus:outline-none focus:ring-2 focus:ring-bronze transition"
              placeholder="example@example.com"
              required
            />
          </div>

          {/* コース */}
          <div>
            <label className="text-sm text-beige/80 font-bold tracking-wide block mb-2">
              コース時間
            </label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full bg-navy/50 border border-beige/20 rounded-lg p-4 text-beige
                focus:outline-none focus:ring-2 focus:ring-bronze transition"
            >
              <option value="60">60分</option>
              <option value="90">90分</option>
              <option value="120">120分</option>
              <option value="180">180分</option>
            </select>
          </div>

          {/* メモ */}
          <div>
            <label className="text-sm text-beige/80 font-bold tracking-wide block mb-2">
              その他要望（任意）
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-navy/50 border border-beige/20 rounded-lg p-4 text-beige
                placeholder-beige/30 focus:outline-none focus:ring-2 focus:ring-bronze transition"
              placeholder="ご希望など自由にご記入ください"
              rows={4}
            />
          </div>
        </div>

        {/* 送信ボタン */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !name || !tel || !email}
          className={`w-full mt-6 py-5 rounded-xl font-bold text-lg transition-all
            ${
              isSubmitting || !name || !tel || !email
                ? "bg-navy/30 text-beige/30 border-2 border-beige/10 cursor-not-allowed"
                : "bg-beige text-navy shadow-2xl hover:bg-bronze hover:scale-105 border-2 border-bronze/20"
            }`}
        >
          {isSubmitting ? "確認中..." : "この内容で予約問い合わせを送信"}
        </button>

        <p className="text-xs text-beige/40 text-center mt-4">
          ※ こちらは予約問い合わせです。スタッフが確認後、正式な予約確定となります。
        </p>
      </div>
    </main>
  );
}
