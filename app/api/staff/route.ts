import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// GET: スタッフ名一覧（公開エンドポイント）
// user_metadata.staff_name を返す。未設定の場合は email 前部分で補完
export async function GET() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await admin.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const staffNames = data.users
    .map((u) => {
      const staffName = u.user_metadata?.staff_name as string | undefined;
      if (staffName?.trim()) return staffName.trim();
      // staff_name 未設定の場合はメール前部分をフォールバック
      const raw = (u.email ?? "").split("@")[0];
      return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : null;
    })
    .filter(Boolean)
    .sort() as string[];

  return NextResponse.json({ staff: staffNames });
}
