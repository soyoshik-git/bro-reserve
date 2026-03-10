import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// GET: スタッフ一覧（公開エンドポイント）
// メールアドレスの @ 前部分を大文字始まりで返す
export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await admin.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // email から表示名を生成（例: koshi@... → Koshi）
  const staffNames = data.users
    .map((u) => {
      const raw = (u.email ?? "").split("@")[0];
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    })
    .filter(Boolean)
    .sort();

  return NextResponse.json({ staff: staffNames });
}
