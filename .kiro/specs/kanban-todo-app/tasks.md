# 実装計画

- [ ] 1. プロジェクト基盤とSupabase環境の構築
- [x] 1.1 Next.js 15プロジェクトの初期化とTypeScript設定
  - Next.js 15とReact 19をインストールし、App Routerを有効化
  - TypeScript 5.xの設定ファイルを作成し、厳格な型チェックを有効化
  - Tailwind CSS 4.xをインストールし、基本的なデザイントークンを設定
  - shadcn/uiを初期化し、components.jsonを設定
  - 基本的なshadcn/uiコンポーネント（Button、Dialog、Input、Textarea、Select等）をインストール
  - ESLintとPrettierの設定を追加し、コード品質を確保
  - _Requirements: 全要件に共通する基盤_

- [x] 1.2 Supabaseプロジェクトのセットアップと接続
  - Supabaseプロジェクトを作成し、PostgreSQLデータベースを初期化
  - Supabase JavaScriptクライアント(@supabase/supabase-js v2.44.0+)をインストール
  - 環境変数ファイルにSupabase URLとAnon Keyを設定
  - Supabaseクライアントユーティリティを作成し、サーバー/クライアント両方で利用可能に
  - _Requirements: 全要件に共通するバックエンド接続_

- [x] 1.3 データベーススキーマの作成とRLSポリシー設定
  - columnsテーブルとtasksテーブルをPostgreSQLに作成
  - 各テーブルにインデックスを設定（user_id、column_id、position）
  - Row Level Security (RLS)を有効化し、ユーザーごとのアクセス制御ポリシーを定義
  - updated_at自動更新トリガーを作成
  - _Requirements: 2.1-2.6, 3.1-3.6, 6.1_

- [x] 1.4 リアルタイム通知トリガーの実装
  - tasksテーブルとcolumnsテーブルにリアルタイム通知用のPostgreSQLトリガーを作成
  - realtime.send関数を使用して、INSERT/UPDATE/DELETE時にカスタムペイロードをブロードキャスト
  - チャネル名パターン（board:{user_id}:changes）を実装
  - イベントタイプ（task_created, task_updated, task_deleted等）を定義
  - _Requirements: 6.3_

- [ ] 2. 認証システムの実装
- [x] 2.1 Supabase Auth統合と認証サービスの作成
  - AuthServiceを実装し、signUp、signIn、signOut、getSession、refreshSessionメソッドを提供
  - Next.js API Routesで認証エンドポイント（/api/auth/signup、/api/auth/signin、/api/auth/signout）を作成
  - メール確認フローを実装し、確認リンククリック時の処理を追加
  - エラーハンドリングを実装し、ユーザーフレンドリーなエラーメッセージを提供
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2.2 認証ミドルウェアとセッション管理の実装
  - Next.js ミドルウェアでJWT検証を実装し、未認証ユーザーをログインページにリダイレクト
  - HTTPOnlyクッキーを使用したセッション管理を実装
  - サーバー側でのセッション取得ユーティリティを作成
  - トークンのリフレッシュ機能を実装し、セッション期限切れを自動的に延長
  - _Requirements: 1.5_

- [x] 2.3 認証UIコンポーネントの作成
  - shadcn/uiのCardコンポーネントを使用してサインアップフォームを作成
  - shadcn/uiのInput、Button、Labelコンポーネントでメールアドレスとパスワード入力を実装
  - フォームバリデーションとエラー表示をshadcn/uiのFormコンポーネントで実装
  - ログインフォームを同様にshadcn/uiコンポーネントで作成
  - AuthContextプロバイダーを実装し、アプリ全体で認証状態を共有
  - useAuthカスタムフックを作成し、コンポーネントから認証機能にアクセス可能に
  - _Requirements: 1.1, 1.3_

- [x] 2.4 ログアウト機能とルーティング保護の実装
  - ログアウトボタンを実装し、セッション終了後にログインページにリダイレクト
  - 保護されたルート（/board）へのアクセス制御を実装
  - 認証状態に応じたリダイレクトロジックを追加
  - ローディング状態の適切な表示を実装
  - _Requirements: 1.4, 1.5_

- [ ] 3. 状態管理とデータ層の構築
- [x] 3.1 Zustand Storeの基盤構築
  - Zustand 4.xをインストールし、immerミドルウェアを設定
  - useBoardStoreを作成し、columns、tasks、loading、errorの状態を定義
  - 初期状態の定義とストアの型定義を作成
  - ストアのデバッグ設定を追加
  - _Requirements: 全データ関連要件の基盤_

