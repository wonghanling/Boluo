/**
 * 品牌分组：严格按 Rewarble 站上的分类划分，不混在一起。
 * 顺序就是页面上展示的顺序。
 */

export type BrandGroupId =
  | "popular"
  | "topup"
  | "rewarble-card"
  | "game-card"
  | "gift-card"
  | "payment-voucher"

export type BrandGroup = {
  id: BrandGroupId
  title: string
  subtitle: string
  /** 品牌 slug，顺序即展示顺序 */
  brands: string[]
}

export const BRAND_GROUPS: BrandGroup[] = [
  {
    id: "popular",
    title: "热门推荐",
    subtitle: "卖得最多的几种，新手从这里选",
    brands: [
      "steam",
      "rewarble",
      "paypal",
      "amazon",
      "venmo",
      "rewarble-revolut",
      "visa",
    ],
  },
  {
    id: "topup",
    title: "账户充值",
    subtitle: "充进你已有的钱包或支付账户，只需提供账户 ID",
    brands: [
      "rewarble",
      "paypal",
      "venmo",
      "rewarble-revolut",
      "rewarble-wise",
      "skrill",
      "rewarble-crypto",
      "advcash",
      "rewarble-luxon-pay",
      "astropay",
      "volet",
      "payz",
      "paysera",
      "webmoney",
      "neteller",
    ],
  },
  {
    id: "rewarble-card",
    title: "Rewarble 虚拟卡",
    subtitle: "兑换后开一张虚拟 Visa / Mastercard，全球网购和订阅都能用",
    brands: [
      "visa",
      "mastercard",
      "rewarble-chatgpt",
      "rewarble-midjourney",
      "rewarble-temu",
      "rewarble-aliexpress",
      "rewarble-facebook-ads",
      "rewarble-discord",
      "rewarble-fiverr",
      "rewarble-buymeacoffee",
      "rewarble-patreon",
    ],
  },
  {
    id: "game-card",
    title: "游戏卡",
    subtitle: "各大游戏平台的点数、订阅和游戏内货币",
    brands: [
      "steam",
      "playstation",
      "xbox",
      "nintendo",
      "blizzard",
      "roblox",
      "freefire",
      "pubg",
      "riot-games",
      "mobile-legends",
      "fortnite",
      "world-of-warcraft",
      "ea",
      "nexon",
      "imvu",
    ],
  },
  {
    id: "payment-voucher",
    title: "支付券",
    subtitle: "可在提供商平台上兑换的虚拟卡和数字服务积分代金券",
    brands: [
      "paysafecard",
      "neosurf",
      "flexepin",
      "cashlib",
      "transcash",
      "pcs",
      "cashtocode",
      "mifinity",
      "bitsa",
      "aircash",
      "cryptovoucher",
      "giftmecrypto",
    ],
  },
  {
    id: "gift-card",
    title: "礼品卡",
    subtitle: "各大商店、流媒体和网络平台的官方礼品卡，直接在品牌内兑换",
    brands: [
      "apple-gift-card",
      "google-play",
      "amazon",
      "netflix",
      "disney",
      "razer",
      "twitch",
      "uber",
      "airbnb",
      "walmart",
      "target",
      "etsy",
      "zalando",
      "sephora",
      "douglas",
      "eneba",
      "bol-com",
      "doordash",
      "justeat",
      "deliveroo",
      "takeaway",
      "lieferando",
      "thuisbezorgd",
    ],
  },
]
