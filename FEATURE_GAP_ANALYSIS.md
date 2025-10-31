# BlueLink Frontend - Feature Gap Analysis & Implementation Guide

## Overview
This document outlines the missing features in the BlueLink-Frontend compared to the Backend and Smart Contract repositories, and provides implementation guidance.

## ✅ Completed Features

### Core Data Models
- ✅ Updated from Project/Donation model to Bond/BondToken model
- ✅ Added proper type definitions matching Backend schema
- ✅ Added support for interest rates, maturity dates, and redemption
- ✅ Added image URLs for bonds and tokens
- ✅ Added metadata URL support

### Pages & Components
- ✅ HomePage - Lists bonds with proper display
- ✅ CreateBondPage - Allows issuing bonds with all required fields
- ✅ BondDetailPage - Shows comprehensive bond information
- ✅ DashboardPage - Split into Issuer and Investor views
- ✅ BondCard component - Displays bond information attractively

### API Integration
- ✅ Updated API endpoints to match Backend routes (`/api/v1/*`)
- ✅ Added bond service methods
- ✅ Added bond token service methods
- ✅ Set up axios with credentials for session handling

### Issuer Features (Partial)
- ✅ Create bond with complete parameters
- ✅ Withdraw raised funds
- ✅ Pause/Resume sale
- 🔲 Deposit redemption funds (UI pending)

## 🔲 Missing Features

### 1. Authentication System (CRITICAL - Not Implemented)

The Backend uses a wallet signature-based authentication system with session management, but the Frontend doesn't implement this at all.

#### What's Missing:
- **Challenge/Verify Flow**: Users need to sign a message to prove wallet ownership
- **Session Management**: Sessions stored in cookies, 24-hour validity
- **Protected Routes**: Routes that require authentication
- **Login/Logout UI**: Interface for authentication

#### Backend Endpoints:
```
POST /api/v1/auth/challenge - Get nonce for signature
POST /api/v1/auth/verify - Verify signature and create session
POST /api/v1/auth/logout - Logout current session
POST /api/v1/auth/logout-all - Logout all sessions
GET /api/v1/sessions - Get all active sessions
DELETE /api/v1/sessions/:id - Revoke specific session
```

#### Implementation Needed:

