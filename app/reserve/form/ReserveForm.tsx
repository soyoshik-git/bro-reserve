"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function ReserveFormPage() {
  const params = useSearchParams();

  // 前ページから受け取るパラメータ（後で渡す実装を追加する）
  const date = params.get("date");
  const time = params.get("time");
  const staff = params.get("staff");

  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("60");
  const [note, setNote] = useState("");

  return (
    <main className="min-h-screen bg-[#F7F7F9] p-5">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-[#111827]">
          予約情報の入力
        </h1>

        {/* 予約の概要 */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 mb-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">スタッフ</p>
          <p className="font-medium text-[#111827] mb-3">{staff}</p>

          <p className="text-sm text-gray-500 mb-1">日時</p>
          <p className="font-medium text-[#111827]">
            {date} {time}
          </p>
        </div>

        {/* フォーム */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm space-y-5">
          {/* 名前 */}
          <div>
            <label className="text-sm text-gray-600">お名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F3F4F6] border border-[#D1D5DB] rounded-xl p-3 mt-1 text-[#111827]"
              placeholder="山田 太郎"
            />
          </div>

          {/* 電話番号 */}
          <div>
            <label className="text-sm text-gray-600">電話番号</label>
            <input
              type="tel"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              className="w-full bg-[#F3F4F6] border border-[#D1D5DB] rounded-xl p-3 mt-1 text-[#111827]"
              placeholder="09012345678"
            />
          </div>

          {/* メール */}
          <div>
            <label className="text-sm text-gray-600">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F3F4F6] border border-[#D1D5DB] rounded-xl p-3 mt-1 text-[#111827]"
              placeholder="example@example.com"
            />
          </div>

          {/* コース */}
          <div>
            <label className="text-sm text-gray-600">コース</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full bg-[#F3F4F6] border border-[#D1D5DB] rounded-xl p-3 mt-1 text-[#111827]"
            >
              <option value="60">60分</option>
              <option value="90">90分</option>
              <option value="120">120分</option>
              <option value="180">180分</option>
            </select>
          </div>

          {/* メモ */}
          <div>
            <label className="text-sm text-gray-600">メモ（任意）</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#F3F4F6] border border-[#D1D5DB] rounded-xl p-3 mt-1 text-[#111827]"
              placeholder="ご希望など自由にご記入ください"
              rows={3}
            />
          </div>
        </div>

        {/* 予約確定ボタン */}
        <button
          onClick={async () => {
            const { data, error } = await supabase.from("reservations").insert({
              staff,
              date,
              time,
              name,
              tel,
              email,
              course,
              note,
              status: "pending",
            });

            if (error) {
              console.error(error);
              alert("予約登録に失敗しました");
              return;
            }

            window.location.href = "/reserve/complete";
          }}
          className="w-full mt-6 bg-[#D9A441] text-black font-bold py-4 rounded-2xl shadow-md hover:bg-[#E5B751] transition"
        >
          この内容で予約する
        </button>
      </div>
    </main>
  );
}
