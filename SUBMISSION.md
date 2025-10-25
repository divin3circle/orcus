# Orcus - Decentralized Payment Platform for Financial Inclusion in Africa

## Track

**Onchain Finance & Real-World Assets (RWA)**

### Sub-track: Financial Inclusion

Bridge gaps across Africa using Hedera's fast, secure, low-cost infrastructure.

---

## 📋 Project Overview

**Orcus** is a comprehensive decentralized payment platform designed to promote financial inclusion across Africa. The platform enables seamless digital payments using Hedera's blockchain infrastructure, allowing users to purchase KES (Kenyan Shilling) tokens via M-Pesa and use them for payments at merchant locations. Merchants can manage multiple shops, create marketing campaigns, track transactions, and withdraw funds through a powerful web dashboard.

### Problem Statement

- Limited access to digital payment solutions in underbanked regions
- High transaction fees for traditional payment methods
- Lack of transparency in merchant-customer transactions
- Difficulty for small businesses to access digital payment infrastructure
- Limited financial tools for merchants to manage multiple locations

### Solution

Orcus provides a complete ecosystem combining:

- **Mobile App**: Users can buy KES tokens and use them to pay at merchant shops
- **Merchant Dashboard**: Web-based platform for managing shops, campaigns, transactions, and withdrawals
- **Hedera Integration**: Fast, secure, and low-cost blockchain infrastructure
- **Campaign System**: Merchants can create custom token campaigns for customer engagement

### Hedera Integration

- **Hedera SDK**: Using Hiero SDK for all blockchain operations
- **Token Operations**: Create, transfer, and manage tokens
- **Account Management**: Automatic account creation and key management
- **Topic Messages**: Real-time notifications via Hedera Topics
- **Transaction Fees**: Minimal fees leveraging Hedera's infrastructure

### Links

