"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReserveTop() {
  const router = useRouter();

  const staffList = ["Koshi", "Ryuki", "Asuka"];
  const [selectedStaff, setSelectedStaff] = useState(staffList[0]);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

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

  const slots = Array.from({ length: (23 - 10) * 2 }, (_, i) => {
    const hour = 10 + Math.floor(i / 2);
    return `${hour}:${i % 2 === 0 ? "00" : "30"}`;
  });

  return (
    <main className="min-h-screen bg-[#F7F7F9] p-5">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[#111827]">予約</h1>

        {/* スタッフ選択 */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            スタッフ
          </label>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="w-full bg-white text-[#111827] border border-[#E5E7EB] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D9A441]"
          >
            {staffList.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* 日付選択 */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            日付を選択
          </p>
          <div className="flex overflow-x-auto space-x-3 pb-2">
            {dates.map((date) => {
              const d = new Date(date);
              const label = `${d.getMonth() + 1}/${d.getDate()}`;
              const weekday = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
              const selected = date === selectedDate;

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap border transition
                    ${
                      selected
                        ? "bg-[#D9A441] text-black border-[#D9A441] font-semibold"
                        : "bg-white text-gray-600 border-gray-300"
                    }`}
                >
                  <div className="text-sm">{label}</div>
                  <div className="text-xs opacity-70">({weekday})</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 時間選択 */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            時間を選択
          </p>
          <div className="grid grid-cols-3 gap-3">
            {slots.map((time) => {
              const selected = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 rounded-xl text-sm border transition
                    ${
                      selected
                        ? "bg-[#D9A441] text-black border-[#D9A441] font-semibold scale-105"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        {/* 次へ */}
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
          className={`w-full py-4 rounded-2xl font-bold transition
            ${
              selectedTime
                ? "bg-[#D9A441] text-black shadow-lg"
                : "bg-gray-300 text-gray-400 cursor-not-allowed"
            }`}
        >
          {selectedTime ? "予約へ進む" : "時間を選択してください"}
        </button>
      </div>
    </main>
  );
}
