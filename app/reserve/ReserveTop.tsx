"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Link from "next/link";

type ApprovedReservation = {
  time: string;
  course: number;
};

type StaffSchedule = {
  day_of_week: number;
  is_working: boolean;
  start_time: string | null;
  end_time: string | null;
};

type StaffException = {
  date: string;
  is_working: boolean;
  start_time: string | null;
  end_time: string | null;
};

// 勤務時間情報 (null = 休み)
type WorkHours = {
  start: string;
  end: string;
} | null;

export default function ReserveTop() {
  const router = useRouter();

  const staffList = ["Koshi", "Ryuki", "Asuka"];
  const [selectedStaff, setSelectedStaff] = useState(staffList[0]);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(60);
  const [approvedReservations, setApprovedReservations] = useState<ApprovedReservation[]>([]);
  const [workHours, setWorkHours] = useState<WorkHours>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    const today = new Date();
    const days = Array.from({ length: 10 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
    setDates(days);
    setSelectedDate(days[0]);
  }, []);

  useEffect(() => {
    if (selectedStaff && selectedDate) {
      loadSlotData();
    }
  }, [selectedStaff, selectedDate]);

  const loadSlotData = async () => {
    setIsLoadingSlots(true);
    setSelectedTime("");

    const dayOfWeek = new Date(selectedDate).getDay();

    const [reservationsResult, scheduleResult, exceptionResult] = await Promise.all([
      supabase
        .from("reservations")
        .select("time, course")
        .eq("staff", selectedStaff)
        .eq("date", selectedDate)
        .eq("status", "approved"),
      supabase
        .from("staff_schedules")
        .select("day_of_week, is_working, start_time, end_time")
        .eq("staff", selectedStaff)
        .eq("day_of_week", dayOfWeek)
        .single(),
      supabase
        .from("staff_exceptions")
        .select("date, is_working, start_time, end_time")
        .eq("staff", selectedStaff)
        .eq("date", selectedDate)
        .maybeSingle(),
    ]);

    setApprovedReservations((reservationsResult.data as ApprovedReservation[]) || []);

    // 例外設定があればそちらを優先、なければ基本スケジュールを使用
    const exception = exceptionResult.data as StaffException | null;
    const schedule = scheduleResult.data as StaffSchedule | null;

    if (exception) {
      setWorkHours(
        exception.is_working && exception.start_time && exception.end_time
          ? { start: exception.start_time.slice(0, 5), end: exception.end_time.slice(0, 5) }
          : null
      );
    } else if (schedule) {
      setWorkHours(
        schedule.is_working && schedule.start_time && schedule.end_time
          ? { start: schedule.start_time.slice(0, 5), end: schedule.end_time.slice(0, 5) }
          : null
      );
    } else {
      setWorkHours(null);
    }

    setIsLoadingSlots(false);
  };

  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").slice(0, 2).map(Number);
    return hours * 60 + minutes;
  };

  const isTimeConflict = (slotTime: string): boolean => {
    const slotStart = parseTime(slotTime);
    const slotEnd = slotStart + selectedCourse;

    return approvedReservations.some((reservation) => {
      const resStart = parseTime(reservation.time);
      const resEnd = resStart + Number(reservation.course);
      return slotStart < resEnd && slotEnd > resStart;
    });
  };

  // 勤務時間内の全スロット（空き・予約済み両方）を生成
  const allWorkingSlots = (() => {
    if (!workHours) return [];

    const workStart = parseTime(workHours.start);
    const workEnd = parseTime(workHours.end);

    const slots: { time: string; available: boolean }[] = [];
    for (let t = workStart; t + selectedCourse <= workEnd; t += 30) {
      const hour = Math.floor(t / 60);
      const min = t % 60;
      const time = `${hour}:${min === 0 ? "00" : "30"}`;
      slots.push({ time, available: !isTimeConflict(time) });
    }
    return slots;
  })();

  return (
    <main className="min-h-screen bg-navy relative">
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-charcoal to-navy opacity-90" />

      <div className="relative z-10 max-w-2xl mx-auto p-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-heading text-beige tracking-wider">RESERVE</h1>
          <Link
            href="/"
            className="text-beige/60 hover:text-beige transition text-sm"
          >
            ← 戻る
          </Link>
        </div>

        <div className="space-y-6">
          <div className="bg-charcoal/50 border border-bronze/20 rounded-xl p-6 backdrop-blur">
            <label className="block text-sm font-bold text-beige/80 mb-3 tracking-wide">
              STAFF
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => {
                setSelectedStaff(e.target.value);
                setSelectedTime("");
              }}
              className="w-full bg-navy/50 text-beige border border-beige/20 p-4 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-bronze transition"
            >
              {staffList.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="bg-charcoal/50 border border-bronze/20 rounded-xl p-6 backdrop-blur">
            <p className="text-sm font-bold text-beige/80 mb-4 tracking-wide">
              DATE
            </p>
            <div className="flex overflow-x-auto space-x-3 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {dates.map((date) => {
                const d = new Date(date);
                const label = `${d.getMonth() + 1}/${d.getDate()}`;
                const weekday = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
                const selected = date === selectedDate;

                return (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedTime("");
                    }}
                    className={`px-5 py-3 rounded-lg whitespace-nowrap border-2 transition-all
                      ${
                        selected
                          ? "bg-bronze text-navy border-bronze font-bold scale-105 shadow-lg shadow-bronze/30"
                          : "bg-navy/50 text-beige/60 border-beige/20 hover:border-bronze/50 hover:text-beige"
                      }`}
                  >
                    <div className="text-base font-bold">{label}</div>
                    <div className="text-xs opacity-70">({weekday})</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-charcoal/50 border border-bronze/20 rounded-xl p-6 backdrop-blur">
            <label className="block text-sm font-bold text-beige/80 mb-3 tracking-wide">
              COURSE
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(Number(e.target.value));
                setSelectedTime("");
              }}
              className="w-full bg-navy/50 text-beige border border-beige/20 p-4 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-bronze transition"
            >
              <option value={60}>60分</option>
              <option value={90}>90分</option>
              <option value={120}>120分</option>
              <option value={180}>180分</option>
            </select>
          </div>

          <div className="bg-charcoal/50 border border-bronze/20 rounded-xl p-6 backdrop-blur">
            <p className="text-sm font-bold text-beige/80 mb-4 tracking-wide">
              TIME
            </p>

            {isLoadingSlots ? (
              <div className="text-center text-beige/60 py-8">
                <p className="text-sm">空き状況を確認中...</p>
              </div>
            ) : workHours === null ? (
              <div className="text-center text-beige/60 py-8">
                <p className="text-sm">この日はお休みです</p>
                <p className="text-xs mt-2">別の日付をお選びください</p>
              </div>
            ) : allWorkingSlots.length === 0 || allWorkingSlots.every((s) => !s.available) ? (
              <div className="text-center text-beige/60 py-8">
                <p className="text-sm">この日は予約が埋まっています</p>
                <p className="text-xs mt-2">別の日付をお選びください</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-beige/40 mb-3">
                  勤務時間: {workHours.start} 〜 {workHours.end}
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {allWorkingSlots.map(({ time, available }) => {
                    const selected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        disabled={!available}
                        onClick={() => available && setSelectedTime(time)}
                        className={`py-3 rounded-lg text-sm border-2 transition-all font-medium
                          ${
                            selected
                              ? "bg-bronze text-navy border-bronze font-bold scale-105 shadow-lg shadow-bronze/30"
                              : available
                              ? "bg-navy/50 text-beige/60 border-beige/20 hover:border-bronze/50 hover:text-beige"
                              : "bg-navy/20 text-beige/20 border-beige/10 cursor-not-allowed line-through"
                          }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <button
            disabled={!selectedTime}
            onClick={() =>
              router.push(
                `/reserve/form?staff=${encodeURIComponent(
                  selectedStaff
                )}&date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(
                  selectedTime
                )}`
              )
            }
            className={`w-full py-5 rounded-xl font-bold text-lg transition-all
              ${
                selectedTime
                  ? "bg-beige text-navy shadow-2xl hover:bg-bronze hover:scale-105 border-2 border-bronze/20"
                  : "bg-navy/30 text-beige/30 border-2 border-beige/10 cursor-not-allowed"
              }`}
          >
            {selectedTime ? "予約フォームへ進む →" : "時間を選択してください"}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </main>
  );
}
