import { RELOGRADE_BRAND_LIST, RELOGRADE_BRAND_MAP, type RelogradeBrandMeta } from "./brand-list"

export { RELOGRADE_BRAND_LIST, RELOGRADE_BRAND_MAP }
export type { RelogradeBrandMeta }

export const REGION_LABELS: Record<string, string> = {
  ae: "阿联酋",
  ar: "阿根廷",
  at: "奥地利",
  au: "澳大利亚",
  be: "比利时",
  br: "巴西",
  ca: "加拿大",
  ch: "瑞士",
  cl: "智利",
  co: "哥伦比亚",
  cz: "捷克",
  de: "德国",
  dk: "丹麦",
  ee: "爱沙尼亚",
  eg: "埃及",
  es: "西班牙",
  fi: "芬兰",
  fr: "法国",
  gb: "英国",
  gr: "希腊",
  hk: "香港",
  hu: "匈牙利",
  id: "印尼",
  ie: "爱尔兰",
  il: "以色列",
  in: "印度",
  it: "意大利",
  jp: "日本",
  kr: "韩国",
  lt: "立陶宛",
  lu: "卢森堡",
  lv: "拉脱维亚",
  ma: "摩洛哥",
  mx: "墨西哥",
  my: "马来西亚",
  ng: "尼日利亚",
  nl: "荷兰",
  no: "挪威",
  nz: "新西兰",
  pe: "秘鲁",
  ph: "菲律宾",
  pl: "波兰",
  pt: "葡萄牙",
  qa: "卡塔尔",
  ro: "罗马尼亚",
  ru: "俄罗斯",
  sa: "沙特",
  se: "瑞典",
  sg: "新加坡",
  sk: "斯洛伐克",
  th: "泰国",
  tr: "土耳其",
  tw: "台湾",
  ua: "乌克兰",
  us: "美国",
  vn: "越南",
  za: "南非",
  ww: "全球",
}

/** 币种中文名，Steam 这类按币种锁定的品牌用 */
export const CURRENCY_LABELS: Record<string, string> = {
  USD: "美元",
  EUR: "欧元",
  GBP: "英镑",
  AUD: "澳元",
  CAD: "加元",
  CHF: "瑞士法郎",
  SEK: "瑞典克朗",
  PLN: "波兰兹罗提",
  TRY: "土耳其里拉",
  BRL: "巴西雷亚尔",
  MXN: "墨西哥比索",
  INR: "印度卢比",
  JPY: "日元",
  KRW: "韩元",
  HKD: "港币",
  TWD: "新台币",
  SGD: "新加坡元",
  THB: "泰铢",
  PHP: "菲律宾比索",
  MYR: "马来西亚林吉特",
  VND: "越南盾",
  IDR: "印尼卢比",
  AED: "阿联酋迪拉姆",
  SAR: "沙特里亚尔",
  ZAR: "南非兰特",
  NZD: "新西兰元",
  CZK: "捷克克朗",
  NOK: "挪威克朗",
  DKK: "丹麦克朗",
}

export type RelogradeBrandId = string

export function isRelogradeBrand(id: string): boolean {
  return Boolean(id) && id in RELOGRADE_BRAND_MAP
}

export function getBrandMeta(id: string): RelogradeBrandMeta | null {
  return RELOGRADE_BRAND_MAP[id] || null
}

export function formatRegionLabel(code: string) {
  const region = (code || "").toLowerCase()
  // Amazon 这类 redeemType=service 的，redeemValue 是 amazon.com 这种域名
  if (region.includes(".")) return region
  const zh = REGION_LABELS[region]
  return zh ? `${zh} / ${region.toUpperCase()}` : region.toUpperCase()
}

export function formatCurrencyLabel(code: string) {
  const cur = (code || "").toUpperCase()
  const zh = CURRENCY_LABELS[cur]
  return zh ? `${cur} ${zh}` : cur
}
