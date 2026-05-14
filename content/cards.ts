export type FixedPurchaseOption = {
  label: string
  amount?: number
  requiresCustomAmount?: boolean
  min?: number
  max?: number
  step?: number
}

export type CountryPurchaseRule = {
  code: string
  name: string
  currency: string
  mode: "input" | "fixed" | "hybrid"
  min?: number
  max?: number
  step?: number
  options?: FixedPurchaseOption[]
}

export type PurchaseRule = {
  requiresCountrySelection: boolean
  countries: CountryPurchaseRule[]
}

export type CardProduct = {
  id: string
  slug: string
  name: string
  shortName: string
  badge: string
  subtitle: string
  description: string
  accent: string
  image: string
  deliveryText: string
  features: string[]
  purchaseNote: string
  supportsSubscription: boolean
  purchaseRule: PurchaseRule
}

const fixed = (currency: string, values: Array<number | string>): FixedPurchaseOption[] =>
  values.map((value) => ({
    label: `${currency} ${value}`,
    amount: Number(value),
  }))

const custom = (
  label: string,
  min: number,
  max: number,
  step = 0.01
): FixedPurchaseOption => ({
  label,
  requiresCustomAmount: true,
  min,
  max,
  step,
})

const appleEuroOptions = fixed("EUR", [5, 10, 15, 25, 50])
const appleGermanyOptions = fixed("EUR", [25, 50])
const xboxEuroWideOptions = fixed("EUR", [5, 10, 15, 20, 25, 30, 50, 75])
const xboxUkOptions = fixed("GBP", [5, 10, 15, 25, 50])

