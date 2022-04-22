/*

sharp.js

This file exports a function for drawing a sharp centre piece for a QRCode

  --Geoff Natin 11/1/18 17:41

*/
import React, { Component } from "react";
import Svg, { Circle, Rect } from "react-native-svg";

//Returns an SVG Element for a piece of the 'sharp' codeStyle
export function drawSharpPiece(x, y, modules, pieceProperties, props) {
  var orientation = pieceProperties.orientation;
  var pieceType = pieceProperties.pieceType;
  var width = props.size;
  var height = props.size;
  var length = modules.length;
  var xsize = width / length;
  var ysize = height / length;
  var px = x * xsize;
  var py = y * ysize;

  // !!!! These aren't the proper paths yet
  var str = xsize + "," + 0 + " " + xsize + "," + ysize + " " + 0 + "," + ysize;
  var rotationStr = orientation + ", " + xsize / 2 + ", " + ysize / 2;

  switch (pieceType) {
    case "1a":
      return (
        <Circle
          key={px + ":" + py}
          cx={px + xsize / 2}
          cy={py + ysize / 2}
          r={xsize / 2}
          fill={props.color}
        />
      );
    case "2b":
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
    case "1b3b":
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
    case "2a1b":
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
    case "2a1b1a":
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
    case "2a1b2c":
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
    case "2a1b2c3b":
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
    default:
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
}
