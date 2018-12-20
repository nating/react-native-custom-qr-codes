/*

square.js

This file exports a function for drawing a square centre piece for a QRCode

  --Geoff Natin 11/1/18 17:41

*/
import React, { Component } from 'react';
import Svg, { Rect } from 'react-native-svg';

//Returns an SVG Element for a piece of the 'square' codeStyle
export function drawSquarePiece(x,y,modules,pieceProperties,props){
  var length = modules.length;
  var width = props.size;
  var height = props.size;
  var xsize = width / (length + 2 * props.padding);
  var ysize = height / (length + 2 * props.padding);
  var px = (x * xsize + props.padding * xsize);
  var py = (y * ysize + props.padding * ysize);
  return (<Rect key={px+':'+py} x={px} y={py} width={xsize} height={ysize} fill={props.color}/>);
}