export const cardProducts: CardProduct[] = [
  {
    id: "visa",
    slug: "visa",
    name: "Visa",
    shortName: "Visa",
    badge: "Global",
    subtitle: "Virtual Visa card",
    description:
      "Enter the USD amount you need. The system adds a fixed USD 2.50 service fee, then converts the final amount to CNY for checkout.",
    accent: "from-[#0f3fb3] via-[#1c60f2] to-[#66a1ff]",
    image: "/visa-10.svg",
    deliveryText: "Email delivery for card number / code / QR",
    features: ["Custom USD amount", "One-time purchase", "No software subscription"],
    purchaseNote: "Visa cards are one-time use products and do not support subscription payments.",
    supportsSubscription: false,
    purchaseRule: {
      requiresCountrySelection: false,
      countries: [
        {
          code: "US",
          name: "United States",
          currency: "USD",
          mode: "input",
          min: 1,
          max: 100,
          step: 0.01,
        },
      ],
    },
  },
  {
    id: "mastercard",
    slug: "mastercard",
    name: "Mastercard",
    shortName: "Mastercard",
    badge: "Global",
    subtitle: "Virtual Mastercard",
    description:
      "Enter the USD amount you need. The system adds a fixed USD 2.50 service fee, then converts the final amount to CNY for checkout.",
    accent: "from-[#111111] via-[#2d2d2d] to-[#575757]",
    image: "/mastercard-modern-design-.svg",
    deliveryText: "Email delivery for card number / code / QR",
    features: ["Custom USD amount", "One-time purchase", "No software subscription"],
    purchaseNote:
      "Mastercard cards are one-time use products and do not support subscription payments.",
    supportsSubscription: false,
    purchaseRule: {
      requiresCountrySelection: false,
      countries: [
        {
          code: "US",
          name: "United States",
          currency: "USD",
          mode: "input",
          min: 1,
          max: 100,
          step: 0.01,
        },
      ],
    },
  },
  {
    id: "apple-gift-card",
    slug: "apple-gift-card",
    name: "Apple 礼品卡",
    shortName: "Apple",
    badge: "Gift Card",
    subtitle: "Apple iTunes / Apple 礼品卡",
    description:
      "请先选择目标国家或地区。部分 Apple 区服支持自定义金额输入，部分区服使用固定面值。",
    accent: "from-[#111827] via-[#374151] to-[#9ca3af]",
    image: "/apple-pay-3.svg",
    deliveryText: "兑换码发送至邮箱",
    features: ["按国家区分规则", "支持固定面值或输入金额", "支持订阅支付"],
    purchaseNote: "Apple 礼品卡的购买方式会根据所选国家或地区变化。",
    supportsSubscription: true,
    purchaseRule: {
      requiresCountrySelection: true,
      countries: [
        { code: "AT", name: "Austria", currency: "EUR", mode: "fixed", options: appleEuroOptions },
        { code: "CA", name: "Canada", currency: "CAD", mode: "input", min: 5, max: 140, step: 0.01 },
        { code: "DE", name: "Germany", currency: "EUR", mode: "fixed", options: appleGermanyOptions },
        { code: "FI", name: "Finland", currency: "EUR", mode: "fixed", options: appleEuroOptions },
        { code: "FR", name: "France", currency: "EUR", mode: "fixed", options: appleEuroOptions },
        { code: "GB", name: "United Kingdom", currency: "GBP", mode: "input", min: 2, max: 75, step: 0.01 },
        { code: "IE", name: "Ireland", currency: "EUR", mode: "fixed", options: appleEuroOptions },
        { code: "NL", name: "Netherlands", currency: "EUR", mode: "fixed", options: appleEuroOptions },
        { code: "PT", name: "Portugal", currency: "EUR", mode: "fixed", options: appleEuroOptions },
        { code: "TR", name: "Turkey", currency: "TRY", mode: "input", min: 10, max: 1500, step: 1 },
        { code: "US", name: "United States", currency: "USD", mode: "input", min: 2, max: 100, step: 0.01 },
      ],
    },
  },
  {
    id: "google-play",
    slug: "google-play",
    name: "Google Play 礼品卡",
    shortName: "Google",
    badge: "Gift Card",
    subtitle: "Google Play 礼品卡",
    description:
      "请先选择目标国家或地区。部分 Google Play 区服支持自定义金额输入，部分区服使用固定面值。",
    accent: "from-[#14532d] via-[#16a34a] to-[#86efac]",
    image: "/google-pay-2.svg",
    deliveryText: "兑换码发送至邮箱",
    features: ["按国家区分规则", "支持固定面值或输入金额", "支持订阅支付"],
    purchaseNote: "Google Play 礼品卡的购买方式会根据所选国家或地区变化。",
    supportsSubscription: true,
    purchaseRule: {
      requiresCountrySelection: true,
      countries: [
        { code: "AT", name: "Austria", currency: "EUR", mode: "fixed", options: fixed("EUR", [15, 25, 50]) },
        { code: "BR", name: "Brazil", currency: "BRL", mode: "input", min: 10, max: 300, step: 1 },
        { code: "CA", name: "Canada", currency: "CAD", mode: "input", min: 10, max: 100, step: 0.01 },
        { code: "DE", name: "Germany", currency: "EUR", mode: "input", min: 1, max: 100, step: 0.01 },
        { code: "FR", name: "France", currency: "EUR", mode: "fixed", options: fixed("EUR", [5, 10, 25]) },
        { code: "GB", name: "United Kingdom", currency: "GBP", mode: "input", min: 1, max: 75, step: 0.01 },
        {
          code: "IT",
          name: "Italy",
          currency: "EUR",
          mode: "fixed",
          options: fixed("EUR", [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 75]),
        },
        { code: "US", name: "United States", currency: "USD", mode: "input", min: 5, max: 100, step: 0.01 },
      ],
    },
  },
  {
    id: "xbox",
    slug: "xbox",
    name: "Xbox Gift Card",
    shortName: "Xbox",
    badge: "Gift Card",
    subtitle: "Xbox / Xbox Live / Game Pass",
    description:
      "Choose the target country first. Some regions use fixed products only, while Brazil includes both fixed products and a Game Pass Ultimate custom amount range.",
    accent: "from-[#0f5132] via-[#1b7f43] to-[#7ddc5f]",
    image: "/xbox-one-2.svg",
    deliveryText: "Email delivery for code",
    features: ["Country-specific products", "Mixed fixed and custom rules", "Email delivery"],
    purchaseNote: "Xbox products vary a lot by region. Please select the country first.",
    supportsSubscription: false,
    purchaseRule: {
      requiresCountrySelection: true,
      countries: [
        { code: "AT", name: "Austria", currency: "EUR", mode: "fixed", options: xboxEuroWideOptions },
        {
          code: "BR",
          name: "Brazil",
          currency: "BRL",
          mode: "hybrid",
          options: [
            ...fixed("BRL", [5, 10, 15, 20, 25, 40, 50, 60, 70, 100, 200]),
            { label: "Xbox Game Pass BRL 89.99", amount: 89.99 },
            { label: "Xbox Game Pass BRL 101.99", amount: 101.99 },
            { label: "Xbox Game Pass Core BRL 85.99", amount: 85.99 },
            { label: "Xbox Game Pass Core BRL 199.99", amount: 199.99 },
            custom("Xbox Game Pass Ultimate", 49.99, 149.99, 0.01),
          ],
        },
        {
          code: "CA",
          name: "Canada",
          currency: "CAD",
          mode: "fixed",
          options: [
            { label: "Xbox Live Canada CAD 15", amount: 15 },
            { label: "Xbox Live Canada CAD 25", amount: 25 },
            { label: "Xbox Live Canada CAD 50", amount: 50 },
            { label: "Xbox Live Canada CAD 75", amount: 75 },
            { label: "Xbox Live Canada CAD 100", amount: 100 },
            { label: "Xbox Live 3 Months Canada CAD 29.99", amount: 29.99 },
            { label: "Xbox Live 12 Months Canada CAD 69.99", amount: 69.99 },
            { label: "Xbox Game Pass 3 Months Canada CAD 35.99", amount: 35.99 },
            { label: "Xbox Game Pass 6 Months Canada CAD 71.99", amount: 71.99 },
          ],
        },
        { code: "DE", name: "Germany", currency: "EUR", mode: "fixed", options: xboxEuroWideOptions },
        { code: "ES", name: "Spain", currency: "EUR", mode: "fixed", options: xboxEuroWideOptions },
        { code: "FI", name: "Finland", currency: "EUR", mode: "fixed", options: xboxEuroWideOptions },
        { code: "FR", name: "France", currency: "EUR", mode: "fixed", options: xboxEuroWideOptions },
        { code: "GB", name: "United Kingdom", currency: "GBP", mode: "fixed", options: xboxUkOptions },
        { code: "GR", name: "Greece", currency: "EUR", mode: "fixed", options: xboxEuroWideOptions },
        { code: "IE", name: "Ireland", currency: "EUR", mode: "fixed", options: xboxEuroWideOptions },
        { code: "IT", name: "Italy", currency: "EUR", mode: "fixed", options: xboxEuroWideOptions },
        { code: "NL", name: "Netherlands", currency: "EUR", mode: "fixed", options: xboxEuroWideOptions },
        { code: "PL", name: "Poland", currency: "PLN", mode: "fixed", options: fixed("PLN", [20, 50, 100, 200]) },
        { code: "PT", name: "Portugal", currency: "EUR", mode: "fixed", options: xboxEuroWideOptions },
        {
          code: "US",
          name: "United States",
          currency: "USD",
          mode: "fixed",
          options: [
            { label: "Xbox US USD 10", amount: 10 },
            { label: "Xbox US USD 15", amount: 15 },
            { label: "Xbox US USD 20", amount: 20 },
            { label: "Xbox US USD 25", amount: 25 },
            { label: "Xbox US USD 50", amount: 50 },
            { label: "Xbox US USD 100", amount: 100 },
            { label: "Xbox Live US USD 5", amount: 5 },
            { label: "Xbox Live US USD 10", amount: 10 },
            { label: "Xbox Live US USD 15", amount: 15 },
            { label: "Xbox Live US USD 25", amount: 25 },
            { label: "Xbox Live US USD 50", amount: 50 },
            { label: "Xbox Live US USD 100", amount: 100 },
            { label: "EA 12 Months Xbox US USD 29.99", amount: 29.99 },
          ],
        },
      ],
    },
  },
  {
    id: "amazon",
    slug: "amazon",
    name: "Amazon Gift Card",
    shortName: "Amazon",
    badge: "Gift Card",
    subtitle: "Amazon Gift Card",
    description:
      "Choose the target country first. Some Amazon regions use custom amounts, while Germany uses fixed denominations.",
    accent: "from-[#111827] via-[#1f2937] to-[#f59e0b]",
    image: "/amazon-pay-1.svg",
    deliveryText: "Email delivery for redemption code",
    features: ["Country-specific rules", "Mixed input and fixed values", "Email delivery"],
    purchaseNote: "Amazon gift card availability depends on the selected country.",
    supportsSubscription: false,
    purchaseRule: {
      requiresCountrySelection: true,
      countries: [
        { code: "AT", name: "Austria", currency: "EUR", mode: "input", min: 1, max: 100, step: 0.01 },
        { code: "AU", name: "Australia", currency: "AUD", mode: "input", min: 1, max: 100, step: 0.01 },
        { code: "CA", name: "Canada", currency: "CAD", mode: "input", min: 0.05, max: 100, step: 0.01 },
        { code: "DE", name: "Germany", currency: "EUR", mode: "fixed", options: fixed("EUR", [10, 25, 50]) },
        { code: "FR", name: "France", currency: "EUR", mode: "input", min: 1, max: 100, step: 0.01 },
        { code: "GB", name: "United Kingdom", currency: "GBP", mode: "input", min: 5, max: 100, step: 0.01 },
        { code: "IT", name: "Italy", currency: "EUR", mode: "input", min: 1, max: 100, step: 0.01 },
        { code: "US", name: "United States", currency: "USD", mode: "input", min: 1, max: 100, step: 0.01 },
      ],
    },
  },
  {
    id: "ebay",
    slug: "ebay",
    name: "eBay Gift Card",
    shortName: "eBay",
    badge: "Gift Card",
    subtitle: "eBay US Gift Card",
    description:
      "eBay gift cards are handled as a US region product. Enter the USD amount you need, then the system converts it for checkout.",
    accent: "from-[#fbbf24] via-[#ef4444] to-[#2563eb]",
    image: "/ebay-1.svg",
    deliveryText: "Email delivery for redemption code",
    features: ["US region", "Custom USD amount", "Email delivery"],
    purchaseNote: "eBay gift cards use a default US rule and do not require country selection.",
    supportsSubscription: false,
    purchaseRule: {
      requiresCountrySelection: false,
      countries: [
        { code: "US", name: "United States", currency: "USD", mode: "input", min: 5, max: 100, step: 0.01 },
      ],
    },
  },
  {
    id: "nintendo",
    slug: "nintendo",
    name: "Nintendo Gift Card",
    shortName: "Nintendo",
    badge: "Gift Card",
    subtitle: "Nintendo eShop Gift Card",
    description:
      "Choose the target country first, then select the exact Nintendo product or denomination for that region.",
    accent: "from-[#991b1b] via-[#dc2626] to-[#fb7185]",
    image: "/nintendo-switch-1.svg",
    deliveryText: "Email delivery for code",
    features: ["Country-specific products", "Fixed products only", "Email delivery"],
    purchaseNote: "Nintendo products vary by region and are sold as fixed products only.",
    supportsSubscription: false,
    purchaseRule: {
      requiresCountrySelection: true,
      countries: [
        { code: "CA", name: "Canada", currency: "CAD", mode: "fixed", options: fixed("CAD", [20, 35, 50]) },
        { code: "DE", name: "Germany", currency: "EUR", mode: "fixed", options: fixed("EUR", [15, 25, 50]) },
        {
          code: "ES",
          name: "Spain",
          currency: "EUR",
          mode: "fixed",
          options: [
            { label: "Nintendo Switch Online EUR 7.99", amount: 7.99 },
            { label: "Nintendo Switch Online EUR 19.99", amount: 19.99 },
            { label: "Nintendo eShop EUR 15", amount: 15 },
            { label: "Nintendo eShop EUR 25", amount: 25 },
            { label: "Nintendo eShop EUR 50", amount: 50 },
            { label: "Nintendo eShop EUR 75", amount: 75 },
            { label: "Nintendo EUR 15", amount: 15 },
            { label: "Nintendo EUR 25", amount: 25 },
          ],
        },
        {
          code: "FR",
          name: "France",
          currency: "EUR",
          mode: "fixed",
          options: [
            { label: "Nintendo Switch EUR 7.99", amount: 7.99 },
            { label: "Nintendo Switch EUR 19.99", amount: 19.99 },
            { label: "Nintendo EUR 15", amount: 15 },
            { label: "Nintendo EUR 50", amount: 50 },
          ],
        },
        {
          code: "GB",
          name: "United Kingdom",
          currency: "GBP",
          mode: "fixed",
          options: [
            { label: "Nintendo eShop GBP 15", amount: 15 },
            { label: "Nintendo eShop GBP 25", amount: 25 },
            { label: "Nintendo eShop GBP 50", amount: 50 },
            { label: "Nintendo eShop GBP 75", amount: 75 },
            { label: "Nintendo Switch GBP 6.99", amount: 6.99 },
            { label: "Nintendo Switch GBP 17.99", amount: 17.99 },
            { label: "Nintendo Switch Online GBP 6.99", amount: 6.99 },
            { label: "Nintendo Switch Online GBP 17.99", amount: 17.99 },
          ],
        },
        {
          code: "IT",
          name: "Italy",
          currency: "EUR",
          mode: "fixed",
          options: [
            { label: "Nintendo Switch Online EUR 7.99", amount: 7.99 },
            { label: "Nintendo Switch Online EUR 19.99", amount: 19.99 },
            { label: "Nintendo eShop EUR 15", amount: 15 },
            { label: "Nintendo eShop EUR 25", amount: 25 },
            { label: "Nintendo eShop EUR 50", amount: 50 },
            { label: "Nintendo eShop EUR 75", amount: 75 },
            { label: "Nintendo EUR 15", amount: 15 },
            { label: "Nintendo EUR 25", amount: 25 },
            { label: "Nintendo EUR 50", amount: 50 },
          ],
        },
        {
          code: "NL",
          name: "Netherlands",
          currency: "EUR",
          mode: "fixed",
          options: [
            { label: "Nintendo Switch EUR 7.99", amount: 7.99 },
            { label: "Nintendo Switch EUR 19.99", amount: 19.99 },
            { label: "Nintendo eShop EUR 15", amount: 15 },
            { label: "Nintendo eShop EUR 25", amount: 25 },
            { label: "Nintendo eShop EUR 50", amount: 50 },
            { label: "Nintendo eShop EUR 75", amount: 75 },
          ],
        },
        {
          code: "PL",
          name: "Poland",
          currency: "PLN",
          mode: "fixed",
          options: [
            { label: "Nintendo eShop PLN 70", amount: 70 },
            { label: "Nintendo eShop PLN 120", amount: 120 },
            { label: "Nintendo eShop PLN 250", amount: 250 },
            { label: "Nintendo eShop PLN 370", amount: 370 },
            { label: "Nintendo Switch Online PLN 32", amount: 32 },
            { label: "Nintendo Switch Online PLN 80", amount: 80 },
          ],
        },
        {
          code: "US",
          name: "United States",
          currency: "USD",
          mode: "fixed",
          options: [
            { label: "Nintendo USD 10", amount: 10 },
            { label: "Nintendo USD 20", amount: 20 },
            { label: "Nintendo USD 35", amount: 35 },
            { label: "Nintendo USD 50", amount: 50 },
            { label: "Mortal Kombat 11 Nintendo Switch USD 59.99", amount: 59.99 },
          ],
        },
      ],
    },
  },
  {
    id: "paypal",
    slug: "paypal",
    name: "PayPal",
    shortName: "PayPal",
    badge: "Payment",
    subtitle: "PayPal US Card",
    description:
      "PayPal is handled as a default US region product. Enter the USD amount you need, then the system converts it for checkout.",
    accent: "from-[#003087] via-[#0070ba] to-[#00a1e0]",
    image: "/paypal-4.svg",
    deliveryText: "Email delivery for card / code / QR",
    features: ["US region", "Custom USD amount", "Email delivery"],
    purchaseNote: "PayPal uses a default US rule and does not require country selection.",
    supportsSubscription: false,
    purchaseRule: {
      requiresCountrySelection: false,
      countries: [
        { code: "US", name: "United States", currency: "USD", mode: "input", min: 1, max: 100, step: 0.01 },
      ],
    },
  },
  {
    id: "roblox",
    slug: "roblox",
    name: "Roblox Gift Card",
    shortName: "Roblox",
    badge: "Gift Card",
    subtitle: "Roblox Gift Card",
    description:
      "Choose the target country first. Some regions use custom input amounts, while the US region uses fixed denominations.",
    accent: "from-[#111111] via-[#3f3f46] to-[#a1a1aa]",
    image: "/roblox-10.svg",
    deliveryText: "Email delivery for code",
    features: ["Country-specific rules", "Mixed input and fixed values", "Email delivery"],
    purchaseNote: "Roblox availability depends on the selected country.",
    supportsSubscription: false,
    purchaseRule: {
      requiresCountrySelection: true,
      countries: [
        { code: "AT", name: "Austria", currency: "EUR", mode: "input", min: 10, max: 100, step: 0.01 },
        { code: "AU", name: "Australia", currency: "AUD", mode: "input", min: 10, max: 100, step: 0.01 },
        { code: "BR", name: "Brazil", currency: "BRL", mode: "input", min: 25, max: 500, step: 1 },
        { code: "DK", name: "Denmark", currency: "DKK", mode: "input", min: 100, max: 600, step: 1 },
        { code: "FI", name: "Finland", currency: "EUR", mode: "input", min: 10, max: 100, step: 0.01 },
        { code: "US", name: "United States", currency: "USD", mode: "fixed", options: fixed("USD", [10, 15, 25, 50, 100]) },
      ],
    },
  },
  {
    id: "spotify",
    slug: "spotify",
    name: "Spotify Gift Card",
    shortName: "Spotify",
    badge: "Gift Card",
    subtitle: "Spotify Gift Card",
    description:
      "Choose the target country first, then select a fixed denomination. Spotify does not use a custom amount input.",
    accent: "from-[#052e16] via-[#15803d] to-[#4ade80]",
    image: "/spotify-logo-with-text-1.svg",
    deliveryText: "Email delivery for code",
    features: ["Country-specific rules", "Fixed denominations only", "Email delivery"],
    purchaseNote: "Spotify gift cards use fixed denominations only.",
    supportsSubscription: false,
    purchaseRule: {
      requiresCountrySelection: true,
      countries: [
        { code: "BR", name: "Brazil", currency: "BRL", mode: "fixed", options: fixed("BRL", [17, 50]) },
        { code: "SE", name: "Sweden", currency: "SEK", mode: "fixed", options: fixed("SEK", [110, 330, 660]) },
        { code: "US", name: "United States", currency: "USD", mode: "fixed", options: fixed("USD", [10, 30, 60]) },
      ],
    },
  },
  {
    id: "steam",
    slug: "steam",
    name: "Steam Gift Card",
    shortName: "Steam",
    badge: "Gift Card",
    subtitle: "Steam Wallet Gift Card",
    description:
      "Choose the target country first, then select a fixed denomination. Steam does not use a custom amount input.",
    accent: "from-[#0f172a] via-[#1e3a8a] to-[#0ea5e9]",
    image: "/steam-icon-logo.svg",
    deliveryText: "Email delivery for code",
    features: ["Country-specific rules", "Fixed denominations only", "Email delivery"],
    purchaseNote: "Steam gift cards use fixed denominations only and do not include US or Canada in this catalog.",
    supportsSubscription: false,
    purchaseRule: {
      requiresCountrySelection: true,
      countries: [
        { code: "AT", name: "Austria", currency: "EUR", mode: "fixed", options: fixed("EUR", [10, 20]) },
        { code: "DE", name: "Germany", currency: "EUR", mode: "fixed", options: fixed("EUR", [10, 20]) },
        { code: "ES", name: "Spain", currency: "EUR", mode: "fixed", options: fixed("EUR", [10, 20]) },
        { code: "FI", name: "Finland", currency: "EUR", mode: "fixed", options: fixed("EUR", [10, 20]) },
        { code: "FR", name: "France", currency: "EUR", mode: "fixed", options: fixed("EUR", [10, 20]) },
        { code: "GR", name: "Greece", currency: "EUR", mode: "fixed", options: fixed("EUR", [10, 20]) },
        { code: "HK", name: "Hong Kong", currency: "HKD", mode: "fixed", options: fixed("HKD", [40, 50, 80, 100, 120, 160, 200, 240, 300, 400, 500, 600]) },
        { code: "ID", name: "Indonesia", currency: "IDR", mode: "fixed", options: fixed("IDR", [12000, 45000, 60000, 120000, 250000, 400000, 600000]) },
        { code: "IN", name: "India", currency: "INR", mode: "fixed", options: fixed("INR", [150, 250, 500]) },
        { code: "IT", name: "Italy", currency: "EUR", mode: "fixed", options: fixed("EUR", [10, 20]) },
        { code: "NL", name: "Netherlands", currency: "EUR", mode: "fixed", options: fixed("EUR", [10, 20]) },
        { code: "PH", name: "Philippines", currency: "PHP", mode: "fixed", options: fixed("PHP", [250, 500, 1000]) },
        { code: "PL", name: "Poland", currency: "PLN", mode: "fixed", options: fixed("PLN", [25, 40, 70]) },
        { code: "PT", name: "Portugal", currency: "EUR", mode: "fixed", options: fixed("EUR", [10, 20]) },
        { code: "SG", name: "Singapore", currency: "SGD", mode: "fixed", options: fixed("SGD", [5, 10, 30, 50, 75]) },
        { code: "TW", name: "Taiwan", currency: "TWD", mode: "fixed", options: fixed("TWD", [100, 150, 200, 500, 800, 1000]) },
        { code: "VN", name: "Vietnam", currency: "VND", mode: "fixed", options: fixed("VND", [75000, 100000, 200000]) },
      ],
    },
  },
]

export function getCardProductBySlug(slug: string) {
  return cardProducts.find((product) => product.slug === slug)
}
