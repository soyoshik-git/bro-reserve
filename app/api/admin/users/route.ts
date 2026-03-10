import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error } = await anonClient.auth.getUser(token);
  if (error || !user) return false;
  return user.user_metadata?.role === "admin";
}

// GET: ユーザー一覧
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const admin = getAdminClient();
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const users = data.users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    role: u.user_metadata?.role ?? "staff",
    name: u.user_metadata?.name ?? "",
    staffName: u.user_metadata?.staff_name ?? "",
    isBookable: u.user_metadata?.is_bookable ?? false,
    createdAt: u.created_at,
  }));

  return NextResponse.json({ users });
}

// POST: ユーザー作成（email, password, role, name, staff_name）
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { email, password, role, name, staffName, isBookable } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "email と password は必須です" }, { status: 400 });
  }
  const admin = getAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      role: role ?? "staff",
      name: name ?? "",
      staff_name: staffName ?? "",
      is_bookable: isBookable ?? false,
    },
    email_confirm: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ user: { id: data.user.id } });
}

// PATCH: プロフィール編集（role, name, staff_name, email）
export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id, role, name, staffName, email, isBookable } = await req.json();
  if (!id) return NextResponse.json({ error: "id は必須です" }, { status: 400 });

  const admin = getAdminClient();

  // まず現在の user_metadata を取得してマージ
  const { data: userData, error: getError } = await admin.auth.admin.getUserById(id);
  if (getError) return NextResponse.json({ error: getError.message }, { status: 400 });

  const currentMeta = userData.user.user_metadata ?? {};
  const updatePayload: Record<string, unknown> = {
    user_metadata: {
      ...currentMeta,
      ...(role !== undefined && { role }),
      ...(name !== undefined && { name }),
      ...(staffName !== undefined && { staff_name: staffName }),
      ...(isBookable !== undefined && { is_bookable: isBookable }),
    },
  };
  if (email !== undefined) updatePayload.email = email;

  const { error } = await admin.auth.admin.updateUserById(id, updatePayload);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// PUT: パスワード変更
export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id, password } = await req.json();
  if (!id || !password) {
    return NextResponse.json({ error: "id と password は必須です" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "パスワードは8文字以上にしてください" }, { status: 400 });
  }
  const admin = getAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, { password });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// DELETE: ユーザー削除
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id は必須です" }, { status: 400 });
  const admin = getAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
