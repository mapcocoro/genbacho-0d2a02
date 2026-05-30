# その場で見積もり - 現場帳

建設業・リフォーム業向けモバイルファースト見積書作成Webアプリ

## 技術スタック

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- localStorage（データ保存）
- html2canvas（画像出力）

## 主な機能

- 見積書作成（顧客情報・工事項目・値引き・備考）
- 商品マスタ（カテゴリ別管理）
- 見積書プレビュー・画像出力
- 会社情報管理

## デプロイ

- ホスティング: GitHub Pages（publicリポジトリ）
- URL: https://mapcocoro.github.io/kensetsu-estimate-app/
- 方法: main へ push すると GitHub Actions（.github/workflows/deploy.yml）が自動ビルド＆公開
- ルーターは HashRouter（Pagesのサブパス配信で404を回避するため）
- vite.config.ts の base は './'（相対パス配信）

## 開発

```bash
npm install
npm run dev
npm run build
```