- **GitHub**: [Repository URL](https://github.com/divin3circle/orcus)
- **Demo Website**: [Website URL](https://orcus-mu.vercel.app/)
- **Demo android app**: [Android App URL](https://expo.dev/accounts/sylus.abel/projects/orcus-app/builds/530e3726-3788-4c69-a194-fc81da724b6d)
- **Deployed KES token**: [KES Token URL](https://hashscan.io/testnet/token/0.0.6883537)
- **Video Demo**: [Video URL](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

### Test accounts

- **Merchant**:
  - Username: `Mzito Technologies`
  - Password: `sam@2002`
- **User**:
  - Username: `test1`
  - Password: `sam@2002`

---

## Key Features

### For Users (Mobile App)

- **Token Purchase**: Buy KES tokens directly with M-Pesa(local mobile money provider)
- **Shop Payments**: Scan shop IDs and make instant payments
- **Campaign Participation**: Join merchant campaigns to earn rewards
- **Transaction History**: Track all payments and purchases
- **Real-time Notifications**: Receive instant updates via Hedera Topics

### For Merchants (Web Dashboard)

- **Multi-Shop Management**: Create and manage multiple shop locations
- **Transaction Tracking**: Real-time view of all payments and income
- **Campaign Creation**: Launch custom token campaigns with automatic token generation
- **Withdrawal System**: Withdraw funds to M-Pesa or other wallets
- **Analytics Dashboard**: Visual charts for income, shop performance, and customer insights
- **Notification System**: Real-time alerts for transactions, campaigns, and withdrawals

---

## Core Features Explained

### 1. Token System (KES Tokens)

- **Token Creation**: KES tokens are created on Hedera network
- **Token Decimals**: 2 decimal places (100 = 1 KES)
- **Token Association**: Automatic token association when users register
- **Balance Checking**: Real-time balance verification before transactions

### 2. Payment Flow

1. User buys KES tokens via M-Pesa through mobile app
2. Tokens are transferred to user's Hedera account
3. User enters merchant shop ID and amount
4. System verifies user has sufficient balance
5. Transaction is executed on Hedera network
6. Merchant receives tokens in their account
7. Transaction is recorded in database
8. Both parties receive notifications via Hedera Topics

### 3. Campaign System

- **Custom Token Creation**: Merchants can create campaigns with unique tokens
- **Token Symbol Generation**: Automatic symbol generation from campaign name
- **Target Tracking**: Set target tokens and track distribution
- **Participant Management**: Track all participants and their token balances
- **Campaign Ending**: Merchants can end campaigns and notify participants

### 4. Withdrawal System

- **Multiple Options**: Withdraw to M-Pesa, other wallets, or Hedera accounts
- **Withdrawal Limits**: 90% of available balance
- **Quick Withdrawal**: Pre-set percentage options (25%, 50%, 75%, 100%)
- **Transaction History**: Track all withdrawal requests

### 5. Notification System

- **Hedera Topics**: Each user and merchant has a unique topic ID
- **Real-time Updates**: Instant notifications for:
  - Transaction received/sent
  - Token purchases
  - Campaign joined
  - Campaign ended
  - Withdrawal completed
  - Shop created
  - Campaign created

---

## Database Schema

### Core Tables

- **merchants**: Store merchant information and Hedera account details
- **users**: Store user information and encrypted keys
- **shops**: Merchant shop locations with payment IDs
- **campaigns**: Marketing campaigns with token information
- **campaigns_entry**: Track user participation in campaigns
- **transactions**: Record all payment transactions
- **purchases**: Track token purchases
- **withdrawals**: Track withdrawal requests
- **tokens**: Store authentication tokens

---

## Security Features

- **Password Hashing**: Bcrypt with salt
- **JWT Authentication**: Secure token-based authentication
- **Encrypted Keys**: Private keys stored encrypted in database
- **Transaction Validation**: Balance checks before transactions
- **Merchant Authorization**: Shop ownership verification
- **HTTPS**: All communications encrypted
- **CORS Protection**: Configured CORS headers

---

## Transaction Fees

- **Fee Structure**: 0.5% of transaction amount
- **Minimum Fee**: 0 KES for transactions ≤ 100 KES
- **Fee Collection**: Fees collected to operator account
- **Transparent**: All fees visible in transaction records

---

## Mobile App Features

### User Flow

1. **Registration**: Create account with username, mobile number, and password
2. **Account Creation**: Automatic Hedera account creation with key generation
3. **Token Purchase**: Buy KES tokens via M-Pesa integration
4. **Shop Discovery**: Enter merchant shop ID to view shop details
5. **Payment**: Enter amount and confirm payment
6. **Campaign Participation**: Browse and join merchant campaigns
7. **Transaction History**: View all past transactions

### Key Integrations

- **M-Pesa API**: Secure payment processing
- **Hedera SDK**: Blockchain operations
- **Push Notifications**: Real-time updates via Hedera Topics

---

## Merchant Dashboard Features

### Dashboard Overview

- **Total Income**: Weekly income tracking with visual charts
- **Withdrawals**: 30-day withdrawal summary
- **Shop Performance**: Performance metrics for each shop
- **Recent Transactions**: Latest payment activity
- **Active Campaigns**: Current marketing campaigns

### Shop Management

- **Create Shops**: Add new shop locations with custom names and images
- **Shop Details**: View shop information and payment ID
- **Campaign Management**: Create and manage campaigns per shop
- **Transaction Analytics**: View shop-specific transaction data

### Campaign Management

- **Create Campaigns**: Set campaign name, description, and target
- **Automatic Token Creation**: System generates unique tokens for campaigns
- **Participant Tracking**: Monitor campaign participants and their contributions
- **Campaign Analytics**: Track distributed tokens and campaign performance
- **End Campaign**: Close campaigns and notify participants

### Withdrawal Management

- **Quick Withdrawal**: Pre-set percentage options
- **Custom Amount**: Enter specific withdrawal amount
- **Multiple Methods**: Withdraw to M-Pesa or other wallets
- **Transaction History**: Track all withdrawal requests

---

## Financial Inclusion Impact

### Target Users

- **Small Business Owners**: Merchants with limited access to digital payment infrastructure
- **Under-banked Consumers**: Users without traditional bank accounts
- **Rural Communities**: Areas with limited banking services
- **Youth Population**: Tech-savvy users seeking digital solutions

### Benefits

- **Low Transaction Costs**: Leveraging Hedera's low-fee infrastructure
- **Fast Transactions**: Near-instant settlement on Hedera network
- **Transparency**: All transactions recorded on blockchain
- **Accessibility**: Simple mobile app interface
- **Financial Tools**: Comprehensive merchant dashboard
- **Marketing Tools**: Campaign system for customer engagement

---

## Future Enhancements

- **Multi-Currency Support**: Support for other African currencies
- **Loyalty Programs**: Advanced reward systems
- **Analytics Dashboard**: Advanced business intelligence
- **API Marketplace**: Third-party integrations
- **Mobile Money Integration**: Support for other mobile money providers
- **Micro-Lending**: Integration with lending protocols
- **Cross-Border Payments**: International remittance features

---

## Metrics & Analytics

### Merchant Dashboard Metrics

- Total income (weekly)
- Withdrawal history (30 days)
- Shop performance comparison
- Transaction volume
- Campaign participation rates

### User Metrics

- Token balance
- Transaction history
- Campaign participation
- Purchase history

---

## Demo Highlights

### User Journey

1. Download mobile app and register
2. Buy KES tokens using M-Pesa
3. Visit merchant shop and enter shop ID
4. Make payment for goods/services
5. Receive instant confirmation
6. Join merchant campaign to earn rewards

### Merchant Journey

1. Register on web dashboard
2. Create shop with custom details
3. Receive first payment and see real-time update
4. Create marketing campaign
5. Track campaign participants
6. Withdraw funds to M-Pesa

---

## Conclusion

Orcus represents a comprehensive solution for financial inclusion in Africa, leveraging Hedera's blockchain infrastructure to provide a fast, secure, and low-cost payment platform. By combining mobile payments, merchant management, and marketing tools, Orcus addresses the needs of both consumers and businesses in underbanked regions.

The platform's integration with M-Pesa ensures familiarity for users while blockchain technology provides transparency and security. The merchant dashboard empowers small businesses with enterprise-level tools, while the campaign system enables innovative marketing strategies.

With its modular architecture, scalable design, and focus on user experience, Orcus is positioned to make a significant impact on financial inclusion across Africa.

---

## Acknowledgments

Built for Hedera Africa Hackathon 2024  
Powered by Hedera Hashgraph  
Inspired by the need for financial inclusion across Africa
