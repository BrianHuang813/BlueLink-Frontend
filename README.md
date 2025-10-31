### BlueLink-Frontend

# BlueLink - 藍色債券平台前端

基於 Sui 區塊鏈的藍色債券募資平台前端應用。

## 🌊 項目簡介

BlueLink 是一個透明的藍色債券投資平台，專注於海洋保育和藍色經濟項目。使用區塊鏈技術確保資金流向透明，讓每一筆投資都能被追蹤。

## 🚀 功能特性

### 投資者功能
- 📊 瀏覽可用的藍色債券項目
- 💰 購買債券代幣 NFT
- 📈 追蹤投資組合和收益
- 🎫 管理持有的債券代幣
- 💸 到期贖回本金和利息

### 發行者功能
- 🏦 發行藍色債券項目
- 💵 管理募集資金
- 📊 追蹤募資進度
- ⏸️ 暫停/恢復債券銷售
- 💰 提取募集資金
- 🔄 存入贖回資金

## 🛠️ 技術棧

- **框架**: React 18 + TypeScript
- **構建工具**: Vite
- **區塊鏈整合**: @mysten/dapp-kit, @mysten/sui
- **樣式**: TailwindCSS
- **路由**: React Router v6
- **HTTP 客戶端**: Axios
- **狀態管理**: React Query

## 📦 安裝

```bash
# 克隆倉庫
git clone https://github.com/BrianHuang813/BlueLink-Frontend.git
cd BlueLink-Frontend

# 安裝依賴
npm install

# 複製環境變量文件
cp .env.example .env

# 編輯 .env 文件，設置 API 地址和智能合約包 ID
```

## 🔧 配置

編輯 `.env` 文件：

```env
# API 基礎 URL（後端地址）
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Sui 網絡（devnet/testnet/mainnet）
VITE_SUI_NETWORK=devnet

# 智能合約包 ID（部署後替換）
VITE_PACKAGE_ID=0x0
```

## 🚀 開發

```bash
# 啟動開發服務器
npm run dev

# 訪問 http://localhost:5173
```

## 🏗️ 構建

```bash
# 構建生產版本
npm run build

# 預覽生產構建
npm run preview
```

## 📝 代碼檢查

```bash
# 運行 ESLint
npm run lint
```

## 📁 項目結構

```
src/
├── components/          # 可複用組件
│   ├── Header.tsx      # 頭部導航
│   └── ProjectCard.tsx # 債券卡片
├── pages/              # 頁面組件
│   ├── HomePage.tsx           # 首頁 - 債券列表
│   ├── CreateProjectPage.tsx # 發行債券
│   ├── ProjectDetailPage.tsx # 債券詳情
│   └── DashboardPage.tsx     # 用戶儀表板
├── services/           # API 服務
│   └── api.ts         # API 調用封裝
├── types/             # TypeScript 類型定義
│   └── index.ts       # 全局類型
├── App.tsx            # 應用根組件
├── main.tsx          # 應用入口點
└── index.css         # 全局樣式
```

## 🔗 相關倉庫

- **後端**: [BlueLink-Backend](https://github.com/BrianHuang813/BlueLink-Backend)
- **智能合約**: [BlueLink-Smart-Contract](https://github.com/BrianHuang813/BlueLink-Smart-Contract)

## ⚠️ 重要提醒

1. **智能合約地址**: 所有交易調用中的 `0x0` 需要替換為實際部署的智能合約包 ID
2. **後端連接**: 確保 API_BASE_URL 指向正確的後端服務地址
3. **Sui 錢包**: 需要安裝 Sui 錢包瀏覽器擴展（如 Sui Wallet）

## 🚧 待實現功能

查看 [FEATURE_GAP_ANALYSIS.md](./FEATURE_GAP_ANALYSIS.md) 了解詳細的功能缺口分析和實現指南。

### 主要缺失功能：
- ⚠️ **認證系統** - 錢包簽名登錄和會話管理
- ⚠️ **用戶配置文件** - 用戶信息管理
- ⚠️ **債券贖回** - 投資者贖回到期債券的界面
- ⚠️ **存入贖回資金** - 發行者為贖回存入資金的界面
- ⚠️ **實時數據更新** - 自動刷新區塊鏈數據
- ⚠️ **交易狀態追蹤** - 更好的交易狀態顯示

## 🤝 貢獻

歡迎提交 Pull Request 或開 Issue！

## 📄 許可證

MIT License

## 👥 團隊

BlueLink 開發團隊