- [x] 3.2 BoardServiceの実装とボード・列管理アクション
  - BoardServiceを実装し、getBoard、createColumn、updateColumn、deleteColumn、reorderColumnsメソッドを提供
  - Zustand Storeに列管理アクション（fetchBoard、createColumn、updateColumn、deleteColumn）を追加
  - 楽観的更新ロジックを実装し、API呼び出し前にUI状態を即座に更新
  - API失敗時のロールバック処理を実装
  - _Requirements: 2.1, 2.3, 2.4, 2.5_

- [x] 3.3 TaskServiceの実装とタスク管理アクション
  - TaskServiceを実装し、getTasks、createTask、updateTask、deleteTask、moveTaskメソッドを提供
  - Zustand Storeにタスク管理アクション（createTask、updateTask、deleteTask、moveTask）を追加
  - position値の自動計算ロジックを実装し、列内のタスクの並び順を管理
  - タスクの列間移動時に他タスクのposition値を調整する処理を実装
  - _Requirements: 3.1, 3.2, 3.5, 3.6, 4.2, 4.3_

- [x] 3.4 RealtimeServiceの実装とリアルタイム同期
  - RealtimeServiceを実装し、subscribe、unsubscribeメソッドを提供
  - Supabaseリアルタイムチャネルの購読処理を実装（board:{user_id}:changes）
  - handleRealtimeEventアクションをZustand Storeに追加し、イベント受信時にストアを更新
  - 自セッションのイベントをスキップする処理を実装
  - コンポーネントアンマウント時のクリーンアップ処理を実装
  - _Requirements: 2.6, 6.3_

- [x] 4. カンバンボードUIの構築
- [x] 4.1 カンバンボードレイアウトとヘッダーの作成
  - カンバンボード画面（/board）のページコンポーネントを作成
  - レスポンシブレイアウトを実装し、デスクトップでは横並び、モバイルでは縦スタックを実現
  - shadcn/uiのButtonコンポーネントでヘッダーにユーザー情報とログアウトボタンを配置
  - shadcn/uiのButtonコンポーネントで「新しい列を追加」ボタンを実装し、列作成モーダルを開く処理を追加
  - _Requirements: 2.1, 7.1, 7.2, 7.3_

- [x] 4.2 ColumnListとColumnCardコンポーネントの実装
  - ColumnListコンポーネントを作成し、Zustand Storeからcolumnsを取得して表示
  - shadcn/uiのCardコンポーネントでColumnCardを作成し、列名、編集アイコン、削除アイコンを表示
  - shadcn/uiのInputコンポーネントで列名のインライン編集機能を実装し、Enterキーで保存
  - shadcn/uiのAlertDialogコンポーネントで列削除確認ダイアログを実装し、確認後にdeleteColumnアクションを呼び出し
  - _Requirements: 2.2, 2.4, 2.5_

- [x] 4.3 列作成モーダルとフォームの実装
  - shadcn/uiのDialogコンポーネントで列作成モーダルを作成
  - shadcn/uiのInput、Label、Buttonコンポーネントで列名入力フォームを実装
  - フォームバリデーションを実装し、空の列名を拒否
  - 作成ボタンクリック時にcreateColumnアクションを呼び出し
  - モーダルの開閉アニメーションを実装
  - _Requirements: 2.3_

- [x] 4.4 TaskCardコンポーネントとタスク表示の実装
  - shadcn/uiのCardコンポーネントでTaskCardを作成し、タスクのタイトル、説明、優先度、作成日時を表示
  - shadcn/uiのBadgeコンポーネントで優先度に応じた視覚的な差別化（色、ラベル）を実装
  - タスクカードのホバーエフェクトとクリックイベントを実装
  - タスクカードクリック時にタスク詳細モーダルを開く処理を追加
  - _Requirements: 3.3, 3.4_

- [x] 4.5 タスク詳細モーダルと編集機能の実装
  - shadcn/uiのDialogコンポーネントでタスク詳細モーダルを作成
  - shadcn/uiのInput、Textarea、Selectコンポーネントでタイトル、説明、優先度の編集フォームを実装
  - shadcn/uiのButtonコンポーネントで保存ボタンを実装し、updateTaskアクションを呼び出し
  - shadcn/uiのAlertDialogコンポーネントで削除確認ダイアログを実装し、deleteTaskアクションを呼び出し
  - _Requirements: 3.4, 3.5, 3.6_

- [x] 4.6 タスク作成機能の実装
  - shadcn/uiのButtonコンポーネントで各列内に「+タスクを追加」ボタンを配置
  - shadcn/uiのInput、Textarea、Selectコンポーネントでタスク作成フォームを実装
  - フォームバリデーションを実装し、タイトルの必須チェックを追加
  - 作成ボタンクリック時にcreateTaskアクションを呼び出し、新しいタスクを列に追加
  - _Requirements: 3.1, 3.2_

