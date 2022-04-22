/*

dot.js

This file exports a function for drawing a dot centre piece for a QRCode

  --Geoff Natin 11/1/18 17:41

*/
import React, { Component } from "react";
import Svg, { Circle } from "react-native-svg";

//Returns an SVG Element for a piece of the 'dot' codeStyle
export function drawDotPiece(x, y, modules, pieceProperties, props) {
  var length = modules.length;
  var width = props.size;
  var height = props.size;
  var xsize = width / length;
  var ysize = height / length;
  var px = x * xsize + xsize / 2;
  var py = y * ysize + ysize / 2;
  return (
    <Circle
      key={px + ":" + py}
      cx={px}
      cy={py}
      r={xsize / 3}
      fill={props.color}
    />
  );
}
