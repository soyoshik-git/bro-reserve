"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Schedule = {
  id: string;
  staff: string;
  day_of_week: number;
  is_working: boolean;
  start_time: string | null;
  end_time: string | null;
};

type Exception = {
  id: string;
  staff: string;
  date: string;
  is_working: boolean;
  start_time: string | null;
  end_time: string | null;
  note: string | null;
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function SchedulePage() {
  const router = useRouter();
  const [currentStaff, setCurrentStaff] = useState<string>("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 編集中の曜日
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editIsWorking, setEditIsWorking] = useState(true);
  const [editStartTime, setEditStartTime] = useState("10:00");
  const [editEndTime, setEditEndTime] = useState("20:00");

  // 例外追加フォーム
  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [exceptionDate, setExceptionDate] = useState("");
  const [exceptionIsWorking, setExceptionIsWorking] = useState(false);
  const [exceptionStartTime, setExceptionStartTime] = useState("10:00");
  const [exceptionEndTime, setExceptionEndTime] = useState("20:00");
  const [exceptionNote, setExceptionNote] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      // 仮: メールアドレスからスタッフ名を取得（本来はusersテーブルなどで管理）
      // 例: koshi@example.com → Koshi
      const email = session.user.email || "";
      const staff = email.split("@")[0];
      const staffName = staff.charAt(0).toUpperCase() + staff.slice(1);
      
      setCurrentStaff(staffName);
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const loadSchedules = async () => {
    if (!currentStaff) return;

    setLoading(true);
    const { data: scheduleData } = await supabase
      .from("staff_schedules")
      .select("*")
      .eq("staff", currentStaff)
      .order("day_of_week");

    const { data: exceptionData } = await supabase
      .from("staff_exceptions")
      .select("*")
      .eq("staff", currentStaff)
      .order("date");

    setSchedules((scheduleData as Schedule[]) || []);
    setExceptions((exceptionData as Exception[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isCheckingAuth && currentStaff) {
      loadSchedules();
    }
  }, [isCheckingAuth, currentStaff]);

  const handleEditDay = (dayOfWeek: number) => {
    const schedule = schedules.find((s) => s.day_of_week === dayOfWeek);
    if (schedule) {
      setEditingDay(dayOfWeek);
      setEditIsWorking(schedule.is_working);
      setEditStartTime(schedule.start_time || "10:00");
      setEditEndTime(schedule.end_time || "20:00");
    }
  };

  const handleSaveDay = async () => {
    if (editingDay === null) return;

    await supabase
      .from("staff_schedules")
      .update({
        is_working: editIsWorking,
        start_time: editIsWorking ? editStartTime : null,
        end_time: editIsWorking ? editEndTime : null,
      })
      .eq("staff", currentStaff)
      .eq("day_of_week", editingDay);

    setEditingDay(null);
    loadSchedules();
  };

  const handleAddException = async () => {
    if (!exceptionDate) {
      alert("日付を選択してください");
      return;
    }

    await supabase.from("staff_exceptions").insert({
      staff: currentStaff,
      date: exceptionDate,
      is_working: exceptionIsWorking,
      start_time: exceptionIsWorking ? exceptionStartTime : null,
      end_time: exceptionIsWorking ? exceptionEndTime : null,
      note: exceptionNote || null,
    });

    setShowExceptionForm(false);
    setExceptionDate("");
    setExceptionIsWorking(false);
    setExceptionStartTime("10:00");
    setExceptionEndTime("20:00");
    setExceptionNote("");
    loadSchedules();
  };

  const handleDeleteException = async (id: string) => {
    if (!confirm("この例外設定を削除しますか？")) return;

    await supabase.from("staff_exceptions").delete().eq("id", id);
    loadSchedules();
  };

  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-beige/60 text-lg">認証確認中...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-navy relative">
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-charcoal to-navy opacity-90" />

      <div className="relative z-10 max-w-4xl mx-auto p-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-heading text-beige tracking-wider mb-2">
              SCHEDULE
            </h1>
            <p className="text-beige/60 text-sm">{currentStaff}の出勤スケジュール</p>
          </div>
          <Link 
            href="/dashboard/reservations"
            className="text-beige/60 hover:text-beige transition text-sm"
          >
            ← 予約一覧
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-beige/60 py-20">
            <p className="text-lg">読み込み中...</p>
          </div>
        ) : (
          <>
            {/* 基本スケジュール */}
            <div className="bg-charcoal/50 border border-bronze/20 rounded-xl p-6 backdrop-blur mb-6">
              <h2 className="text-xl font-heading text-beige mb-4 tracking-wide">
                基本スケジュール
              </h2>

              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.day_of_week}
                    className="flex items-center justify-between p-4 bg-navy/30 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-beige font-bold w-8">
                        {WEEKDAYS[schedule.day_of_week]}
                      </span>
                      {editingDay === schedule.day_of_week ? (
                        <div className="flex items-center gap-3">
                          <select
                            value={editIsWorking ? "working" : "off"}
                            onChange={(e) => setEditIsWorking(e.target.value === "working")}
                            className="bg-navy/50 text-beige border border-beige/20 rounded px-3 py-1 text-sm"
                          >
                            <option value="working">出勤</option>
                            <option value="off">休み</option>
                          </select>
                          {editIsWorking && (
                            <>
                              <input
                                type="time"
                                value={editStartTime}
                                onChange={(e) => setEditStartTime(e.target.value)}
                                className="bg-navy/50 text-beige border border-beige/20 rounded px-3 py-1 text-sm"
                              />
                              <span className="text-beige/60">〜</span>
                              <input
                                type="time"
                                value={editEndTime}
                                onChange={(e) => setEditEndTime(e.target.value)}
                                className="bg-navy/50 text-beige border border-beige/20 rounded px-3 py-1 text-sm"
                              />
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-beige/80">
                          {schedule.is_working
                            ? `${schedule.start_time?.slice(0, 5)} 〜 ${schedule.end_time?.slice(0, 5)}`
                            : "休み"}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {editingDay === schedule.day_of_week ? (
                        <>
                          <button
                            onClick={handleSaveDay}
                            className="px-4 py-2 bg-bronze text-navy rounded-lg text-sm font-bold hover:bg-beige transition"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => setEditingDay(null)}
                            className="px-4 py-2 bg-navy/50 text-beige/80 border border-beige/20 rounded-lg text-sm hover:border-beige/40 transition"
                          >
                            キャンセル
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEditDay(schedule.day_of_week)}
                          className="px-4 py-2 bg-navy/50 text-beige/80 border border-beige/20 rounded-lg text-sm font-bold hover:border-bronze/50 transition"
                        >
                          編集
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 例外設定 */}
            <div className="bg-charcoal/50 border border-bronze/20 rounded-xl p-6 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-heading text-beige tracking-wide">
                  例外設定
                </h2>
                {!showExceptionForm && (
                  <button
                    onClick={() => setShowExceptionForm(true)}
                    className="px-4 py-2 bg-bronze text-navy rounded-lg text-sm font-bold hover:bg-beige transition"
                  >
                    + 例外を追加
                  </button>
                )}
              </div>

              {showExceptionForm && (
                <div className="mb-6 p-4 bg-navy/30 rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-beige/80 mb-2">日付</label>
                      <input
                        type="date"
                        value={exceptionDate}
                        onChange={(e) => setExceptionDate(e.target.value)}
                        className="w-full bg-navy/50 text-beige border border-beige/20 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-beige/80 mb-2">状態</label>
                      <select
                        value={exceptionIsWorking ? "working" : "off"}
                        onChange={(e) => setExceptionIsWorking(e.target.value === "working")}
                        className="w-full bg-navy/50 text-beige border border-beige/20 rounded px-3 py-2"
                      >
                        <option value="off">休み</option>
                        <option value="working">出勤</option>
                      </select>
                    </div>
                  </div>

                  {exceptionIsWorking && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-beige/80 mb-2">開始時刻</label>
                        <input
                          type="time"
                          value={exceptionStartTime}
                          onChange={(e) => setExceptionStartTime(e.target.value)}
                          className="w-full bg-navy/50 text-beige border border-beige/20 rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-beige/80 mb-2">終了時刻</label>
                        <input
                          type="time"
                          value={exceptionEndTime}
                          onChange={(e) => setExceptionEndTime(e.target.value)}
                          className="w-full bg-navy/50 text-beige border border-beige/20 rounded px-3 py-2"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-beige/80 mb-2">メモ（任意）</label>
                    <input
                      type="text"
                      value={exceptionNote}
                      onChange={(e) => setExceptionNote(e.target.value)}
                      placeholder="例: 臨時休業、早上がりなど"
                      className="w-full bg-navy/50 text-beige border border-beige/20 rounded px-3 py-2 placeholder-beige/30"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddException}
                      className="flex-1 py-2 bg-bronze text-navy rounded-lg font-bold hover:bg-beige transition"
                    >
                      追加
                    </button>
                    <button
                      onClick={() => setShowExceptionForm(false)}
                      className="flex-1 py-2 bg-navy/50 text-beige/80 border border-beige/20 rounded-lg hover:border-beige/40 transition"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}

              {exceptions.length === 0 ? (
                <p className="text-beige/40 text-center py-8">例外設定はありません</p>
              ) : (
                <div className="space-y-3">
                  {exceptions.map((exception) => (
                    <div
                      key={exception.id}
                      className="flex items-center justify-between p-4 bg-navy/30 rounded-lg"
                    >
                      <div>
                        <p className="text-beige font-bold">{exception.date}</p>
                        <p className="text-beige/80 text-sm">
                          {exception.is_working
                            ? `${exception.start_time?.slice(0, 5)} 〜 ${exception.end_time?.slice(0, 5)}`
                            : "休み"}
                        </p>
                        {exception.note && (
                          <p className="text-beige/60 text-xs mt-1">{exception.note}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteException(exception.id)}
                        className="px-4 py-2 text-red-300 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/20 transition"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
