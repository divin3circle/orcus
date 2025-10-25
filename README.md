# Orcus - Decentralized Payment Platform

> Financial inclusion for Africa through Hedera blockchain

## Quick Start

### Prerequisites

- Node.js 18+
- Go 1.24+
- PostgreSQL 14+
- Hedera Testnet Account

### Installation

#### Backend

```bash
cd backend
go mod download
go run main.go
```

#### Frontend

```bash
npm install
npm run dev
```

## 📱 Features

### For Users

- Buy KES tokens with M-Pesa
- Pay at merchant shops
- Join marketing campaigns
- Track transaction history

### For Merchants

- Manage multiple shops
- Create custom campaigns
- Track income and analytics
- Withdraw to M-Pesa or wallets

## Architecture

- **Frontend**: Next.js 15 + Tailwind CSS
- **Backend**: Go + Chi Router
- **Database**: PostgreSQL
- **Blockchain**: Hedera (Hiero SDK)
- **Mobile**: React Native

## Key Components

### Token System

- KES tokens on Hedera network
- 2 decimal places (100 = 1 KES)
- Automatic token association

### Payment Flow

1. User buys tokens via M-Pesa
2. Tokens transferred to Hedera account
3. User pays merchant by shop ID
4. Transaction recorded on blockchain
5. Real-time notifications via Hedera Topics

### Campaign System

- Merchants create custom token campaigns
- Automatic token generation
- Track participants and distribution
- End campaigns and notify users

## Tech Stack

**Frontend**

- Next.js 15
- Tailwind CSS
- React Query
- Zustand
- Recharts

**Backend**

- Go 1.24
- Chi Router
- PostgreSQL
- Hedera SDK
- JWT Auth

**Mobile**

- React Native
- M-Pesa Integration
- Hedera SDK

## Security

- Bcrypt password hashing
- JWT authentication
- Encrypted private keys
- Transaction validation
- HTTPS encryption

## Transaction Fees

- 0.5% of transaction amount
- Minimum: 0 KES (for ≤ 100 KES)
- Transparent fee structure

## Impact

**Financial Inclusion**

- Low-cost transactions
- Fast settlement (3-5 seconds)
- Mobile-first approach
- M-Pesa integration
- Blockchain transparency

## Dashboard Features

- Total income tracking
- Withdrawal management
- Shop performance analytics
- Campaign management
- Transaction history

## Future Enhancements

- Multi-currency support
- Advanced loyalty programs
- Business intelligence
- API marketplace
- Cross-border payments

## License

MIT License

---
