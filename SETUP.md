# BlueLink Frontend 環境設定指南

## 📋 快速開始

### 1. 配置後端 API 地址

編輯 `.env.development` 文件，替換後端 IP：

```bash
# 如果後端在同一台機器
VITE_API_BASE_URL=http://localhost:8080/api/v1

# 如果後端在另一台機器 (替換成實際 IP)
VITE_API_BASE_URL=http://192.168.1.100:8080/api/v1

# 如果使用 Nginx 代理
VITE_API_BASE_URL=http://your-domain.com/api/v1
```

### 2. 配置 Sui 合約地址

部署合約後，在 `.env.development` 中填入 Package ID：

```bash
VITE_SUI_PACKAGE_ID=0x你的合約package_id
```

### 3. 啟動開發服務器

```bash
npm install
npm run dev
```

訪問: http://localhost:3000

---

## 🔧 環境變量說明

| 變量名 | 說明 | 範例 |
|--------|------|------|
| `VITE_API_BASE_URL` | 後端 API 基礎 URL | `http://192.168.1.100:8080/api/v1` |
| `VITE_SUI_NETWORK` | Sui 網絡 | `testnet` / `mainnet` / `devnet` |
| `VITE_SUI_RPC_URL` | Sui RPC 節點 URL | `https://fullnode.testnet.sui.io:443` |
| `VITE_SUI_PACKAGE_ID` | 合約 Package ID | `0x123abc...` |
| `VITE_SUI_CLOCK_OBJECT_ID` | Sui Clock 對象 ID | `0x6` (固定) |
| `VITE_USE_MOCK` | 使用模擬數據 | `true` / `false` |

---

## 🌐 不同部署場景配置

### 場景 1: 本地開發 (前後端同一台機器)

```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 場景 2: 跨機器開發 (後端在另一台機器)

```bash
# 後端機器 IP: 192.168.1.100
VITE_API_BASE_URL=http://192.168.1.100:8080/api/v1
```

**重要**: 確保後端 CORS 配置允許前端 IP！

### 場景 3: 使用 Nginx 反向代理

```bash
VITE_API_BASE_URL=/api/v1
```

Nginx 配置：
```nginx
location /api/ {
    proxy_pass http://192.168.1.100:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## 🔍 如何獲取 Package ID

### 方法 1: 從部署輸出獲取

部署合約時會顯示：

```bash
sui client publish --gas-budget 100000000

# 輸出中找到:
# Published Objects:
# ┌──
# │ PackageID: 0xabcdef123456789...
# └──
```

### 方法 2: 查詢已發布的包

```bash
# 列出所有對象
sui client objects

# 或使用 Sui Explorer
# https://suiexplorer.com/?network=testnet
```

---

## ✅ 配置檢查

啟動應用後，在瀏覽器控制台會看到：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 BlueLink Configuration Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment: development
API URL: http://localhost:8080/api/v1
Sui Network: testnet
Sui RPC: https://fullnode.testnet.sui.io:443
Package ID: 0x123abc... (或 ❌ Not set)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

左下角也會顯示配置狀態卡片（僅開發環境）。

---

## 🚨 常見問題

### 1. API 請求失敗 (CORS 錯誤)

**問題**: `Access to fetch at 'http://...' has been blocked by CORS policy`

**解決**: 後端需要配置 CORS，允許前端域名：

```go
// Go 範例
router.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"http://localhost:3000", "http://192.168.1.50:3000"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Content-Type", "Authorization"},
    AllowCredentials: true,
}))
```

### 2. Package ID 未設置

**問題**: 控制台警告 `⚠️ VITE_SUI_PACKAGE_ID is not set`

**解決**: 
1. 部署合約獲取 Package ID
2. 在 `.env.development` 中填入
3. 重啟開發服務器

### 3. 後端連接失敗

**檢查步驟**:
```bash
# 1. 確認後端是否運行
curl http://192.168.1.100:8080/api/v1/health

# 2. 檢查防火牆
sudo ufw status
sudo ufw allow 8080

# 3. 確認網絡可達
ping 192.168.1.100
```

---

## 📝 部署檢查清單

- [ ] 已創建 `.env.development` 文件
- [ ] 已配置正確的 `VITE_API_BASE_URL`
- [ ] 已填入 `VITE_SUI_PACKAGE_ID` (如已部署合約)
- [ ] 後端服務正在運行
- [ ] 後端 CORS 已正確配置
- [ ] 防火牆允許必要端口 (3000, 8080)
- [ ] 已執行 `npm install`
- [ ] 開發服務器成功啟動

---

## 🚀 下一步

1. **部署合約**: 獲取 Package ID 並更新 `.env.development`
2. **啟動後端**: 確保 API 服務運行在配置的地址
3. **測試連接**: 訪問 `/bonds` 頁面檢查數據加載
4. **配置 Nginx**: (可選) 用於生產環境部署

---

需要幫助? 檢查控制台日誌和左下角的配置狀態卡片！