- [x] 5. ドラッグ&ドロップ機能の実装
- [x] 5.1 @hello-pangea/dndの統合とDragDropContextの設定
  - @hello-pangea/dndライブラリをインストール
  - KanbanBoardコンポーネントでDragDropContextをラップ
  - onDragEndハンドラーを実装し、ドロップ結果を処理
  - ドラッグ開始時の視覚的フィードバックを実装
  - _Requirements: 4.1, 4.4_

- [x] 5.2 DroppableとDraggableの実装
  - 各ColumnCardをDroppableでラップし、droppableIdを設定
  - 各TaskCardをDraggableでラップし、draggableIdとindexを設定
  - プレースホルダーの表示を実装し、ドロップ可能な領域を視覚化
  - タッチデバイス対応のジェスチャーハンドラーを追加
  - _Requirements: 4.1, 7.4_

- [x] 5.3 列間・列内でのタスク移動ロジックの実装
  - onDragEnd内で移動元と移動先の列を判定
  - 同じ列内での移動時、position値を再計算してmoveTaskアクションを呼び出し
  - 異なる列への移動時、targetColumnIdとtargetPositionを計算してmoveTaskアクションを呼び出し
  - 楽観的更新により即座にUIを反映し、API呼び出しは並行実行
  - _Requirements: 4.2, 4.3_

- [x] 5.4 ドラッグ&ドロップのエラーハンドリングと視覚フィードバック
  - API失敗時のロールバック処理を実装し、タスクを元の位置に戻す
  - エラー発生時にトースト通知を表示
  - ドラッグ中のタスクカードに半透明エフェクトを適用
  - ドロップ可能な領域をハイライト表示
  - _Requirements: 4.5, 6.2_

- [ ] 6. 検索・フィルタリング機能の実装
- [x] 6.1 SearchBarコンポーネントとテキスト検索の実装
  - shadcn/uiのInputコンポーネントでSearchBarを作成し、カンバンボードヘッダーに配置
  - 検索ボックスにテキスト入力時、タスクのタイトルと説明を対象にフィルタリング
  - デバウンス処理を実装し、入力中の過度なフィルタリングを防止
  - 検索結果が0件の場合の表示を実装
  - _Requirements: 5.1, 5.2_

- [x] 6.2 優先度フィルターと複合フィルターの実装
  - shadcn/uiのSelectコンポーネントで優先度フィルタードロップダウンを作成し、low/medium/high/allを選択可能に
  - テキスト検索と優先度フィルターの組み合わせをサポート
  - shadcn/uiのButtonコンポーネントでフィルタークリアボタンを実装し、全タスクを再表示
  - Zustand StoreにフィルターState（searchQuery、selectedPriority）を追加
  - _Requirements: 5.3, 5.4_

- [ ] 7. リアルタイム同期の統合とテスト
- [x] 7.1 useRealtimeSubscriptionカスタムフックの作成
  - useRealtimeSubscriptionフックを作成し、コンポーネントマウント時にチャネル購読を開始
  - コンポーネントアンマウント時にチャネル購読を解除
  - リアルタイムイベント受信時にhandleRealtimeEventアクションを呼び出し
  - エラー発生時の再接続ロジックを実装
  - _Requirements: 6.3_

- [x] 7.2 複数セッション間のリアルタイム同期検証
  - 2つのブラウザセッションを開き、タスク作成・編集・削除が相互に反映されることを確認
  - 列の追加・削除が相互に反映されることを確認
  - 自セッションのイベントが重複して反映されないことを確認
  - リアルタイム同期の遅延を計測し、500ms以内であることを確認
  - _Requirements: 2.6, 6.3_

- [x] 8. エラーハンドリングとユーザーフィードバックの実装
- [x] 8.1 トースト通知システムの実装
  - shadcn/uiのToastコンポーネントとSonnerライブラリを使用してトースト通知を実装
  - 成功・エラー・警告メッセージをトーストで表示
  - showToastヘルパー関数を実装し、各コンポーネントから呼び出し可能に
  - 自動消去タイマーとクローズボタンを実装
  - _Requirements: 6.2_

- [x] 8.2 エラー境界とフォールバックUIの実装
  - Reactエラー境界コンポーネントを作成し、予期しないエラーをキャッチ
  - shadcn/uiのAlertコンポーネントでフォールバックUIを実装し、「エラーが発生しました」メッセージと再試行ボタンを表示
  - エラーログをコンソールに出力し、デバッグを容易に
  - ネットワークエラー時の専用メッセージを表示
  - _Requirements: 全要件におけるエラーハンドリング_

