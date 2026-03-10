"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

type Reservation = {
  id: string;
  staff: string;
  date: string;
  time: string;
  name: string;
  tel: string;
  email: string;
  course: number;
  note?: string;
  status: "pending" | "approved" | "canceled";
};

export default function ReservationList() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setIsAdmin(session.user.user_metadata?.role === "admin");
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, [router]);

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
    if (!isCheckingAuth) {
      loadReservations();
    }
  }, [isCheckingAuth]);

  const approveReservation = async (reservation: Reservation) => {
    try {
      const { data: conflictCheck, error: conflictError } = await supabase.rpc(
        "check_reservation_conflict",
        {
          p_staff: reservation.staff,
          p_date: reservation.date,
          p_time: reservation.time,
          p_course: reservation.course,
          p_exclude_id: reservation.id,
        }
      );

      if (conflictError) {
        console.error("重複チェックエラー:", conflictError);
        alert("予約確認中にエラーが発生しました");
        return;
      }

      if (conflictCheck === true) {
        alert("この時間帯は既に承認済みの予約があります。承認できません。");
        return;
      }

      await supabase
        .from("reservations")
        .update({ status: "approved" })
        .eq("id", reservation.id);

      loadReservations();
      alert("予約を承認しました");
    } catch (err) {
      console.error("予期しないエラー:", err);
      alert("承認処理中にエラーが発生しました");
    }
  };

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

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-beige/60">認証確認中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ページタイトル＋フィルター */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-heading text-beige tracking-wider">RESERVATIONS</h1>

        <div className="flex gap-2 items-center flex-wrap">
          <button
            onClick={() => setShowPendingOnly((v) => !v)}
            className={`px-4 py-2 text-sm rounded-lg border-2 transition-all font-bold
              ${
                showPendingOnly
                  ? "bg-bronze text-navy border-bronze"
                  : "bg-navy/50 text-beige/60 border-beige/20 hover:border-bronze/50"
              }`}
          >
            未承認のみ
          </button>

          <button
            onClick={() => setViewMode("card")}
            className={`px-4 py-2 text-sm rounded-lg border-2 transition-all font-bold
              ${
                viewMode === "card"
                  ? "bg-beige text-navy border-beige"
                  : "bg-navy/50 text-beige/60 border-beige/20 hover:border-beige/50"
              }`}
          >
            カード
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 text-sm rounded-lg border-2 transition-all font-bold
              ${
                viewMode === "list"
                  ? "bg-beige text-navy border-beige"
                  : "bg-navy/50 text-beige/60 border-beige/20 hover:border-beige/50"
              }`}
          >
            リスト
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center text-beige/60 py-20">
          <p className="text-lg">読み込み中...</p>
        </div>
      )}

      {!loading && viewMode === "card" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredReservations.map((r) => (
            <div
              key={r.id}
              className="bg-charcoal/50 rounded-xl border border-bronze/20 p-6 backdrop-blur
                hover:border-bronze/40 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-beige/50 tracking-wide mb-1">
                    {r.date} {r.time}
                  </p>
                  <p className="text-xl font-heading text-beige tracking-wide">
                    {r.staff}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 text-xs rounded-lg font-bold
                    ${
                      r.status === "approved"
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : r.status === "pending"
                        ? "bg-bronze/20 text-bronze border border-bronze/30"
                        : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                    }`}
                >
                  {r.status === "approved" ? "承認済み" : r.status === "pending" ? "未承認" : "キャンセル"}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-beige/80 text-sm">
                <p><span className="text-beige/50">名前:</span> {r.name}</p>
                {isAdmin ? (
                  <>
                    <p><span className="text-beige/50">電話:</span> {r.tel}</p>
                    <p><span className="text-beige/50">メール:</span> {r.email}</p>
                  </>
                ) : (
                  <p className="text-beige/30 text-xs">連絡先は管理者のみ表示</p>
                )}
                <p><span className="text-beige/50">コース:</span> {r.course}分</p>
                {r.note && (
                  <p className="text-xs text-beige/60 mt-2 p-2 bg-navy/30 rounded">
                    {r.note}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  disabled={r.status !== "pending"}
                  onClick={() => approveReservation(r)}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all
                    ${
                      r.status === "pending"
                        ? "bg-beige text-navy hover:bg-bronze hover:scale-105"
                        : "bg-navy/30 text-beige/30 cursor-not-allowed"
                    }`}
                >
                  承認
                </button>

                <button
                  onClick={() => cancelReservation(r.id)}
                  className="flex-1 py-3 rounded-lg border-2 border-beige/20 text-beige/80
                    font-bold hover:border-bronze/50 hover:text-beige transition-all"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && viewMode === "list" && (
        <div className="overflow-x-auto bg-charcoal/50 rounded-xl border border-bronze/20">
          <table className="w-full text-sm">
            <thead className="bg-navy/50 text-beige/80 font-bold border-b border-bronze/20">
              <tr>
                <th className="py-4 px-4 text-left">日時</th>
                <th className="py-4 px-4 text-left">スタッフ</th>
                <th className="py-4 px-4 text-left">名前</th>
                {isAdmin && <th className="py-4 px-4 text-left">連絡先</th>}
                <th className="py-4 px-4 text-left">コース</th>
                <th className="py-4 px-4 text-left">状態</th>
                <th className="py-4 px-4 text-right">操作</th>
              </tr>
            </thead>

            <tbody>
              {filteredReservations.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-bronze/10 hover:bg-navy/30 transition text-beige/80"
                >
                  <td className="py-4 px-4 font-medium whitespace-nowrap">
                    {r.date}<br />
                    <span className="text-xs text-beige/50">{r.time}</span>
                  </td>
                  <td className="py-4 px-4 font-heading text-beige">{r.staff}</td>
                  <td className="py-4 px-4">{r.name}</td>
                  {isAdmin && (
                    <td className="py-4 px-4 text-xs">
                      {r.tel}<br />
                      <span className="text-beige/50">{r.email}</span>
                    </td>
                  )}
                  <td className="py-4 px-4">{r.course}分</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block text-xs font-bold px-3 py-1 rounded-lg
                        ${
                          r.status === "approved"
                            ? "bg-green-500/20 text-green-300"
                            : r.status === "pending"
                            ? "bg-bronze/20 text-bronze"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                    >
                      {r.status === "approved" ? "承認済み" : r.status === "pending" ? "未承認" : "キャンセル"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <button
                      disabled={r.status !== "pending"}
                      onClick={() => approveReservation(r)}
                      className={`font-bold mr-4 transition
                        ${
                          r.status === "pending"
                            ? "text-bronze hover:text-beige"
                            : "text-beige/20 cursor-not-allowed"
                        }`}
                    >
                      承認
                    </button>
                    <button
                      onClick={() => cancelReservation(r.id)}
                      className="text-beige/60 hover:text-beige transition font-bold"
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

      {!loading && filteredReservations.length === 0 && (
        <div className="text-center py-20">
          <p className="text-beige/40 text-lg">予約がありません</p>
        </div>
      )}
    </div>
  );
}
