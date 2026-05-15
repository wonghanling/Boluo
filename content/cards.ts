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
    name: "Visa 卡",
    shortName: "Visa",
    badge: "Global",
    subtitle: "虚拟 Visa 卡",
    description:
      "请输入需要购买的美元金额。系统会先将所选金额换算为美元，再加上固定 2.00 USD 服务费，最后按人民币结算。",
    accent: "from-[#0f3fb3] via-[#1c60f2] to-[#66a1ff]",
    image: "/visa-10.svg",
    deliveryText: "卡号 / 卡密 / 二维码发送至邮箱",
    features: ["支持自定义金额", "一次性消费", "不支持软件订阅"],
    purchaseNote: "Visa 卡属于一次性消费卡，不支持用于订阅类自动扣费。",
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
    name: "Mastercard 卡",
    shortName: "Mastercard",
    badge: "Global",
    subtitle: "虚拟 Mastercard 卡",
    description:
      "请输入需要购买的美元金额。系统会先将所选金额换算为美元，再加上固定 2.00 USD 服务费，最后按人民币结算。",
    accent: "from-[#111111] via-[#2d2d2d] to-[#575757]",
    image: "/mastercard-modern-design-.svg",
    deliveryText: "卡号 / 卡密 / 二维码发送至邮箱",
    features: ["支持自定义金额", "一次性消费", "不支持软件订阅"],
    purchaseNote: "Mastercard 卡属于一次性消费卡，不支持用于订阅类自动扣费。",
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
      "请先选择目标国家或地区。不同国家支持的购买方式不同，部分地区为固定面值，部分地区可直接输入金额。",
    accent: "from-[#111827] via-[#374151] to-[#9ca3af]",
    image: "/apple-pay-3.svg",
    deliveryText: "兑换码发送至邮箱",
    features: ["按国家显示规则", "支持固定面值或输入金额", "支持订阅消费"],
    purchaseNote: "Apple 礼品卡会根据所选国家或地区展示对应的购买方式。",
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
      "请先选择目标国家或地区。不同国家支持的购买方式不同，部分地区为固定面值，部分地区可直接输入金额。",
    accent: "from-[#14532d] via-[#16a34a] to-[#86efac]",
    image: "/google-pay-2.svg",
    deliveryText: "兑换码发送至邮箱",
    features: ["按国家显示规则", "支持固定面值或输入金额", "支持订阅消费"],
    purchaseNote: "Google Play 礼品卡会根据所选国家或地区展示对应的购买方式。",
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
    name: "Xbox 礼品卡",
    shortName: "Xbox",
    badge: "Gift Card",
    subtitle: "Xbox / Xbox Live / Game Pass",
    description:
      "请先选择目标国家或地区。不同国家区服的商品与面值差异较大，部分地区只支持固定产品，巴西区同时支持固定商品和指定金额输入。",
    accent: "from-[#0f5132] via-[#1b7f43] to-[#7ddc5f]",
    image: "/xbox-one-2.svg",
    deliveryText: "兑换码发送至邮箱",
    features: ["按国家选择商品", "支持固定商品或混合规则", "兑换码发送至邮箱"],
    purchaseNote: "Xbox 各国家区服商品差异较大，请先确认国家后再选择具体产品。",
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
    name: "Amazon 礼品卡",
    shortName: "Amazon",
    badge: "Gift Card",
    subtitle: "Amazon Gift Card",
    description:
      "请先选择目标国家或地区。部分国家支持输入金额，德国区使用固定面值，其他国家按对应规则显示。",
    accent: "from-[#111827] via-[#1f2937] to-[#f59e0b]",
    image: "/amazon-pay-1.svg",
    deliveryText: "兑换码发送至邮箱",
    features: ["按国家显示规则", "支持固定面值或输入金额", "兑换码发送至邮箱"],
    purchaseNote: "Amazon 礼品卡会根据国家区服展示不同的购买规则。",
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
    name: "eBay 礼品卡",
    shortName: "eBay",
    badge: "Gift Card",
    subtitle: "eBay 美国区礼品卡",
    description:
      "eBay 礼品卡默认按美国区处理。请输入需要购买的美元金额，系统会自动完成后续换算。",
    accent: "from-[#fbbf24] via-[#ef4444] to-[#2563eb]",
    image: "/ebay-1.svg",
    deliveryText: "兑换码发送至邮箱",
    features: ["默认美国区", "支持自定义美元金额", "兑换码发送至邮箱"],
    purchaseNote: "eBay 礼品卡默认使用美国区规则，无需再选择国家。",
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
    name: "Nintendo 礼品卡",
    shortName: "Nintendo",
    badge: "Gift Card",
    subtitle: "Nintendo eShop 礼品卡",
    description:
      "请先选择目标国家或地区，再选择对应区服可购买的 Nintendo 商品或固定面值。",
    accent: "from-[#991b1b] via-[#dc2626] to-[#fb7185]",
    image: "/nintendo-switch-1.svg",
    deliveryText: "兑换码发送至邮箱",
    features: ["按国家选择商品", "仅支持固定商品或固定面值", "兑换码发送至邮箱"],
    purchaseNote: "Nintendo 各国家区服商品差异较大，请先确认国家后再下单。",
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
    subtitle: "PayPal 美国区",
    description:
      "PayPal 默认按美国区处理。请输入需要购买的美元金额，系统会自动完成后续换算。",
    accent: "from-[#003087] via-[#0070ba] to-[#00a1e0]",
    image: "/paypal-4.svg",
    deliveryText: "卡号 / 卡密 / 二维码发送至邮箱",
    features: ["默认美国区", "支持自定义美元金额", "发货至邮箱"],
    purchaseNote: "PayPal 默认使用美国区规则，无需再选择国家。",
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
    name: "Roblox 礼品卡",
    shortName: "Roblox",
    badge: "Gift Card",
    subtitle: "Roblox 礼品卡",
    description:
      "请先选择目标国家或地区。部分地区支持输入金额，美国区使用固定面值。",
    accent: "from-[#111111] via-[#3f3f46] to-[#a1a1aa]",
    image: "/roblox-10.svg",
    deliveryText: "兑换码发送至邮箱",
    features: ["按国家显示规则", "支持输入金额或固定面值", "兑换码发送至邮箱"],
    purchaseNote: "Roblox 礼品卡会根据国家区服显示不同的购买规则。",
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
    name: "Spotify 礼品卡",
    shortName: "Spotify",
    badge: "Gift Card",
    subtitle: "Spotify 礼品卡",
    description:
      "请先选择目标国家或地区，再选择该地区对应的固定面值。",
    accent: "from-[#052e16] via-[#15803d] to-[#4ade80]",
    image: "/spotify-logo-with-text-1.svg",
    deliveryText: "兑换码发送至邮箱",
    features: ["按国家显示规则", "仅支持固定面值", "兑换码发送至邮箱"],
    purchaseNote: "Spotify 礼品卡仅支持固定面值，不提供自定义金额。",
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
    name: "Steam 礼品卡",
    shortName: "Steam",
    badge: "Gift Card",
    subtitle: "Steam Wallet 礼品卡",
    description:
      "请先选择目标国家或地区，再选择该地区对应的固定面值。",
    accent: "from-[#0f172a] via-[#1e3a8a] to-[#0ea5e9]",
    image: "/steam-icon-logo.svg",
    deliveryText: "兑换码发送至邮箱",
    features: ["按国家显示规则", "仅支持固定面值", "兑换码发送至邮箱"],
    purchaseNote: "Steam 礼品卡仅支持固定面值，当前目录不提供美国区和加拿大区。",
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
