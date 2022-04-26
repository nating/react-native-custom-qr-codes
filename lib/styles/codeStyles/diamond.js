/*

diamond.js

This file exports a function for drawing a diamond centre piece for a QRCode

  --Geoff Natin 11/1/18 17:41

*/
import React from "react";
import { G, Rect } from "react-native-svg";

//Returns an SVG Element for a piece of the 'diamond' codeStyle
export function drawDiamondPiece(x, y, modules, pieceProperties, props) {
  var length = modules.length;
  var width = props.size;
  var height = props.size;
  var xsize = width / length;
  var ysize = height / length;
  var px = x * xsize;
  var py = y * ysize;
  return (
    <G x={px + xsize / 2} y={py + ysize / 2} width={xsize} height={ysize}>
      <Rect
        key={px + ":" + py}
        x={-xsize / 2}
        y={-ysize / 2}
        width={xsize}
        height={ysize}
        rotate={45}
        fill={props.color}
      />
    </G>
  );
}
