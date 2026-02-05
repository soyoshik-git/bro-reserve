# BRO 実装状況（随時更新）

最終更新: 2026-02-05

## 📋 新機能追加前のチェック

新機能を実装する前に、必ず以下を確認:

- [ ] 01_requirement.md: MVP 範囲内か
- [ ] 02_userflow.md: 画面遷移に影響ないか
- [ ] 03_domain_model.md: データ構造と整合するか
- [ ] 04_future_ideas.md: 将来構想と矛盾しないか
- [ ] 05_current_status.md: 既存機能と干渉しないか

判断に迷ったら、実装前に Claude に相談する

---

## ✅ 完成済み機能

### お客様向け機能

#### トップページ（`/`）

- **ファイル**: `app/page.tsx`, `app/Home.tsx`
- **機能**:
  - ロゴ表示
  - 「予約する」ボタン（`/reserve`へ遷移）
  - 「予約一覧（管理）」ボタン（`/dashboard/reservations`へ遷移）
- **状態**: ✅ 完成

#### 予約トップページ（`/reserve`）

- **ファイル**: `app/reserve/page.tsx`, `app/reserve/ReserveTop.tsx`
- **機能**:
  - スタッフ選択（Koshi, Ryuki, Asuka）
  - 日付選択（横スクロール、10 日分表示）
  - コース時間選択（60/90/120/180 分）
  - 時間選択（10:00-23:00、30 分刻み）
  - 承認済み予約との重複チェック（空き枠表示）
  - 全項目選択後のみ「予約フォームへ進む」ボタン有効
- **状態**: ✅ 完成
- **注意**: スケジュール管理の情報は未反映（固定時間 10:00-23:00）

#### 予約フォーム（`/reserve/form`）

- **ファイル**: `app/reserve/form/page.tsx`, `app/reserve/form/ReserveForm.tsx`
- **機能**:
  - 予約概要表示（スタッフ・日付・時間）
  - 名前入力（必須）
  - 電話番号入力（必須）
  - メールアドレス入力（必須）
  - コース時間選択（60/90/120/180 分）
  - その他要望入力（任意）
  - 重複チェック（`check_reservation_conflict` RPC 関数使用）
  - 予約登録（status: `pending`）
- **状態**: ✅ 完成

#### 予約完了ページ（`/reserve/complete`）

- **ファイル**: `app/reserve/complete/page.tsx`, `app/reserve/complete/ReserveComplete.tsx`
- **機能**:
  - 問い合わせ完了メッセージ表示
  - 未確定である旨の案内
  - トップページへ戻るリンク
  - 続けて予約するリンク
- **状態**: ✅ 完成

### ボーイ/管理者向け機能

#### ログインページ（`/login`）

- **ファイル**: `app/login/page.tsx`
- **機能**:
  - メールアドレス・パスワード認証（Supabase Auth）
  - エラーメッセージ表示
  - ログイン成功後、`/dashboard/reservations`へ遷移
- **状態**: ✅ 完成

#### 予約一覧ページ（`/dashboard/reservations`）

- **ファイル**: `app/dashboard/reservations/page.tsx`, `app/dashboard/reservations/ReservationList.tsx`
- **機能**:
  - 認証チェック（未認証時は`/login`へリダイレクト）
  - 予約一覧表示（日付順）
  - カード UI / リスト UI 切り替え
  - 未承認のみフィルタ
  - ステータス表示（pending / approved / canceled）
  - 承認機能（重複チェック付き）
  - キャンセル機能（確認ダイアログ付き）
  - ログアウト機能
- **状態**: ✅ 完成
- **注意**: 現在は全情報（電話番号・メールアドレス含む）を表示。要件 7 の制約（ボーイは電話・メールを直接閲覧しない）は未実装。

#### スケジュール管理ページ（`/dashboard/schedule`）

- **ファイル**: `app/dashboard/schedule/page.tsx`
- **機能**:
  - 認証チェック
  - 基本スケジュール編集（曜日ごとの出勤時間設定）
  - 例外設定（特定日付の出勤/休み設定）
  - メールアドレスからスタッフ名を自動取得
- **状態**: ✅ 完成
- **注意**: 予約トップページではスケジュール情報を参照していない

### データベース/API

#### Supabase クライアント設定

- **ファイル**:
  - `utils/supabase.ts`（クライアント側）
  - `utils/supabase-server.ts`（サーバー側）
  - `utils/supabaseClient.ts`（クライアント側、重複あり）
- **機能**:
  - Supabase クライアント作成
  - 環境変数から設定読み込み
- **状態**: ✅ 完成
- **注意**: `supabase.ts`と`supabaseClient.ts`が重複している可能性あり

#### データベース関数

- **使用中の RPC 関数**:
  - `check_reservation_conflict`: 予約重複チェック
    - 使用箇所: `ReserveForm.tsx`, `ReservationList.tsx`
- **状態**: ✅ 使用中

#### データベーステーブル（推測）

- `reservations`: 予約情報
  - カラム: id, staff, date, time, name, tel, email, course, note, status
- `staff_schedules`: スタッフ基本スケジュール
  - カラム: id, staff, day_of_week, is_working, start_time, end_time
