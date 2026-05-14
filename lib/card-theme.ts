export type CardTheme = {
  gradient: string
  glowA: string
  glowB: string
  overlayHighlight: string
  panelGradient: string
  statsBackground: string
  logoPanelBackground: string
  logoPanelBorder: string
  logoFilter: string
}

const CARD_THEMES: Record<string, CardTheme> = {
  visa: {
    gradient: "linear-gradient(135deg, #0f3fb3 0%, #1c60f2 48%, #66a1ff 100%)",
    glowA: "rgba(125, 211, 252, 0.32)",
    glowB: "rgba(191, 219, 254, 0.18)",
    overlayHighlight:
      "radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)",
    panelGradient: "linear-gradient(145deg, rgba(255,255,255,0.20), rgba(191,219,254,0.10))",
    statsBackground: "rgba(8, 47, 73, 0.18)",
    logoPanelBackground: "linear-gradient(145deg, rgba(255,255,255,0.30), rgba(219,234,254,0.16))",
    logoPanelBorder: "rgba(255,255,255,0.34)",
    logoFilter: "drop-shadow(0 0 18px rgba(255,255,255,0.12)) drop-shadow(0 12px 26px rgba(15,23,42,0.20))",
  },
  mastercard: {
    gradient: "linear-gradient(135deg, #111111 0%, #2d2d2d 45%, #575757 100%)",
    glowA: "rgba(253, 186, 116, 0.22)",
    glowB: "rgba(254, 202, 202, 0.16)",
    overlayHighlight:
      "radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)",
    panelGradient: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(254,215,170,0.08))",
    statsBackground: "rgba(0, 0, 0, 0.18)",
    logoPanelBackground: "linear-gradient(145deg, rgba(255,255,255,0.30), rgba(255,237,213,0.16))",
    logoPanelBorder: "rgba(255,255,255,0.34)",
    logoFilter: "drop-shadow(0 12px 26px rgba(15,23,42,0.20))",
  },
  "apple-gift-card": {
    gradient: "linear-gradient(135deg, #111827 0%, #374151 50%, #9ca3af 100%)",
    glowA: "rgba(226, 232, 240, 0.18)",
    glowB: "rgba(244, 244, 245, 0.14)",
    overlayHighlight:
      "radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)",
    panelGradient: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(226,232,240,0.08))",
    statsBackground: "rgba(15, 23, 42, 0.16)",
    logoPanelBackground: "linear-gradient(145deg, rgba(255,255,255,0.22), rgba(226,232,240,0.10))",
    logoPanelBorder: "rgba(255,255,255,0.24)",
    logoFilter: "drop-shadow(0 0 14px rgba(255,255,255,0.10)) drop-shadow(0 12px 24px rgba(15,23,42,0.22))",
  },
  "google-play": {
    gradient: "linear-gradient(135deg, #14532d 0%, #16a34a 48%, #86efac 100%)",
    glowA: "rgba(190, 242, 100, 0.24)",
    glowB: "rgba(209, 250, 229, 0.16)",
    overlayHighlight:
      "radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)",
    panelGradient: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(190,242,100,0.10))",
    statsBackground: "rgba(6, 78, 59, 0.18)",
    logoPanelBackground: "linear-gradient(145deg, rgba(255,255,255,0.26), rgba(236,253,245,0.14))",
    logoPanelBorder: "rgba(255,255,255,0.30)",
    logoFilter: "drop-shadow(0 0 18px rgba(255,255,255,0.12)) drop-shadow(0 12px 26px rgba(15,23,42,0.18))",
  },
  xbox: {
    gradient: "linear-gradient(135deg, #0f1720 0%, #1a2b22 42%, #2f8f4d 100%)",
    glowA: "rgba(110, 231, 183, 0.18)",
    glowB: "rgba(187, 247, 208, 0.14)",
    overlayHighlight:
      "radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)",
    panelGradient: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(190,242,100,0.10))",
    statsBackground: "rgba(20, 83, 45, 0.18)",
    logoPanelBackground: "linear-gradient(145deg, rgba(9,24,16,0.52), rgba(18,52,34,0.40))",
    logoPanelBorder: "rgba(255,255,255,0.18)",
    logoFilter: "brightness(1.08) saturate(1.08) drop-shadow(0 0 14px rgba(255,255,255,0.08)) drop-shadow(0 12px 28px rgba(0,0,0,0.30))",
  },
  amazon: {
    gradient: "linear-gradient(135deg, #111827 0%, #1f2937 46%, #f59e0b 100%)",
    glowA: "rgba(0, 0, 0, 0)",
    glowB: "rgba(0, 0, 0, 0)",
    overlayHighlight: "none",
    panelGradient: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(253,230,138,0.10))",
    statsBackground: "rgba(15, 23, 42, 0.18)",
    logoPanelBackground: "linear-gradient(145deg, rgba(255,255,255,0.28), rgba(255,237,213,0.14))",
    logoPanelBorder: "rgba(255,255,255,0.30)",
    logoFilter: "drop-shadow(0 0 14px rgba(255,255,255,0.08)) drop-shadow(0 12px 26px rgba(15,23,42,0.22))",
  },
  ebay: {
    gradient: "linear-gradient(135deg, #0f172a 0%, #334155 44%, #3b82f6 100%)",
    glowA: "rgba(191, 219, 254, 0.18)",
    glowB: "rgba(254, 240, 138, 0.10)",
    overlayHighlight:
      "radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)",
    panelGradient: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(254,240,138,0.10))",
    statsBackground: "rgba(15, 23, 42, 0.16)",
    logoPanelBackground: "linear-gradient(145deg, rgba(255,248,235,0.34), rgba(255,255,255,0.16))",
    logoPanelBorder: "rgba(255,255,255,0.32)",
    logoFilter: "drop-shadow(0 12px 26px rgba(15,23,42,0.18))",
  },
  nintendo: {
    gradient: "linear-gradient(135deg, #111827 0%, #374151 46%, #94a3b8 100%)",
    glowA: "rgba(226, 232, 240, 0.18)",
    glowB: "rgba(255, 255, 255, 0.10)",
    overlayHighlight:
      "radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)",
    panelGradient: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(254,205,211,0.10))",
    statsBackground: "rgba(15, 23, 42, 0.18)",
    logoPanelBackground: "linear-gradient(145deg, rgba(255,245,245,0.30), rgba(254,226,226,0.14))",
    logoPanelBorder: "rgba(255,255,255,0.30)",
    logoFilter: "drop-shadow(0 0 18px rgba(255,255,255,0.10)) drop-shadow(0 12px 26px rgba(15,23,42,0.18))",
  },
  paypal: {
    gradient: "linear-gradient(135deg, #003087 0%, #0070ba 52%, #00a1e0 100%)",
    glowA: "rgba(125, 211, 252, 0.28)",
    glowB: "rgba(224, 242, 254, 0.18)",
    overlayHighlight:
      "radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)",
    panelGradient: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(125,211,252,0.10))",
    statsBackground: "rgba(12, 74, 110, 0.18)",
    logoPanelBackground: "linear-gradient(145deg, rgba(255,255,255,0.30), rgba(224,242,254,0.16))",
    logoPanelBorder: "rgba(255,255,255,0.34)",
    logoFilter: "drop-shadow(0 0 18px rgba(255,255,255,0.12)) drop-shadow(0 12px 26px rgba(15,23,42,0.18))",
  },
  playstation: {
    gradient: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 48%, #60a5fa 100%)",
    glowA: "rgba(191, 219, 254, 0.24)",
    glowB: "rgba(224, 231, 255, 0.16)",
    overlayHighlight:
      "radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)",
    panelGradient: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(191,219,254,0.10))",
    statsBackground: "rgba(30, 58, 138, 0.18)",
    logoPanelBackground: "linear-gradient(145deg, rgba(255,255,255,0.32), rgba(219,234,254,0.16))",
    logoPanelBorder: "rgba(255,255,255,0.34)",
    logoFilter: "drop-shadow(0 0 18px rgba(255,255,255,0.12)) drop-shadow(0 12px 26px rgba(15,23,42,0.18))",
  },
  roblox: {
    gradient: "linear-gradient(135deg, #111111 0%, #3f3f46 50%, #a1a1aa 100%)",
    glowA: "rgba(228, 228, 231, 0.18)",
    glowB: "rgba(255, 255, 255, 0.12)",
    overlayHighlight:
      "radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)",
    panelGradient: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(228,228,231,0.08))",
    statsBackground: "rgba(0, 0, 0, 0.18)",
    logoPanelBackground: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(228,228,231,0.10))",
    logoPanelBorder: "rgba(255,255,255,0.24)",
    logoFilter: "drop-shadow(0 0 14px rgba(255,255,255,0.08)) drop-shadow(0 12px 26px rgba(15,23,42,0.20))",
  },
  spotify: {
    gradient: "linear-gradient(135deg, #0f1211 0%, #17201a 40%, #18984a 100%)",
    glowA: "rgba(74, 222, 128, 0.16)",
    glowB: "rgba(187, 247, 208, 0.12)",
    overlayHighlight:
      "radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)",
    panelGradient: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(187,247,208,0.10))",
    statsBackground: "rgba(20, 83, 45, 0.18)",
    logoPanelBackground: "linear-gradient(145deg, rgba(7,18,12,0.54), rgba(18,40,27,0.40))",
    logoPanelBorder: "rgba(255,255,255,0.18)",
    logoFilter: "brightness(1.06) saturate(1.08) drop-shadow(0 0 14px rgba(255,255,255,0.08)) drop-shadow(0 12px 28px rgba(0,0,0,0.32))",
  },
  steam: {
    gradient: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 48%, #0ea5e9 100%)",
    glowA: "rgba(186, 230, 253, 0.24)",
    glowB: "rgba(191, 219, 254, 0.16)",
    overlayHighlight:
      "radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)",
    panelGradient: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(186,230,253,0.10))",
    statsBackground: "rgba(15, 23, 42, 0.18)",
    logoPanelBackground: "linear-gradient(145deg, rgba(255,255,255,0.28), rgba(224,242,254,0.12))",
    logoPanelBorder: "rgba(255,255,255,0.30)",
    logoFilter: "drop-shadow(0 0 18px rgba(255,255,255,0.12)) drop-shadow(0 12px 26px rgba(15,23,42,0.20))",
  },
}

const FALLBACK_THEME: CardTheme = {
  gradient: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 50%, #60a5fa 100%)",
  glowA: "rgba(125, 211, 252, 0.28)",
  glowB: "rgba(255, 255, 255, 0.16)",
  overlayHighlight:
    "radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)",
  panelGradient: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))",
  statsBackground: "rgba(15, 23, 42, 0.16)",
  logoPanelBackground: "linear-gradient(145deg, rgba(255,255,255,0.26), rgba(219,234,254,0.12))",
  logoPanelBorder: "rgba(255,255,255,0.30)",
  logoFilter: "drop-shadow(0 0 16px rgba(255,255,255,0.10)) drop-shadow(0 12px 24px rgba(15,23,42,0.18))",
}

export function getCardTheme(productId: string): CardTheme {
  return CARD_THEMES[productId] ?? FALLBACK_THEME
}
