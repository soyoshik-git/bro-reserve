"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReservePage() {
  const router = useRouter();

  const staffList = ["Koshi", "Ryuki", "Asuka"];
  const [selectedStaff, setSelectedStaff] = useState(staffList[0]);

  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    const days: string[] = [];
    const today = new Date();

    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d.toISOString().slice(0, 10));
    }

    setDates(days);
    setSelectedDate(days[0]);
  }, []);

  // ダミースロット（30分刻み）
  const generateSlots = (start = 10, end = 23) => {
    const slots: string[] = [];
    for (let hour = start; hour < end; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    return slots;
  };

  const slots = generateSlots();

  return (
    <main className="min-h-screen bg-[#F7F7F9] p-5">
      <div className="max-w-md mx-auto">
        {/* タイトル */}
        <h1 className="text-3xl font-bold mb-6 text-[#111827]">予約</h1>

        {/* カード（スタッフ選択） */}
        <div className="bg-white border border-[#E5E7EB] shadow-md rounded-2xl p-4 mb-5">
          <label className="block text-sm text-gray-600 mb-2">スタッフ</label>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="w-full bg-white text-[#111827] border border-[#D1D5DB] p-3 rounded-xl"
          >
            {staffList.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* カード（日付選択） */}
        <div className="bg-white border border-[#E5E7EB] shadow-md rounded-2xl p-4 mb-5">
          <p className="text-sm text-gray-600 mb-3">日付を選択</p>

          <div className="flex overflow-x-auto space-x-3 pb-2">
            {dates.map((date) => {
              const d = new Date(date);
              const label = `${d.getMonth() + 1}/${d.getDate()}`;
              const weekday = ["日", "月", "火", "水", "木", "金", "土"][
                d.getDay()
              ];
              const selected = date === selectedDate;

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap border transition ${
                    selected
                      ? "bg-[#D9A441] text-black border-[#D9A441]"
                      : "bg-[#F3F4F6] text-[#374151] border-[#D1D5DB]"
                  }`}
                >
                  <span className="font-semibold">{label}</span>
                  <span className="ml-1 text-xs">{`(${weekday})`}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* カード（時間選択） */}
        <div className="bg-white border border-[#E5E7EB] shadow-md rounded-2xl p-4 mb-5">
          <p className="text-sm text-gray-600 mb-3">時間を選択</p>

          <div className="grid grid-cols-3 gap-3">
            {slots.map((time) => {
              const selected = selectedTime === time;

              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 rounded-xl text-sm transition border ${
                    selected
                      ? "bg-[#D9A441] text-black border-[#D9A441]"
                      : "bg-[#F3F4F6] text-[#374151] border-[#D1D5DB] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        {/* 予約ボタン */}
        <button
          onClick={() => {
            if (!selectedTime) return;

            router.push(
              `/reserve/form?staff=${encodeURIComponent(
                selectedStaff
              )}&date=${encodeURIComponent(
                selectedDate
              )}&time=${encodeURIComponent(selectedTime)}`
            );
          }}
          className={`w-full py-4 rounded-2xl font-bold shadow-lg transition ${
            selectedTime
              ? "bg-[#D9A441] text-black hover:bg-[#E5B751]"
              : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
          }`}
        >
          {selectedTime
            ? `${selectedDate} ${selectedTime} で予約へ進む`
            : "時間を選択してください"}
        </button>
      </div>
    </main>
  );
}
