# 債券交易事件實現總結

## 概述
本項目已成功實現完整的債券生命週期中的所有交易事件通知功能,包括創建、購買、贖回和提取資金。

## 已實現的功能

### 1. ✅ 創建債券 (Bond Creation)
**位置**: `src/pages/CreateProjectPage.tsx`

**流程**:
1. 用戶填寫債券信息並提交
2. 前端調用智能合約 `blue_link::create_bond_project`
3. 交易成功後,調用 `notifyBackendAboutTransaction(digest, 'bond_created')`
4. 後端收到通知後從鏈上索引新債券數據
5. 用戶導航到 Dashboard 查看創建的債券(從鏈上直接查詢)

**特點**:
- 使用鏈優先架構,用戶立即從鏈上看到自己的債券
- 異步通知後端進行市場索引
- 不依賴後端響應,避免阻塞用戶體驗

---

### 2. ✅ 購買債券 (Bond Purchase)
**位置**: `src/pages/BondMarketplacePage.tsx`

**流程**:
1. 用戶在債券市場選擇債券並點擊購買
2. 彈出 `BuyBondModal` 輸入購買金額
3. 前端創建交易:
   - 使用 `txb.splitCoins` 分割 gas coin 作為支付
   - 調用 `blue_link::buy_bond_rwa_tokens`
4. 交易簽名並執行
5. 成功後調用 `notifyBackendAboutTransaction(digest, 'bond_purchased')`
6. 刷新債券列表,關閉彈窗

**關鍵代碼**:
```typescript
const txb = new Transaction();
const [coin] = txb.splitCoins(txb.gas, [txb.pure.u64(amountInMist)]);

txb.moveCall({
  target: `${PACKAGE_ID}::blue_link::buy_bond_rwa_tokens`,
  arguments: [bondId, amount, coin, clock]
});

signAndExecute({ transaction: txb }, {
  onSuccess: async (result) => {
    await notifyBackendAboutTransaction(result.digest, 'bond_purchased');
  }
});
```

---

### 3. ✅ 贖回債券 (Bond Redemption)
**位置**: 
- `src/components/RedeemBondModal.tsx` (彈窗組件)
- `src/pages/DashboardPage.tsx` (投資者視圖)

**流程**:
1. 投資者在 Dashboard 看到持有的債券代幣
2. 到期的債券顯示 "可贖回" 標記和贖回按鈕
3. 點擊贖回按鈕彈出 `RedeemBondModal`
4. Modal 顯示:
   - 本金金額
   - 利息金額
   - 總贖回金額 (本金 + 利息)
   - 債券到期日
5. 確認後調用 `blue_link::redeem_bond_token`
6. 成功後調用 `notifyBackendAboutTransaction(digest, 'bond_redeemed')`
7. 債券代幣被銷毀,資金返回到用戶錢包

**關鍵特性**:
- 自動計算利息: `interest = principal × (annualRate / 10000)`
- 到期檢查: 只有到期的債券才能贖回
- 狀態顯示: 未到期的債券顯示 "未到期" 按鈕(禁用)
- 詳細摘要: 清晰顯示本金、利息和總金額

**關鍵代碼**:
```typescript
txb.moveCall({
  target: `${PACKAGE_ID}::blue_link::redeem_bond_token`,
  arguments: [
    txb.object(bondProjectId),
    txb.object(bondTokenId),
    txb.object('0x6') // Clock
  ]
});
```

---

### 4. ✅ 提取資金 (Funds Withdrawal)
**位置**: 
- `src/components/WithdrawFundsModal.tsx` (彈窗組件)
- `src/pages/DashboardPage.tsx` (發行人視圖)

**流程**:
1. 發行人在 Dashboard 看到已發行的債券
2. 有募集資金的債券顯示 "提取資金" 按鈕
3. 點擊按鈕彈出 `WithdrawFundsModal`
4. Modal 顯示:
   - 可用餘額 (已募集金額)
   - 提取金額輸入框(支持最大值按鈕)
   - 提取後剩餘餘額預覽
5. 確認後調用 `blue_link::withdraw_raised_funds`
6. 成功後調用 `notifyBackendAboutTransaction(digest, 'funds_withdrawn')`
7. 資金轉入發行人錢包

**關鍵特性**:
- 靈活提取: 可以部分提取或全部提取
- 餘額檢查: 防止提取超過可用金額
- 最大值按鈕: 一鍵填入全部可用餘額
- 警告提示: 提醒發行人預留償還資金

**關鍵代碼**:
```typescript
txb.moveCall({
  target: `${PACKAGE_ID}::blue_link::withdraw_raised_funds`,
  arguments: [
    txb.object(bondProjectId),
    txb.object(adminCapId),
    txb.pure.u64(amountInMist)
  ]
});
```

---

## 架構設計

### 鏈優先架構 (Chain-First Architecture)
```
用戶資產 (User Assets) → 直接從鏈上查詢
  ├─ 發行人: getUserIssuedBonds() → 查詢 BondProject 對象
  └─ 投資者: getUserBondTokens() → 查詢 BondToken NFT

市場數據 (Marketplace) → 從後端數據庫查詢
  └─ 所有債券列表,支持篩選、排序、搜索
```

### 事件通知流程
```
1. 前端執行鏈上交易
   ↓
2. 交易成功,獲得 transaction digest
   ↓
3. 異步調用 notifyBackendAboutTransaction(digest, eventType)
   ↓
4. 後端接收通知
   ↓
5. 後端從鏈上索引交易相關對象
   ↓
6. 更新數據庫(用於市場查詢)
```

