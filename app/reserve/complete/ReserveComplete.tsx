export default function ReserveCompletePage() {
  return (
    <main className="min-h-screen bg-[#F7F7F9] p-5 flex items-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white border border-[#E5E7EB] shadow-md rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-[#111827] mb-4">
            予約が完了しました
          </h1>

          <p className="text-gray-600 mb-6 leading-relaxed">
            ありがとうございます。
            <br />
            ご入力いただいた内容で仮予約を受け付けました。
            <br />
            スタッフが確認後、改めて確定のご連絡を差し上げます。
          </p>

          <a
            href="/reserve"
            className="inline-block bg-[#D9A441] text-black font-bold py-3 px-6 rounded-2xl shadow-md hover:bg-[#E5B751] transition"
          >
            予約一覧に戻る
          </a>
        </div>
      </div>
    </main>
  );
}