- `staff_exceptions`: スタッフ例外スケジュール
  - カラム: id, staff, date, is_working, start_time, end_time, note
- **状態**: ✅ 使用中（スキーマ定義は未確認）

---

## 🚧 実装中

- （現在作業中の機能があれば記載）

---

## ⬜ 未実装（MVP 範囲内）

01_requirement.md で定義されているが、まだ実装していない機能:

### 要件 7: ボーイ側の制約

- **内容**: ボーイはお客様の電話番号・メールアドレスを直接閲覧しない
- **現状**: `ReservationList.tsx`で全情報を表示している
- **対応**: ボーイロールと管理者ロールを区別し、ボーイには連絡先を非表示にする必要がある

### 要件 4: 通知機能

- **内容**: ステータスに応じて通知が送信される
- **現状**: 通知機能は未実装
- **対応**: MVP では手動対応想定だが、要件定義では言及されているため要確認

### 役割管理（staff / admin）

- **内容**: 03_domain_model.md で定義されているが、実装状況不明
- **現状**: ログイン機能はあるが、役割による権限制御は未確認
- **対応**: ボーイと管理者の権限を明確に分離する必要がある

---

## 🔧 既知の課題・TODO

### データベース設計

- [ ] スキーマ定義の確認・ドキュメント化
- [ ] `check_reservation_conflict` RPC 関数の実装確認

### コード整理

- [ ] `utils/supabase.ts`と`utils/supabaseClient.ts`の重複解消
- [ ] Supabase クライアントの統一（クライアント/サーバー側の使い分け明確化）

### 機能統合

- [ ] スケジュール管理ページの情報を予約トップページに反映
- [ ] 空き枠制御の高度化（スケジュール情報を考慮した予約可能時間の算出）

### UI/UX 改善

- [ ] ボーイと管理者の権限に応じた表示制御
- [ ] エラーハンドリングの統一化
- [ ] ローディング状態の改善

### セキュリティ

- [ ] RLS（Row Level Security）ポリシーの確認
- [ ] 認証トークンの適切な管理

---

## 📝 実装時の重要な判断

プロジェクト進行中に決めた、docs に明記されていない重要な判断:

### 予約重複チェックの実装

- **判断**: `check_reservation_conflict` RPC 関数を使用して重複チェックを実装
- **理由**: データベース側で重複判定ロジックを集約することで、フロントエンドと管理画面の両方で一貫したチェックが可能
- **実装箇所**: `ReserveForm.tsx`（予約作成時）、`ReservationList.tsx`（承認時）

### スケジュール管理の実装

- **判断**: 基本スケジュール（曜日ベース）と例外設定（日付ベース）を分離
- **理由**: 柔軟なスケジュール管理を可能にするため
- **注意**: 予約トップページではまだ使用されていない

### スタッフ名の管理

- **判断**: MVP では文字列で管理（`staff`カラム）
- **理由**: 03_domain_model.md の定義に従い、シンプルな実装を優先
- **将来**: スタッフテーブルへの移行を検討

### 認証方式

- **判断**: Supabase Auth を使用
- **理由**: 要件定義では「会員登録/ログインは含めない」とあるが、管理画面用に実装
- **注意**: お客様向けの会員登録は未実装（要件通り）

---

## 🗂️ 主要ファイル構成

```
app/
├── page.tsx                    # トップページ（ルーティング）
├── Home.tsx                    # トップページコンポーネント
├── layout.tsx                  # ルートレイアウト（フォント設定）
├── globals.css                 # グローバルスタイル
│
├── login/
│   └── page.tsx                # ログインページ
│
├── reserve/
│   ├── page.tsx                # 予約トップ（ルーティング）
│   ├── ReserveTop.tsx          # 予約トップコンポーネント
│   ├── form/
│   │   ├── page.tsx            # 予約フォーム（ルーティング）
│   │   └── ReserveForm.tsx     # 予約フォームコンポーネント
│   └── complete/
│       ├── page.tsx            # 予約完了（ルーティング）
│       └── ReserveComplete.tsx # 予約完了コンポーネント
│
└── dashboard/
    ├── reservations/
    │   ├── page.tsx            # 予約一覧（ルーティング）
    │   └── ReservationList.tsx # 予約一覧コンポーネント
    └── schedule/
        └── page.tsx            # スケジュール管理ページ

utils/
├── supabase.ts                 # Supabaseクライアント（クライアント側）
├── supabase-server.ts          # Supabaseクライアント（サーバー側）
└── supabaseClient.ts           # Supabaseクライアント（重複？）

docs/
├── 01_requirement.md            # 要件定義
├── 02_userflow.md               # ユーザーフロー
├── 03_domain_model.md           # ドメインモデル
├── 04_future_ideas.md           # 将来構想
└── 05_current_status.md         # 実装状況（本ファイル）
```

---

## 📌 次のステップ

1. **要件 7 の実装**: ボーイと管理者の権限分離、連絡先非表示
2. **スケジュール統合**: 予約トップページでスケジュール情報を参照
3. **コード整理**: Supabase クライアントの統一
4. **ドキュメント化**: データベーススキーマの明文化

---

## 🔄 更新履歴

- 2026-02-05: 初版作成