- [x] 8.3 バリデーションとユーザー入力フィードバック
  - shadcn/uiのFormコンポーネントとreact-hook-formで全フォームにリアルタイムバリデーションを実装
  - エラーメッセージをフィールドごとに表示
  - 必須フィールドの視覚的な強調表示を実装
  - 無効な入力時に送信ボタンを無効化
  - _Requirements: 1.1, 2.3, 3.1, 3.2_

- [ ] 9. レスポンシブデザインとモバイル対応
- [x] 9.1 デスクトップレイアウトの最適化
  - 列を横並びで表示し、水平スクロールを実装
  - 列の幅を固定または可変に設定
  - タスクカードの高さを自動調整
  - マウスホバー時のインタラクションを実装
  - _Requirements: 7.1_

- [x] 9.2 モバイルレイアウトとタッチジェスチャー対応
  - 画面幅768px以下で列を縦スタック表示に切り替え
  - スワイプジェスチャーで列を切り替える機能を実装（@hello-pangea/dndが自動対応）
  - タッチデバイスでのドラッグ&ドロップを最適化（@hello-pangea/dndが自動対応）
  - タップ領域を拡大し、誤タップを防止
  - _Requirements: 7.2, 7.4_

- [x] 9.3 レスポンシブ対応の検証と調整
  - 各画面サイズ（320px、768px、1024px、1440px）での表示を検証
  - 画面サイズ変更時のレイアウト自動調整を確認
  - テキストのオーバーフローを防止（truncateとline-clamp-2を適用）
  - ボタンとフォームの適切なサイズを確保
  - _Requirements: 7.3_

- [x] 10. オンボーディングとユーザビリティの向上
- [x] 10.1 初回利用時のチュートリアル実装
  - 初回ログイン時にチュートリアルモーダルを表示
  - 主要機能（タスク作成、ドラッグ&ドロップ、列追加）の使い方を説明
  - ステップバイステップのガイドを実装
  - スキップボタンと完了ボタンを提供
  - _Requirements: 7.5_

- [x] 10.2 ツールチップとヘルプの実装
  - 各UIコンポーネントにツールチップを追加し、機能説明を表示
  - ヘルプアイコンをヘッダーに配置し、ヘルプモーダルを開く
  - キーボードショートカットのガイドを提供
  - FAQセクションを実装
  - _Requirements: 7.5_

- [ ] 11. テストの実装
- [x] 11.1 ユニットテストの作成
  - AuthService、BoardService、TaskServiceの各メソッドに対するユニットテストを作成
  - Zustand Storeのアクション（createTask、moveTask等）に対するテストを作成
  - エッジケース（空の入力、無効なID等）をカバー
  - モック関数を使用してSupabaseクライアントをモック化
  - _Requirements: 全要件のテスト計画_

- [x] 11.2 統合テストの作成
  - 認証フロー（サインアップ → 確認 → ログイン）の統合テストを作成
  - カンバンボード操作フロー（列作成 → タスク作成 → 移動）の統合テストを作成
  - API Routesの統合テストを作成し、認証チェックとRLSポリシーを検証
  - リアルタイム同期の統合テストを作成
  - _Requirements: 全要件の統合テスト計画_

- [x] 11.3 E2Eテストの作成
  - Playwrightを使用してE2Eテスト環境をセットアップ
  - ユーザー登録からタスク管理までの完全なフローをテスト
  - ドラッグ&ドロップ操作のE2Eテストを作成
  - 検索・フィルタリング機能のE2Eテストを作成
  - レスポンシブデザインの各画面サイズでのE2Eテストを作成
  - _Requirements: 全要件のE2Eテスト計画_

- [x] 12. パフォーマンス最適化とデプロイ準備
- [x] 12.1 パフォーマンス計測と最適化
  - Lighthouse スコアを計測し、Performance 90以上を目指す
  - 初回ページロード時間（FCP）を1.5秒以内に最適化
  - タスクドラッグ&ドロップのレスポンスを100ms以内に最適化
  - Code Splittingを適用し、初回ロードサイズを削減
  - _Requirements: Performance目標_

- [x] 12.2 デプロイ設定とCI/CD構築
  - Vercelにプロジェクトをデプロイし、自動デプロイを設定
  - 環境変数をVercelに設定
  - GitHub Actionsでテスト自動実行パイプラインを構築
  - プレビューデプロイを設定し、PRごとに確認可能に
  - _Requirements: デプロイとCI/CD_
