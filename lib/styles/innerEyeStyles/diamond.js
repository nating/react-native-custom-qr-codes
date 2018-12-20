/*

diamond.js

This file exports a function for drawing a diamond outer eye piece for a QRCode

  --Geoff Natin 11/1/18 17:41

*/
import React, { Component } from 'react';
import Svg, { Rect, G } from 'react-native-svg';

//Returns an SVG Element for a piece of the 'diamond' outerEyeStyle
export function drawDiamondPiece(x,y,modules,pieceProperties,props){
  var length = modules.length;
  var width = props.size;
  var height = props.size;
  var xsize = width / (length + 2 * props.padding);
  var ysize = height / (length + 2 * props.padding);
  var px = (x * xsize + props.padding * xsize);
  var py = (y * ysize + props.padding * ysize);
  return (<G x={px+xsize/2} y={py+ysize/2} width={xsize} height={ysize}><Rect key={px+':'+py} x={-xsize/2} y={-ysize/2} width={xsize} height={ysize} rotate={45} fill={props.color} /></G>);
}