### 數據同步策略
- **實時性**: 用戶看到自己的資產無延遲(直接查鏈)
- **完整性**: 市場數據通過後端索引保證完整
- **可靠性**: 15秒輪詢 + 手動刷新按鈕
- **解耦性**: 前端不依賴後端同步結果

---

## API 端點

### 後端同步端點
```
POST /api/v1/bonds/sync
Content-Type: application/json

Body:
{
  "transaction_digest": "string",
  "event_type": "bond_created" | "bond_purchased" | "bond_redeemed" | "funds_withdrawn" | "redemption_deposited"
}

Response:
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 核心函數

### src/lib/sui.ts

#### `getUserIssuedBonds(address: string)`
查詢用戶發行的所有 BondProject 對象

#### `getUserBondTokens(address: string)`
查詢用戶持有的所有 BondToken NFT

#### `notifyBackendAboutTransaction(digest: string, eventType: string)`
通知後端索引鏈上交易

#### `getOwnedObjectsByType(address: string, type: string)`
通用方法: 查詢指定地址擁有的指定類型對象

---

## 自定義 Hook

### useOnChainBonds()
**文件**: `src/hooks/useOnChainBonds.ts`

**返回值**:
```typescript
{
  issuedBonds: BondProject[],    // 用戶發行的債券
  bondTokens: BondToken[],       // 用戶持有的債券代幣
  loading: boolean,              // 加載狀態
  error: Error | null,           // 錯誤信息
  refetch: () => void           // 手動刷新
}
```

**特性**:
- 15秒自動輪詢
- 並行查詢 issuedBonds 和 bondTokens
- 錯誤處理和重試

---

## UI 組件

### 新增組件

1. **RedeemBondModal** - 贖回債券彈窗
   - 顯示本金、利息、總金額
   - 到期檢查
   - 交易執行和通知

2. **WithdrawFundsModal** - 提取資金彈窗
   - 可用餘額顯示
   - 金額輸入和驗證
   - 最大值快捷按鈕
   - 剩餘餘額預覽

### 更新組件

1. **DashboardPage**
   - InvestorDashboard: 添加贖回按鈕和 RedeemBondModal
   - IssuerDashboard: 添加提取資金按鈕和 WithdrawFundsModal
   - 到期日顯示(替換購買日期)
   - 操作列(贖回/提取按鈕)

2. **BondMarketplacePage**
   - 實現完整的購買交易流程
   - 集成 useSignAndExecuteTransaction
   - 添加後端通知

---

## 測試建議

### 完整生命週期測試
1. **創建債券**
   - 發行人創建債券
   - 檢查 Dashboard 是否立即顯示
   - 檢查後端數據庫是否被索引

2. **購買債券**
   - 投資者購買債券
   - 檢查錢包餘額變化
   - 檢查 Dashboard 是否顯示新的 BondToken
   - 檢查發行人債券的已募集金額

3. **提取資金**
   - 發行人提取募集資金
   - 檢查錢包收到資金
   - 檢查債券的可用餘額減少

4. **贖回債券**
   - 等待債券到期(或修改到期時間測試)
   - 投資者贖回債券
   - 檢查收到本金+利息
   - 檢查 BondToken 被銷毀
   - 檢查 Dashboard 不再顯示該債券

---

## 待實現功能 (可選)

### 1. 存入償還資金 (Deposit Redemption Funds)
發行人在債券到期前存入用於償還的資金

**函數**: `blue_link::deposit_redemption_funds`

**事件類型**: `'redemption_deposited'`

### 2. 批量贖回
允許投資者一次贖回多個已到期的債券

### 3. 自動贖回提醒
到期前通知投資者可以贖回

### 4. 資金充足檢查
贖回前檢查債券項目是否有足夠的償還資金

---

## 技術棧

- **前端**: React 18, TypeScript, Vite, TailwindCSS
- **區塊鏈**: Sui Network (Devnet)
- **錢包集成**: @mysten/dapp-kit
- **智能合約**: Move (blue_link 模塊)
- **後端**: Go/Gin (異步索引服務)

---

## 注意事項

1. **AdminCap 管理**: 
   - 創建債券時會生成 AdminCap
   - 需要在前端存儲 admin_cap_id
   - 提取資金時需要使用 AdminCap 進行授權

2. **金額單位轉換**:
   - 鏈上使用 MIST (1 SUI = 1,000,000,000 MIST)
   - 前端顯示使用 SUI
   - 交易時需要轉換: `amountInMist = amount * 1_000_000_000`

3. **利率表示**:
   - 鏈上存儲: 基點 (5% = 500)
   - 前端顯示: 百分比 (displayRate = chainRate / 100)

4. **時間戳格式**:
   - 鏈上: Unix timestamp (秒或毫秒)
   - 前端: JavaScript Date 對象
   - 顯示: toLocaleDateString()

5. **錯誤處理**:
   - 所有交易都有 try-catch
   - 後端通知失敗不影響用戶體驗
   - 顯示友好的錯誤消息

---

## 總結

本實現完成了完整的債券生命週期管理:
- ✅ 創建 → ✅ 購買 → ✅ 提取 → ✅ 贖回

所有關鍵交易都:
1. 執行鏈上智能合約
2. 通知後端進行索引
3. 更新前端 UI
4. 提供清晰的用戶反饋

架構優勢:
- 用戶體驗流暢(無需等待後端)
- 數據一致性強(鏈為真相來源)
- 系統解耦(前後端獨立)
- 擴展性好(易於添加新功能)
