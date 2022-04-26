import * as React from "react";

import { View } from "react-native";

//Returns an SVG Element for a piece of the 'circle' outerEyeStyle
export function drawNone(x, y, modules, pieceProperties, props) {
  return <View key={x + ":" + y} />;
}
