/*

square.js

This file exports a function for drawing a square outer eye piece for a QRCode

  --Geoff Natin 11/1/18 17:41

*/
import React, { Component } from "react";
import Svg, { Rect } from "react-native-svg";

//Returns an SVG Element for a piece of the 'square' outerEyeStyle
export function drawSquarePiece(x, y, modules, pieceProperties, props) {
  var length = modules.length;
  var width = props.size;
  var height = props.size;
  var xsize = width / length;
  var ysize = height / length;
  var px = x * xsize;
  var py = y * ysize;
  return (
    <Rect
      key={px + ":" + py}
      x={px}
      y={py}
      width={xsize}
      height={ysize}
      fill={props.color}
    />
  );
}
