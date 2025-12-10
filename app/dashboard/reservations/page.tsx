"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function ReservationListPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reservations:", error);
      } else {
        setReservations(data || []);
      }

      setLoading(false);
    };

    fetchReservations();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F7F9] p-5">
      <div className="w-full">
        <h1 className="text-2xl font-bold text-[#111827] mb-6">
          予約一覧（テスト）
        </h1>

        {loading ? (
          <p className="text-gray-600">読み込み中...</p>
        ) : reservations.length === 0 ? (
          <p className="text-gray-600">現在予約はありません。</p>
        ) : (
          <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-[#F3F4F6] text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">日時</th>
                    <th className="px-4 py-3 font-medium">スタッフ</th>
                    <th className="px-4 py-3 font-medium">コース</th>
                    <th className="px-4 py-3 font-medium">お客様</th>
                    <th className="px-4 py-3 font-medium">ステータス</th>
                    <th className="px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r, index) => (
                    <tr
                      key={r.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"}
                    >
                      <td className="px-4 py-3 align-top text-[#111827]">
                        <div className="font-medium">{r.date}</div>
                        <div className="text-xs text-gray-500">{r.time}</div>
                      </td>
                      <td className="px-4 py-3 align-top text-[#111827]">{r.staff}</td>
                      <td className="px-4 py-3 align-top text-[#111827]">{r.course}分</td>
                      <td className="px-4 py-3 align-top text-[#111827]">{r.name}</td>
                      <td className="px-4 py-3 align-top">
                        {r.status === "approved" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-[2px] text-[10px] font-semibold text-green-700 border border-green-200">
                            ✔ 承認済み
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-yellow-50 px-2 py-[2px] text-[10px] font-semibold text-yellow-700 border border-yellow-200">
                            ⏳ 承認待ち
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {r.status === "approved" ? (
                          <button
                            disabled
                            className="bg-green-100 text-green-700 px-3 py-2 rounded-xl text-xs font-medium cursor-not-allowed border border-green-200"
                          >
                            ✔ 承認済み
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              const { error } = await supabase
                                .from("reservations")
                                .update({ status: "approved" })
                                .eq("id", r.id);

                              if (error) {
                                console.error(error);
                                alert("承認に失敗しました");
                                return;
                              }

                              const { data } = await supabase
                                .from("reservations")
                                .select("*")
                                .order("created_at", { ascending: false });

                              setReservations(data || []);
                            }}
                            className="bg-[#D9A441] text-black px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#E5B751] transition"
                          >
                            承認する
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
