export const mockShops = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    merchant_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Tech Gadgets Store",
    payment_id: "pay_tech_gadgets_001",
    theme: "red",
    profile_image_url:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    merchant_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Fashion Boutique",
    payment_id: "pay_fashion_boutique_002",
    theme: "blue",
    profile_image_url:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
    created_at: "2024-01-20T14:45:00Z",
    updated_at: "2024-01-20T14:45:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    merchant_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Coffee Shop",
    payment_id: "pay_coffee_shop_003",
    theme: "green",
    profile_image_url:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop",
    created_at: "2024-01-25T08:00:00Z",
    updated_at: "2024-01-25T08:00:00Z",
  },
];

export const mockMerchants = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    username: "techmerchant",
    mobile_number: "+254712345678",
    account_id: "acc_tech_merchant_001",
    profile_image_url:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    account_banner_image_url:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop",
    auto_offramp: true,
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-10T09:00:00Z",
  },
];

export const mockTransactions = [
  {
    id: "550e8400-e29b-41d4-a716-446655440100",
    shop_id: "550e8400-e29b-41d4-a716-446655440001", // Tech Gadgets Store
    user_id: "550e8400-e29b-41d4-a716-446655440010",
    merchant_id: "550e8400-e29b-41d4-a716-446655440000",
    amount: 2500, // KES 25.00 (in cents)
    fee: 75, // KES 0.75 (3% fee)
    status: "completed" as const,
    created_at: "2024-01-20T14:30:00Z",
    updated_at: "2024-01-20T14:30:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440101",
    shop_id: "550e8400-e29b-41d4-a716-446655440002", // Fashion Boutique
    user_id: "550e8400-e29b-41d4-a716-446655440011",
    merchant_id: "550e8400-e29b-41d4-a716-446655440000",
    amount: 1800, // KES 18.00 (in cents)
    fee: 54, // KES 0.54 (3% fee)
    status: "pending" as const,
    created_at: "2024-01-21T10:15:00Z",
    updated_at: "2024-01-21T10:15:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440102",
    shop_id: "550e8400-e29b-41d4-a716-446655440003", // Coffee Shop
    user_id: "550e8400-e29b-41d4-a716-446655440012",
    merchant_id: "550e8400-e29b-41d4-a716-446655440000",
    amount: 1200, // KES 12.00 (in cents)
    fee: 36, // KES 0.36 (3% fee)
    status: "failed" as const,
    created_at: "2024-01-22T16:45:00Z",
    updated_at: "2024-01-22T16:45:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440101",
    shop_id: "550e8400-e29b-41d4-a716-446655440002", // Fashion Boutique
    user_id: "550e8400-e29b-41d4-a716-446655440011",
    merchant_id: "550e8400-e29b-41d4-a716-446655440000",
    amount: 1800, // KES 18.00 (in cents)
    fee: 54, // KES 0.54 (3% fee)
    status: "pending" as const,
    created_at: "2024-01-21T10:15:00Z",
    updated_at: "2024-01-21T10:15:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440102",
    shop_id: "550e8400-e29b-41d4-a716-446655440003", // Coffee Shop
    user_id: "550e8400-e29b-41d4-a716-446655440012",
    merchant_id: "550e8400-e29b-41d4-a716-446655440000",
    amount: 1200, // KES 12.00 (in cents)
    fee: 36, // KES 0.36 (3% fee)
    status: "failed" as const,
    created_at: "2024-01-22T16:45:00Z",
    updated_at: "2024-01-22T16:45:00Z",
  },
];

export const mockCampaigns = [
  {
    id: "550e8400-e29b-41d4-a716-446655440200",
    shop_id: "550e8400-e29b-41d4-a716-446655440001", // Tech Gadgets Store
    name: "Tech Launch Campaign",
    token_id: "TECH001",
    description:
      "Get 10% off on all tech gadgets with our launch campaign tokens",
    target_tokens: 10000,
    distributed: 7500,
    icon: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100&h=100&fit=crop",
    banner_image_url:
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=200&fit=crop",
    ended: 0, // Active
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440201",
    shop_id: "550e8400-e29b-41d4-a716-446655440002", // Fashion Boutique
    name: "Summer Fashion Sale",
    token_id: "FASH001",
    description: "Exclusive summer collection with special discount tokens",
    target_tokens: 5000,
    distributed: 3200,
    icon: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop",
    banner_image_url:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=200&fit=crop",
    ended: 0, // Active
    created_at: "2024-01-20T14:45:00Z",
    updated_at: "2024-01-20T14:45:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440202",
    shop_id: "550e8400-e29b-41d4-a716-446655440003", // Coffee Shop
    name: "Morning Coffee Rewards",
    token_id: "COFF001",
    description:
      "Earn tokens with every coffee purchase and redeem for free drinks",
    target_tokens: 8000,
    distributed: 12000,
    icon: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&h=100&fit=crop",
    banner_image_url:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=200&fit=crop",
    ended: 1, // Ended
    created_at: "2024-01-25T08:00:00Z",
    updated_at: "2024-01-25T08:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440203",
    shop_id: "550e8400-e29b-41d4-a716-446655440001", // Tech Gadgets Store
    name: "Gaming Accessories Promo",
    token_id: "GAME001",
    description: "Special tokens for gaming accessories and peripherals",
    target_tokens: 3000,
    distributed: 1800,
    icon: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&h=100&fit=crop",
    banner_image_url:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=200&fit=crop",
    ended: 0, // Active
    created_at: "2024-01-28T12:00:00Z",
    updated_at: "2024-01-28T12:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440204",
    shop_id: "550e8400-e29b-41d4-a716-446655440002", // Fashion Boutique
    name: "Loyalty Program Launch",
    token_id: "LOYAL001",
    description: "Join our loyalty program and earn tokens with every purchase",
    target_tokens: 15000,
    distributed: 8500,
    icon: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop",
    banner_image_url:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=200&fit=crop",
    ended: 0, // Active
    created_at: "2024-01-30T16:30:00Z",
    updated_at: "2024-01-30T16:30:00Z",
  },
];
