/*

index.js

This file exports a function for drawing a piece for a QRCode

  --Geoff Natin 11/1/18 17:41

*/

import { drawOuterEyePiece } from './outerEyeStyles';
import { drawInnerEyePiece } from './innerEyeStyles';
import { drawCentrePiece } from './codeStyles';

//Returns an SVG Element for a piece in the style of the codeStyle
export function drawPiece(x,y,modules,pieceProperties,props){

  //Check the QR Code the piece is a part of: Centre, Inner Eye, or Outer Eye
  var length = modules.length;

  if( //If in the corners of the QR Code
     (x<7 && y<7) ||
     (x<7 && (length-y)<8) ||
     ((length-x)<8 && y<7)
  ){
    if(//If part of the Outer Eye
        x==0 ||
        y==0 ||
        x==6 ||
        y==6 ||
        x==(length-1) ||
        y==(length-1) ||
        (length-y)==7 ||
        (length-x)==7
    ){
      return drawOuterEyePiece(x,y,modules,pieceProperties,props);
    }
    else{//If part of Inner Eye
      return drawInnerEyePiece(x,y,modules,pieceProperties,props);
    }
  }
  else{
   return drawCentrePiece(x,y,modules,pieceProperties,props);
  }
}
