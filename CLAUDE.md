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

- ホスティング: GitHub Pages（publicリポジトリ ※無料枠はpublic必須）
- リポジトリ名: mapcocoro/genbacho-0d2a02（顧客向けにURLを推測されにくくするためランダム接尾辞を付与）
- URL: https://mapcocoro.github.io/genbacho-0d2a02/
- 方法: main へ push すると GitHub Actions（.github/workflows/deploy.yml）が自動ビルド＆公開
- ルーターは HashRouter（Pagesのサブパス配信で404を回避するため）
- vite.config.ts の base は './'（相対パス配信）

## 開発

```bash
npm install
npm run dev
npm run build
```