**src/contexts/AuthContext.tsx** (NEW FILE):
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { authService, userService } from '../services/api';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Create context and provider
// Implement wallet signature flow
// Handle session management
```

**Login Flow**:
1. User connects wallet via ConnectButton
2. Frontend calls `/auth/challenge` with wallet address
3. Backend returns nonce and message
4. User signs message with wallet
5. Frontend sends signature to `/auth/verify`
6. Backend creates session and sets cookie
7. Frontend can now access protected routes

**src/components/ProtectedRoute.tsx** (NEW FILE):
```typescript
// Wrapper component that requires authentication
// Redirects to login if not authenticated
```

### 2. User Profile Management (Not Implemented)

Backend has full user profile system, Frontend doesn't use it.

#### Backend Endpoints:
```
GET /api/v1/profile - Get user profile
PUT /api/v1/profile - Update profile
GET /api/v1/profile/full - Get full profile details
```

#### Implementation Needed:

**src/pages/ProfilePage.tsx** (NEW FILE):
```typescript
// Display and edit user profile
// Show role (buyer/issuer/admin)
// Edit name, timezone, language
// For issuers: edit institution_name
// Show created_at, updated_at
```

### 3. Bond Token Redemption Interface (Partially Implemented)

Smart Contract has `redeem_bond_token()` function, but Frontend doesn't have a UI for it.

#### What's Missing:
- Redemption button/form in token list
- Interest calculation display
- Maturity date check
- Redemption transaction building

#### Implementation Needed in DashboardPage:

Add to InvestorDashboard component:
```typescript
// Add redemption button to each token row
// Check if token.maturity_date has passed
// Calculate redemption amount (principal + interest)
// Show estimated redemption value
// Build and execute redemption transaction
```

### 4. Deposit Redemption Funds (Not Implemented)

Smart Contract has `deposit_redemption_funds()` but Frontend doesn't have UI.

#### Implementation Needed in DashboardPage:

Add to IssuerBondCard component:
```typescript
// Add "Deposit Redemption Funds" button
// Show current redemption pool balance
// Calculate required redemption amount:
//   total = sum of (each token principal + interest)
// Input field for deposit amount
// Build and execute deposit transaction
```

### 5. Bond Token NFT Viewer (Not Implemented)

Backend can query bond tokens, but Frontend doesn't show them nicely.

#### Implementation Needed:

**src/components/BondTokenCard.tsx** (NEW FILE):
```typescript
// Display bond token as an NFT card
// Show token_image_url
// Display token_number, amount, purchase_date
// Show calculated interest earned
// Show days until maturity
// Show redemption status
// Button to view on Sui Explorer
```

### 6. Real-time Data Updates (Not Implemented)

Backend has event listener that syncs blockchain data, but Frontend uses static data.

#### Implementation Needed:
- Polling mechanism to refresh data
- WebSocket connection (if Backend supports it)
- Refresh button on dashboards
- Auto-refresh on transaction completion

### 7. Transaction Status Tracking (Not Implemented)

Frontend submits transactions but doesn't track their status properly.

#### Implementation Needed:

**src/components/TransactionStatus.tsx** (NEW FILE):
```typescript
// Modal/toast showing transaction status
// Show transaction hash
// Link to Sui Explorer
// Show pending/success/failed status
// Auto-close on success
// Retry on failure
```

### 8. Error Handling & Loading States (Incomplete)

Better UX for loading and errors needed throughout.

#### Implementation Needed:
- Loading skeletons instead of "Loading..."
- Detailed error messages
- Retry mechanisms
- Offline detection

### 9. Form Validation (Basic)

Forms need better validation before submission.

#### Implementation Needed:
- Validate dates (maturity must be in future)
- Validate amounts (positive numbers)
- Validate interest rates (reasonable range)
- Validate URLs (proper format)
- Show inline validation errors

### 10. Smart Contract Package ID Configuration (Critical)

All transaction calls use `0x0` as placeholder.

#### Implementation Needed:

**Update after contract deployment**:
1. Deploy Smart Contract to Sui network
2. Get Package ID from deployment
3. Update all `0x0` references in:
   - CreateProjectPage.tsx
   - ProjectDetailPage.tsx
   - DashboardPage.tsx

**OR use environment variable**:
```typescript
const PACKAGE_ID = process.env.VITE_PACKAGE_ID || '0x0';
```

## 📋 Recommended Implementation Order

### Phase 1: Core Authentication (Highest Priority)
1. Create AuthContext with wallet signature flow
2. Update Header with login/logout UI
3. Create ProtectedRoute wrapper
4. Add ProfilePage for user management
5. Protect dashboard and create pages

### Phase 2: Complete Bond Features
1. Add deposit redemption funds UI
2. Implement bond token redemption interface
3. Create BondTokenCard component
4. Add transaction status tracking

### Phase 3: Polish & UX
1. Improve loading states with skeletons
2. Add better error handling
3. Implement form validation
4. Add real-time data refresh
5. Improve responsive design

### Phase 4: Configuration & Deployment
1. Set up environment variables properly
2. Deploy Smart Contract and update Package ID
3. Configure Backend API URL
4. Test end-to-end flows
5. Deploy Frontend

## 🔧 Technical Considerations

### State Management
Currently using local state. Consider adding:
- React Query for server state
- Zustand/Redux for global state (if needed)

### TypeScript Strictness
- Add stricter TypeScript config
- Fix any remaining `any` types
- Add proper error types

### Testing
- Add unit tests for components
- Add integration tests for API calls
- Add E2E tests for critical flows

### Performance
- Lazy load pages with React.lazy()
- Implement virtual scrolling for long lists
- Optimize re-renders with useMemo/useCallback

## 📚 Backend API Reference

For complete API documentation, see:
- Backend: `BlueLink-Backend/README.md`
- Routes: `BlueLink-Backend/backend/internal/routes/routes.go`
- Models: `BlueLink-Backend/backend/internal/models/*.go`

## 🔗 Smart Contract Reference

For complete contract documentation, see:
- Smart Contract: `BlueLink-Smart-Contract/sources/blue_link.move`
- Functions: Check public entry functions
- Events: All events emitted by contract

## 🤝 Contributing

When implementing missing features:
1. Follow existing code patterns
2. Update this document as features are completed
3. Add TypeScript types for all new code
4. Test with actual Backend and Smart Contract
5. Update API service when adding new endpoints

## 📞 Questions?

If anything is unclear about the Backend or Smart Contract:
1. Check their README files
2. Review the source code
3. Ask the Backend/Smart Contract developers
