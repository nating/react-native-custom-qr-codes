import { ColorValue, ImageProps } from "react-native";

export function QRCode({
  content,
  size,
  padding,
  color,
  gradientDirection,
  backgroundColor,
  codeStyle,
  outerEyeStyle,
  innerEyeStyle,
  logoSize,
  ecl,
}: {
  content?: string;
  size?: number;
  padding?: number;
  color?: string;
  linearGradient?: Array<ColorValue>;
  gradientDirection?: Array<number>;
  backgroundColor?: string;
  innerEyeStyle?: "circle" | "circles" | "diamond" | "rounded" | "square";
  outerEyeStyle?: "circle" | "circles" | "diamond" | "rounded" | "square";
  codeStyle?: "circle" | "diamond" | "dot" | "ninja" | "sharp" | "square";
  logo?: ImageProps["source"] | string;
  backgroundImage?: ImageProps["source"];
  logoSize?: number;
  ecl?: "L" | "M" | "Q" | "H";
  svg?: any;
  isRTL?: boolean;
});
