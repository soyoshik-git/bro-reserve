"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

type User = {
  id: string;
  email: string;
  role: "admin" | "staff";
  createdAt: string;
};

export default function UserManagement() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [token, setToken] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // 新規作成フォーム
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"staff" | "admin">("staff");
  const [creating, setCreating] = useState(false);

  // パスワード変更モーダル
  const [pwModal, setPwModal] = useState<{ id: string; email: string } | null>(null);
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  // トースト
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

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

  // ユーザー一覧取得
  const loadUsers = async (tok: string) => {
    setLoading(true);
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${tok}` },
    });
    const json = await res.json();
    if (res.ok) setUsers(json.users);
    else showToast(json.error ?? "取得に失敗しました", "error");
    setLoading(false);
  };

  useEffect(() => {
    if (!isCheckingAuth && token) loadUsers(token);
  }, [isCheckingAuth, token]);

  // ユーザー作成
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole }),
    });
    const json = await res.json();
    setCreating(false);
    if (res.ok) {
      showToast("ユーザーを作成しました");
      setNewEmail(""); setNewPassword(""); setNewRole("staff"); setShowForm(false);
      loadUsers(token);
    } else {
      showToast(json.error ?? "作成に失敗しました", "error");
    }
  };

  // ロール変更
  const handleRoleChange = async (id: string, role: "staff" | "admin") => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, role }),
    });
    const json = await res.json();
    if (res.ok) {
      showToast("ロールを変更しました");
      loadUsers(token);
    } else {
      showToast(json.error ?? "変更に失敗しました", "error");
    }
  };

  // パスワード変更
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwModal) return;
    if (newPw !== newPwConfirm) {
      showToast("パスワードが一致しません", "error");
      return;
    }
    setChangingPw(true);
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: pwModal.id, password: newPw }),
    });
    const json = await res.json();
    setChangingPw(false);
    if (res.ok) {
      showToast("パスワードを変更しました");
      setPwModal(null);
      setNewPw("");
      setNewPwConfirm("");
    } else {
      showToast(json.error ?? "変更に失敗しました", "error");
    }
  };

  // ユーザー削除
  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`「${email}」を削除しますか？この操作は取り消せません。`)) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (res.ok) {
      showToast("ユーザーを削除しました");
      loadUsers(token);
    } else {
      showToast(json.error ?? "削除に失敗しました", "error");
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-beige/60">認証確認中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* トースト */}
      {toast && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-[100] px-5 py-3
          rounded-xl shadow-2xl shadow-navy/60 text-sm font-medium whitespace-nowrap
          animate-fade-in border
          ${toast.type === "success"
            ? "bg-charcoal border-bronze/40 text-beige"
            : "bg-red-900/80 border-red-500/40 text-red-200"
          }`}>
          {toast.msg}
        </div>
      )}

      {/* パスワード変更モーダル */}
      {pwModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* オーバーレイ */}
          <div
            className="absolute inset-0 bg-navy/80 backdrop-blur-sm"
            onClick={() => { setPwModal(null); setNewPw(""); setNewPwConfirm(""); }}
          />
          {/* モーダル本体 */}
          <form
            onSubmit={handlePasswordChange}
            className="relative z-10 w-full max-w-sm bg-charcoal border border-bronze/30
              rounded-2xl p-6 shadow-2xl shadow-navy/60"
          >
            <h2 className="text-lg font-heading text-beige tracking-wide mb-1">
              パスワード変更
            </h2>
            <p className="text-xs text-beige/50 mb-5">{pwModal.email}</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-beige/60 mb-1 font-bold">新しいパスワード</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="8文字以上"
                  className="w-full bg-navy/50 border border-beige/20 rounded-lg px-4 py-3 text-beige
                    placeholder-beige/30 focus:outline-none focus:ring-2 focus:ring-bronze text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-beige/60 mb-1 font-bold">確認（再入力）</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPwConfirm}
                  onChange={(e) => setNewPwConfirm(e.target.value)}
                  placeholder="同じパスワードをもう一度"
                  className={`w-full bg-navy/50 border rounded-lg px-4 py-3 text-beige
                    placeholder-beige/30 focus:outline-none focus:ring-2 text-sm
                    ${newPwConfirm && newPw !== newPwConfirm
                      ? "border-red-500/50 focus:ring-red-500/50"
                      : "border-beige/20 focus:ring-bronze"
                    }`}
                />
                {newPwConfirm && newPw !== newPwConfirm && (
                  <p className="text-xs text-red-400 mt-1">パスワードが一致しません</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={changingPw || !newPw || newPw !== newPwConfirm}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all
                  ${changingPw || !newPw || newPw !== newPwConfirm
                    ? "bg-navy/30 text-beige/30 cursor-not-allowed"
                    : "bg-beige text-navy hover:bg-bronze hover:scale-105"
                  }`}
              >
                {changingPw ? "変更中..." : "変更する"}
              </button>
              <button
                type="button"
                onClick={() => { setPwModal(null); setNewPw(""); setNewPwConfirm(""); }}
                className="flex-1 py-2.5 rounded-lg border-2 border-beige/20 text-beige/60
                  font-bold text-sm hover:border-beige/50 transition-all"
              >
                キャンセル
              </button>
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
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="staff@example.com"
                className="w-full bg-navy/50 border border-beige/20 rounded-lg px-4 py-3 text-beige
                  placeholder-beige/30 focus:outline-none focus:ring-2 focus:ring-bronze text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-beige/60 mb-1 font-bold">パスワード</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8文字以上"
                className="w-full bg-navy/50 border border-beige/20 rounded-lg px-4 py-3 text-beige
                  placeholder-beige/30 focus:outline-none focus:ring-2 focus:ring-bronze text-sm"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs text-beige/60 mb-2 font-bold">ロール</label>
            <div className="flex gap-3">
              {(["staff", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setNewRole(r)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all
                    ${newRole === r
                      ? "bg-bronze text-navy border-bronze"
                      : "bg-navy/30 text-beige/60 border-beige/20 hover:border-bronze/50"
                    }`}
                >
                  {r === "admin" ? "管理者" : "スタッフ"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all
                ${creating
                  ? "bg-navy/30 text-beige/30 cursor-not-allowed"
                  : "bg-beige text-navy hover:bg-bronze hover:scale-105"
                }`}
            >
              {creating ? "作成中..." : "作成"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
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
        <div className="text-center text-beige/60 py-20">
          <p>読み込み中...</p>
        </div>
      ) : (
        <div className="bg-charcoal/50 rounded-xl border border-bronze/20 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy/50 text-beige/80 font-bold border-b border-bronze/20">
              <tr>
                <th className="py-4 px-4 text-left">メールアドレス</th>
                <th className="py-4 px-4 text-left">ロール</th>
                <th className="py-4 px-4 text-left hidden sm:table-cell">作成日</th>
                <th className="py-4 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-bronze/10 hover:bg-navy/30 transition text-beige/80"
                >
                  <td className="py-4 px-4 font-medium">{u.email}</td>
                  <td className="py-4 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as "staff" | "admin")}
                      className="bg-navy/50 border border-beige/20 rounded-lg px-3 py-1.5
                        text-xs font-bold text-beige focus:outline-none focus:ring-2 focus:ring-bronze
                        cursor-pointer"
                    >
                      <option value="staff">スタッフ</option>
                      <option value="admin">管理者</option>
                    </select>
                  </td>
                  <td className="py-4 px-4 text-xs text-beige/50 hidden sm:table-cell">
                    {new Date(u.createdAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => { setPwModal({ id: u.id, email: u.email }); setNewPw(""); setNewPwConfirm(""); }}
                      className="text-beige/50 hover:text-beige transition font-bold text-xs mr-4"
                    >
                      PW変更
                    </button>
                    <button
                      onClick={() => handleDelete(u.id, u.email ?? "")}
                      className="text-red-400/60 hover:text-red-300 transition font-bold text-xs"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-beige/40">
              ユーザーがいません
            </div>
          )}
        </div>
      )}
    </div>
  );
}
