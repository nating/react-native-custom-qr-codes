/*

index.js

This file exports a function for drawing the inner eye pieces of a QRCode

  --Geoff Natin 11/1/18 17:41

*/

import { drawSquarePiece } from './square';
import { drawCirclePiece } from './circle';
import { drawDiamondPiece } from './diamond';

//Returns an SVG Element for an outer eye piece in the style of the innerEyeStyle
export function drawInnerEyePiece(x,y,modules,pieceProperties,props){
    switch(props.innerEyeStyle){
      case 'square':
        return drawSquarePiece(x,y,modules,pieceProperties,props);
      case 'circle':
        return drawCirclePiece(x,y,modules,pieceProperties,props);
      case 'diamond':
        return drawDiamondPiece(x,y,modules,pieceProperties,props);
      default:
        return drawSquarePiece(x,y,modules,pieceProperties,props);
    }
}
