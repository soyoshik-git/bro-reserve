"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

type Reservation = {
  id: string;
  staff: string;
  date: string;
  time: string;
  name: string;
  tel: string;
  course: string;
  status: "pending" | "approved" | "canceled";
};

export default function ReservationList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  /** データ取得 */
  const loadReservations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .order("date", { ascending: true });

    setReservations((data as Reservation[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadReservations();
  }, []);

  /** 承認 */
  const approveReservation = async (id: string) => {
    await supabase
      .from("reservations")
      .update({ status: "approved" })
      .eq("id", id);

    loadReservations();
  };

  /** キャンセル */
  const cancelReservation = async (id: string) => {
    if (!confirm("この予約をキャンセルしますか？")) return;

    await supabase
      .from("reservations")
      .update({ status: "canceled" })
      .eq("id", id);

    loadReservations();
  };

  const filteredReservations = showPendingOnly
    ? reservations.filter((r) => r.status === "pending")
    : reservations;

  return (
    <main className="min-h-screen bg-[#F7F7F9] p-5">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-[#111827]">予約一覧</h1>

          <div className="flex gap-2">
            <button
              onClick={() => setShowPendingOnly((v) => !v)}
              className={`px-3 py-1.5 text-sm rounded-full border
                ${
                  showPendingOnly
                    ? "bg-[#D9A441] text-black border-[#D9A441]"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
            >
              未承認のみ
            </button>

            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-1.5 text-sm rounded-lg border
                ${
                  viewMode === "card"
                    ? "bg-[#111827] text-white"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
            >
              カード
            </button>

            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-sm rounded-lg border
                ${
                  viewMode === "list"
                    ? "bg-[#111827] text-white"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
            >
              リスト
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-center text-gray-600 py-10">読み込み中...</p>
        )}

        {/* ========== カードUI ========== */}
        {!loading && viewMode === "card" && (
          <div className="space-y-4">
            {filteredReservations.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4"
              >
                {/* 上段 */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm text-gray-600">
                      {r.date} {r.time}
                    </p>
                    <p className="text-lg font-semibold text-[#111827]">
                      {r.staff}
                    </p>
                    <p className="text-sm text-gray-700">{r.name}</p>
                    <p className="text-sm text-gray-700">{r.tel}</p>
                    <p className="text-sm text-gray-700">{r.course}</p>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold
                      ${
                        r.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : r.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {r.status === "approved"
                      ? "承認済み"
                      : r.status === "pending"
                      ? "未承認"
                      : "キャンセル"}
                  </span>
                </div>

                {/* ボタン */}
                <div className="flex gap-3 mt-3">
                  <button
                    disabled={r.status !== "pending"}
                    onClick={() => approveReservation(r.id)}
                    className={`flex-1 py-2 rounded-xl font-semibold transition
                      ${
                        r.status === "pending"
                          ? "bg-[#D9A441] text-black"
                          : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    承認
                  </button>

                  <button
                    onClick={() => cancelReservation(r.id)}
                    className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== リストUI（PC向け） ========== */}
        {!loading && viewMode === "list" && (
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
            <table className="w-full text-sm text-[#111827]">
              <thead className="bg-gray-100 text-gray-800 font-semibold">
                <tr>
                  <th className="py-4 px-4 text-left">日時</th>
                  <th className="py-4 px-4 text-left">スタッフ</th>
                  <th className="py-4 px-4 text-left">名前</th>
                  <th className="py-4 px-4 text-left">コース</th>
                  <th className="py-4 px-4 text-left">状態</th>
                  <th className="py-4 px-4 text-right">操作</th>
                </tr>
              </thead>

              <tbody>
                {filteredReservations.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t hover:bg-[#FAF7F0] transition"
                  >
                    <td className="py-4 px-4 font-medium">
                      {r.date} {r.time}
                    </td>
                    <td className="py-4 px-4">{r.staff}</td>
                    <td className="py-4 px-4">{r.name}</td>
                    <td className="py-4 px-4 text-gray-700">{r.course}</td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block text-xs font-semibold px-3 py-1 rounded-full
                  ${
                    r.status === "approved"
                      ? "bg-[#E6F8EC] text-[#166534]"
                      : r.status === "pending"
                      ? "bg-[#FFF3D6] text-[#8A5B00]"
                      : "bg-gray-200 text-gray-600"
                  }`}
                      >
                        {r.status === "approved"
                          ? "承認済み"
                          : r.status === "pending"
                          ? "未承認"
                          : "キャンセル"}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        disabled={r.status !== "pending"}
                        onClick={() => approveReservation(r.id)}
                        className="text-[#D9A441] font-semibold mr-4 disabled:text-gray-400"
                      >
                        承認
                      </button>
                      <button
                        onClick={() => cancelReservation(r.id)}
                        className="text-gray-700 hover:text-black"
                      >
                        キャンセル
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
