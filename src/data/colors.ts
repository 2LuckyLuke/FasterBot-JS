import type { HexColorString } from "discord.js";

// single source of truth for /setcolor: the runtime reads hex values from here
// and deploy-commands generates the slash-command choices from the same object
export const customColors = {
  user: { label: "Standard User", hex: "#c98577" },
  navy: { label: "Navy Blue", hex: "#000080" },
  blue: { label: "Blue", hex: "#0000FF" },
  aqua: { label: "Aqua Blue", hex: "#00FFFF" },
  cyan: { label: "Cyan Blue", hex: "#008080" },
  darkblue: { label: "Dark Blue", hex: "#00008B" },
  lavender: { label: "Lavender", hex: "#E6E6FA" },
  purple: { label: "Purple", hex: "#800080" },
  darkpurple: { label: "Dark Purple", hex: "#301934" },
  magenta: { label: "Magenta", hex: "#ff0092" },
  pink: { label: "Pink", hex: "#dd02fa" },
  red: { label: "Red", hex: "#ff0000" },
  darkred: { label: "Dark Red", hex: "#8B0000" },
  wine: { label: "Wine Red", hex: "#722F37" },
  cherry: { label: "Cherry Red", hex: "#D2042D" },
  orange: { label: "Orange", hex: "#ff8800" },
  yellow: { label: "Yellow", hex: "#FFFF00" },
  maroon: { label: "Maroon Brown", hex: "#800000" },
  olive: { label: "Olive Green", hex: "#808000" },
  green: { label: "Green", hex: "#008000" },
  jade: { label: "Jade Green", hex: "#00A36C" },
  lime: { label: "Lime Green", hex: "#00FF00" },
  black: { label: "Black", hex: "#000000" },
  gray: { label: "Gray", hex: "#808080" },
  white: { label: "White", hex: "#FFFFFF" },
} as const satisfies Record<string, { label: string; hex: HexColorString }>;

export type CustomColor = keyof typeof customColors;

export function isCustomColor(value: string): value is CustomColor {
  return value in customColors;
}
