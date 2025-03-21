# 自我介紹產生器 (Self-Introduction Generator)

一個幫助用戶生成專業自我介紹的Web應用，支持多種大型語言模型 (LLM)，包括 OpenAI GPT 和 Google Gemini。

## 線上演示

訪問我們的 GitHub Pages 部署版本：[Self-Introduction Generator](https://moai-tw.github.io/p2b-selfintro/)

## 功能特色

- 完整的個人資料輸入表單，包括教育背景、工作經驗、技能等
- 行業和職位設定，為特定目標職位定制自我介紹
- 生成設定可調整語言、風格、結構等參數
- 支持多種 LLM 模型選擇:
  - OpenAI 模型:
    - GPT-4o (最新最強大模型)
    - GPT-4o Mini (經濟實惠的高效能選擇)
    - GPT-4 Turbo
    - GPT-3.5 Turbo
  - Google 模型:
    - Gemini 2.0 Flash (最新旗艦模型)
    - Gemini 2.0 Flash-Lite (經濟實惠選擇)
    - Gemini 1.5 Pro (大容量上下文模型)
    - Gemini 1.5 Flash (平衡經濟與效能)
    - Gemma 3 (開源高性能模型)
- 預估 API 呼叫成本，顯示各模型的定價資訊
- 支持保存、編輯和管理多個自我介紹專案
- 支持複製、下載生成的文本

## 環境設定

### API Key 配置

此應用需要有效的 API Key 才能生成自我介紹。API Key 通過環境變數配置，確保安全性。

#### 開發環境設定

1. 在專案根目錄創建一個名為`.env.local`的文件
2. 添加以下內容，將 API Key 替換為你自己的:

```
# OpenAI API Key
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Google Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

3. 此文件已在`.gitignore`中設定忽略，確保你的 API Key 不會被提交到版本控制系統

#### 生產環境設定

在部署生產環境時，根據您的托管服務提供商設定環境變數：

- Vercel: 在專案設定中的環境變數部分添加 API Key 變數
- Netlify: 在站點設定中的環境變數部分添加 API Key 變數
- Docker: 在docker-compose文件或運行容器時設定環境變數
- 其他服務: 請參考相應服務的環境變數設定說明

### 如何獲取 API Keys

#### OpenAI API Key
1. 前往[OpenAI API Keys頁面](https://platform.openai.com/api-keys)
2. 登入您的OpenAI帳戶（如果您還沒有帳戶，請先註冊）
3. 點擊「Create new secret key」按鈕
4. 為您的API Key命名，然後創建
5. 複製生成的API Key（請注意，這是您唯一能看到完整密鑰的機會）

#### Google Gemini API Key
1. 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登入您的 Google 帳戶（如果您還沒有帳戶，請先註冊）
3. 點擊「Create API key」按鈕
4. 複製生成的 API Key

## 模型定價資訊

### OpenAI 模型定價
- GPT-4o: $10.00 / 1M 輸入標記，$30.00 / 1M 輸出標記
- GPT-4o Mini: $2.50 / 1M 輸入標記，$7.50 / 1M 輸出標記
- GPT-4 Turbo: $15.00 / 1M 輸入標記，$30.00 / 1M 輸出標記
- GPT-3.5 Turbo: $0.50 / 1M 輸入標記，$1.50 / 1M 輸出標記

### Google Gemini 模型定價
- Gemini 2.0 Flash: $0.10 / 1M 輸入標記，$0.35 / 1M 輸出標記
- Gemini 2.0 Flash-Lite: $0.075 / 1M 輸入標記，$0.025 / 1M 輸出標記
- Gemini 1.5 Pro (少於 128k 標記): $1.25 / 1M 標記
- Gemini 1.5 Pro (超過 128k 標記): $5.00 / 1M 標記
- Gemini 1.5 Flash: $0.0375 / 1M 標記

詳細和最新的定價資訊，請參考 [OpenAI 定價](https://openai.com/pricing) 和 [Google AI (Gemini) 定價](https://ai.google.dev/gemini-api/docs/pricing?hl=zh-tw)。

## 開發

### 安裝依賴

```bash
npm install
```

### 啟動開發服務器

```bash
npm run dev
```

### 構建生產版本

```bash
npm run build
```

## 部署

### GitHub Pages 部署

此專案已配置為使用 GitHub Actions 自動部署到 GitHub Pages。任何推送到 `main` 或 `master` 分支的更改都會觸發部署流程。

1. 確保您的專案已經設置正確的基本路徑（在 `vite.config.ts` 中的 `base` 選項）
2. 推送您的更改到主分支
3. GitHub Action 將自動構建和部署您的應用
4. 部署完成後，您可以在 `https://[你的 GitHub 用戶名].github.io/p2b-selfintro/` 訪問您的應用

您還可以手動觸發部署：
1. 前往您的 GitHub 倉庫
2. 點擊 "Actions" 標籤
3. 在左側菜單中選擇 "Deploy to GitHub Pages" 工作流
4. 點擊 "Run workflow" 按鈕

## 技術棧

- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router
- OpenAI API
- Google Gemini API
- Font Awesome 圖標

## 特別鳴謝

- OpenAI 提供的 GPT 模型 API
- Google 提供的 Gemini 和 Gemma 模型 API

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
