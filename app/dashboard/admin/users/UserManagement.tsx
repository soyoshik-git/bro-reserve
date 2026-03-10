"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

type User = {
  id: string;
  email: string;
  role: "admin" | "staff";
  name: string;
  staffName: string;
  isBookable: boolean;
  createdAt: string;
};

type EditForm = {
  email: string;
  role: "admin" | "staff";
  name: string;
  staffName: string;
  isBookable: boolean;
  password: string;
  passwordConfirm: string;
};

const emptyEdit = (): EditForm => ({
  email: "", role: "staff", name: "", staffName: "", isBookable: false, password: "", passwordConfirm: "",
});

const inputCls = `w-full bg-navy/50 border border-beige/20 rounded-lg px-4 py-3 text-beige
  placeholder-beige/30 focus:outline-none focus:ring-2 focus:ring-bronze text-sm`;

export default function UserManagement() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [token, setToken] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // 新規作成フォーム
  const [showForm, setShowForm] = useState(false);
  const [newForm, setNewForm] = useState({
    email: "", password: "", role: "staff" as "staff" | "admin", name: "", staffName: "", isBookable: false,
  });
  const [creating, setCreating] = useState(false);

  // 編集モーダル
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(emptyEdit());
  const [saving, setSaving] = useState(false);

  // 行メニュー
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // トースト
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  // 行メニュー外クリックで閉じる
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const isInside = Object.values(menuRefs.current).some(
        (el) => el && el.contains(e.target as Node)
      );
      if (!isInside) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 認証チェック
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      if (session.user.user_metadata?.role !== "admin") {
        router.push("/dashboard/reservations"); return;
      }
      setToken(session.access_token);
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, [router]);

  const authHeaders = (tok: string) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${tok}`,
  });

  // ユーザー一覧取得
  const loadUsers = async (tok: string) => {
    setLoading(true);
    const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${tok}` } });
    const json = await res.json();
    if (res.ok) setUsers(json.users);
    else showToast(json.error ?? "取得に失敗しました", "error");
    setLoading(false);
  };

  useEffect(() => {
    if (!isCheckingAuth && token) loadUsers(token);
  }, [isCheckingAuth, token]);

  // 新規作成
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        email: newForm.email, password: newForm.password,
        role: newForm.role, name: newForm.name, staffName: newForm.staffName,
        isBookable: newForm.isBookable,
      }),
    });
    const json = await res.json();
    setCreating(false);
    if (res.ok) {
      showToast("ユーザーを作成しました");
      setNewForm({ email: "", password: "", role: "staff", name: "", staffName: "", isBookable: false });
      setShowForm(false);
      loadUsers(token);
    } else {
      showToast(json.error ?? "作成に失敗しました", "error");
    }
  };

  // 編集モーダルを開く
  const openEdit = (u: User) => {
    setEditTarget(u);
    setEditForm({
      email: u.email, role: u.role, name: u.name,
      staffName: u.staffName, isBookable: u.isBookable, password: "", passwordConfirm: "",
    });
    setOpenMenuId(null);
  };

  // 編集保存
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    // パスワード入力されていれば検証
    if (editForm.password) {
      if (editForm.password.length < 8) {
        showToast("パスワードは8文字以上にしてください", "error"); return;
      }
      if (editForm.password !== editForm.passwordConfirm) {
        showToast("パスワードが一致しません", "error"); return;
      }
    }

    setSaving(true);

    // プロフィール（PATCH）
    const patchRes = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({
        id: editTarget.id,
        email: editForm.email,
        role: editForm.role,
        name: editForm.name,
        staffName: editForm.staffName,
        isBookable: editForm.isBookable,
      }),
    });
    if (!patchRes.ok) {
      const json = await patchRes.json();
      showToast(json.error ?? "更新に失敗しました", "error");
      setSaving(false); return;
    }

    // パスワード変更（入力があれば PUT）
    if (editForm.password) {
      const putRes = await fetch("/api/admin/users", {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify({ id: editTarget.id, password: editForm.password }),
      });
      if (!putRes.ok) {
        const json = await putRes.json();
        showToast(json.error ?? "パスワード変更に失敗しました", "error");
        setSaving(false); return;
      }
    }

    setSaving(false);
    showToast("変更を保存しました");
    setEditTarget(null);
    loadUsers(token);
  };

  // 削除
  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`「${email}」を削除しますか？この操作は取り消せません。`)) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: authHeaders(token),
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (res.ok) { showToast("ユーザーを削除しました"); loadUsers(token); }
    else showToast(json.error ?? "削除に失敗しました", "error");
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-beige/60">認証確認中...</div>
      </div>
    );
  }

  const pwMismatch = !!editForm.passwordConfirm && editForm.password !== editForm.passwordConfirm;

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* トースト */}
      {toast && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-[100] px-5 py-3
          rounded-xl shadow-2xl shadow-navy/60 text-sm font-medium whitespace-nowrap
          animate-fade-in border
          ${toast.type === "success"
            ? "bg-charcoal border-bronze/40 text-beige"
            : "bg-red-900/80 border-red-500/40 text-red-200"}`}>
          {toast.msg}
        </div>
      )}

      {/* 編集モーダル */}
      {editTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy/80 backdrop-blur-sm"
            onClick={() => setEditTarget(null)}
          />
          <form
            onSubmit={handleSave}
            className="relative z-10 w-full max-w-md bg-charcoal border border-bronze/30
              rounded-2xl shadow-2xl shadow-navy/60 overflow-y-auto max-h-[90vh]"
          >
            <div className="p-6">
              <h2 className="text-lg font-heading text-beige tracking-wide mb-5">ユーザー編集</h2>

              <div className="space-y-4">
                {/* メールアドレス */}
                <div>
                  <label className="block text-xs text-beige/60 mb-1 font-bold">メールアドレス</label>
                  <input
                    type="email" required value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    className={inputCls}
                  />
                </div>

                {/* 本名 */}
                <div>
                  <label className="block text-xs text-beige/60 mb-1 font-bold">本名</label>
                  <input
                    type="text" value={editForm.name} placeholder="山田 太郎"
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className={inputCls}
                  />
                </div>

                {/* スタッフ名（源氏名） */}
                <div>
                  <label className="block text-xs text-beige/60 mb-1 font-bold">
                    スタッフ名 <span className="text-beige/40 font-normal">（予約フォームに表示される名前）</span>
                  </label>
                  <input
                    type="text" required value={editForm.staffName} placeholder="Koshi"
                    onChange={(e) => setEditForm((f) => ({ ...f, staffName: e.target.value }))}
                    className={inputCls}
                  />
                </div>

                {/* ロール */}
                <div>
                  <label className="block text-xs text-beige/60 mb-2 font-bold">ロール</label>
                  <div className="flex gap-3">
                    {(["staff", "admin"] as const).map((r) => (
                      <button
                        key={r} type="button"
                        onClick={() => setEditForm((f) => ({ ...f, role: r }))}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all
                          ${editForm.role === r
                            ? "bg-bronze text-navy border-bronze"
                            : "bg-navy/30 text-beige/60 border-beige/20 hover:border-bronze/50"}`}
                      >
                        {r === "admin" ? "管理者" : "スタッフ"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 予約可能スタッフ */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setEditForm((f) => ({ ...f, isBookable: !f.isBookable }))}
                    className={`w-11 h-6 rounded-full transition-colors relative
                      ${editForm.isBookable ? "bg-bronze" : "bg-navy/60 border border-beige/20"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-beige shadow transition-transform
                      ${editForm.isBookable ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm text-beige/80 font-bold">予約可能スタッフ</span>
                  <span className="text-xs text-beige/40">（ONにすると予約フォームに表示）</span>
                </label>

                {/* パスワード（任意） */}
                <div className="pt-2 border-t border-beige/10">
                  <p className="text-xs text-beige/40 mb-3">パスワード変更（変更しない場合は空欄）</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-beige/60 mb-1 font-bold">新しいパスワード</label>
                      <input
                        type="password" minLength={8} value={editForm.password}
                        placeholder="8文字以上"
                        onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-beige/60 mb-1 font-bold">確認（再入力）</label>
                      <input
                        type="password" minLength={8} value={editForm.passwordConfirm}
                        placeholder="同じパスワードをもう一度"
                        onChange={(e) => setEditForm((f) => ({ ...f, passwordConfirm: e.target.value }))}
                        className={`${inputCls} ${pwMismatch ? "border-red-500/50 focus:ring-red-500/50" : ""}`}
                      />
                      {pwMismatch && (
                        <p className="text-xs text-red-400 mt-1">パスワードが一致しません</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={saving || pwMismatch}
                  className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all
                    ${saving || pwMismatch
                      ? "bg-navy/30 text-beige/30 cursor-not-allowed"
                      : "bg-beige text-navy hover:bg-bronze hover:scale-105"}`}
                >
                  {saving ? "保存中..." : "保存"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="flex-1 py-2.5 rounded-lg border-2 border-beige/20 text-beige/60
                    font-bold text-sm hover:border-beige/50 transition-all"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ページタイトル */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-heading text-beige tracking-wider">USERS</h1>
          <p className="text-beige/50 text-sm mt-1">スタッフアカウント管理</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-beige text-navy rounded-lg font-bold text-sm
            hover:bg-bronze hover:scale-105 transition-all"
        >
          + 新規作成
        </button>
      </div>

      {/* 新規作成フォーム */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 bg-charcoal/50 border border-bronze/20 rounded-xl p-6 backdrop-blur"
        >
          <h2 className="text-lg font-heading text-beige tracking-wide mb-4">新規ユーザー</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-beige/60 mb-1 font-bold">メールアドレス</label>
              <input
                type="email" required value={newForm.email}
                onChange={(e) => setNewForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="staff@example.com"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-beige/60 mb-1 font-bold">パスワード</label>
              <input
                type="password" required minLength={8} value={newForm.password}
                onChange={(e) => setNewForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="8文字以上"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-beige/60 mb-1 font-bold">本名</label>
              <input
                type="text" value={newForm.name}
                onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="山田 太郎"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-beige/60 mb-1 font-bold">
                スタッフ名 <span className="text-beige/40 font-normal">（予約フォームに表示）</span>
              </label>
              <input
                type="text" required value={newForm.staffName}
                onChange={(e) => setNewForm((f) => ({ ...f, staffName: e.target.value }))}
                placeholder="Koshi"
                className={inputCls}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs text-beige/60 mb-2 font-bold">ロール</label>
            <div className="flex gap-3">
              {(["staff", "admin"] as const).map((r) => (
                <button
                  key={r} type="button"
                  onClick={() => setNewForm((f) => ({ ...f, role: r }))}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all
                    ${newForm.role === r
                      ? "bg-bronze text-navy border-bronze"
                      : "bg-navy/30 text-beige/60 border-beige/20 hover:border-bronze/50"}`}
                >
                  {r === "admin" ? "管理者" : "スタッフ"}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 mb-4 cursor-pointer select-none">
            <div
              onClick={() => setNewForm((f) => ({ ...f, isBookable: !f.isBookable }))}
              className={`w-11 h-6 rounded-full transition-colors relative
                ${newForm.isBookable ? "bg-bronze" : "bg-navy/60 border border-beige/20"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-beige shadow transition-transform
                ${newForm.isBookable ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm text-beige/80 font-bold">予約可能スタッフ</span>
            <span className="text-xs text-beige/40">（ONにすると予約フォームに表示）</span>
          </label>
          <div className="flex gap-3">
            <button
              type="submit" disabled={creating}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all
                ${creating
                  ? "bg-navy/30 text-beige/30 cursor-not-allowed"
                  : "bg-beige text-navy hover:bg-bronze hover:scale-105"}`}
            >
              {creating ? "作成中..." : "作成"}
            </button>
            <button
              type="button" onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-lg border-2 border-beige/20 text-beige/60
                font-bold text-sm hover:border-beige/50 transition-all"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}

      {/* ユーザー一覧 */}
      {loading ? (
        <div className="text-center text-beige/60 py-20">読み込み中...</div>
      ) : (
        <div className="bg-charcoal/50 rounded-xl border border-bronze/20 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy/50 text-beige/80 font-bold border-b border-bronze/20">
              <tr>
                <th className="py-4 px-4 text-left">スタッフ名</th>
                <th className="py-4 px-4 text-left hidden sm:table-cell">メール</th>
                <th className="py-4 px-4 text-left">ロール</th>
                <th className="py-4 px-3 text-right w-12"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-bronze/10 hover:bg-navy/30 transition text-beige/80"
                >
                  <td className="py-4 px-4">
                    <p className="font-bold text-beige">{u.staffName || <span className="text-beige/30">未設定</span>}</p>
                    {u.name && <p className="text-xs text-beige/40 mt-0.5">{u.name}</p>}
                  </td>
                  <td className="py-4 px-4 text-xs text-beige/60 hidden sm:table-cell">{u.email}</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-block text-xs font-bold px-2 py-1 rounded-md w-fit
                        ${u.role === "admin"
                          ? "bg-bronze/20 text-bronze"
                          : "bg-navy/50 text-beige/60"}`}>
                        {u.role === "admin" ? "管理者" : "スタッフ"}
                      </span>
                      {u.isBookable && (
                        <span className="inline-block text-xs px-2 py-0.5 rounded-md w-fit
                          bg-green-500/15 text-green-400">
                          予約可
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-3 text-right">
                    {/* 三点メニュー */}
                    <div
                      className="relative inline-block"
                      ref={(el) => { menuRefs.current[u.id] = el; }}
                    >
                      <button
                        onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg
                          text-beige/40 hover:text-beige hover:bg-navy/50 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>

                      {openMenuId === u.id && (
                        /* right-0 だとモバイルで切れるので、テーブル右端に固定 */
                        <div className="absolute right-0 bottom-full mb-1 w-28 bg-charcoal border border-bronze/20
                          rounded-xl shadow-2xl shadow-navy/60 overflow-hidden z-50">
                          <button
                            onClick={() => openEdit(u)}
                            className="w-full text-left px-4 py-3 text-sm text-beige/80
                              hover:bg-navy/50 transition-colors"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => { setOpenMenuId(null); handleDelete(u.id, u.email); }}
                            className="w-full text-left px-4 py-3 text-sm text-red-400
                              hover:bg-red-500/10 transition-colors"
                          >
                            削除
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-beige/40">ユーザーがいません</div>
          )}
        </div>
      )}
    </div>
  );
}
