/*

index.js

This file exports a function for drawing the centre pieces of a QRCode

  --Geoff Natin 11/1/18 17:41

*/

import { drawSquarePiece } from './square';
import { drawCirclePiece } from './circle';
import { drawDotPiece } from './dot';
import { drawDiamondPiece } from './diamond';
import { drawSharpPiece } from './sharp';
import { drawNinjaPiece } from './ninja';

//Returns an SVG Element for a centre piece in the style of the codeStyle
export function drawCentrePiece(x,y,modules,pieceProperties,props){
    switch(props.codeStyle){
      case 'square':
        return drawSquarePiece(x,y,modules,pieceProperties,props);
      case 'circle':
        return drawCirclePiece(x,y,modules,pieceProperties,props);
      case 'dot':
        return drawDotPiece(x,y,modules,pieceProperties,props);
      case 'diamond':
        return drawDiamondPiece(x,y,modules,pieceProperties,props);
      case 'sharp':
        return drawSharpPiece(x,y,modules,pieceProperties,props);
      case 'ninja':
        return drawNinjaPiece(x,y,modules,pieceProperties,props);
      default:
        return drawSquarePiece(x,y,modules,pieceProperties,props);
    }
  }
