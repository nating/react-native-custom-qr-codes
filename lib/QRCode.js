/*

QRCode.js

This is a Customisable QR Code Component for React Native Applications.

  --Geoff Natin 08/7/17 21:49

*/


//-----------------------------Imports-----------------------------------
import React, { PureComponent } from 'react';
import { View, Image, Text, Button } from 'react-native';
import PropTypes from 'prop-types';
import { generateQRCode } from './QRCodeGenerator.js';
import { drawPiece } from './styles';
import Svg, { Rect, Circle, Polygon, G, Path, Defs, ClipPath, LinearGradient, Stop } from 'react-native-svg';

//-----------------------------Component---------------------------------
export default class QRCode extends PureComponent {

//-----------------------Properties---------------------
  static propTypes = {
    content: PropTypes.string,
    size: PropTypes.number,
    padding: PropTypes.number,
    color: PropTypes.string,
    linearGradient: PropTypes.arrayOf(PropTypes.string),
    gradientDirection: PropTypes.arrayOf(PropTypes.number),
    backgroundColor: PropTypes.string,
    innerEyeStyle: PropTypes.oneOf(['square', 'circle','diamond']),
    outerEyeStyle: PropTypes.oneOf(['square', 'circle','diamond']),
    codeStyle: PropTypes.oneOf(['square', 'circle','diamond','dot','ninja','sharp']),
    logo: Image.propTypes.source,
    backgroundImage: Image.propTypes.source,
    logoSize: PropTypes.number,
    ecl: PropTypes.oneOf(['L', 'M', 'Q', 'H'])
  };

  static defaultProps = {
    content: "No Content",
    size: 250,
    padding: 1,
    color: 'black',
    gradientDirection:[0,0,170,0],
    backgroundColor: 'white',
    codeStyle: 'square',
    outerEyeStyle: 'square',
    innerEyeStyle: 'square',
    logoSize: 100,
    ecl: 'H'
  };

//-----------------------Methods-----------------------

  //Returns an array of SVG Elements that represent the pieces of the QR Code
   getPieces(){
     var qr = generateQRCode(this.props);

     var modules = qr.qrcode.modules;

     var size = this.props.size;
     var length = modules.length;
     var xsize = size / (length + 2 * this.props.padding);
     var ysize = size / (length + 2 * this.props.padding);
     var logoX = ((this.props.size/2)-(this.props.logoSize/2));
     var logoY = ((this.props.size/2)-(this.props.logoSize/2));
     var logoSize = this.props.logoSize;

     var pieces = [];
     var nonPieces = [];

     //Add the SVG element of each piece in the body of the QR Code
     for (var y = 0; y < length; y++) {
       for (var x = 0; x < length; x++) {
         var module = modules[x][y];
         var px = (x * xsize + this.props.padding * xsize);
         var py = (y * ysize + this.props.padding * ysize);

         //TODO: Add function to compute if pieces overlap with circular logos (more complex. Must see if tl or br is inside the radius from the centre of the circle (pythagoras theorem?))
         var overlapsWithLogo = (

           px>logoX && px<(logoX+logoSize) && py>logoY && py<(logoY+logoSize) ||//Piece's top left is inside the logo area
           (px+xsize)>logoX && (px+xsize)<(logoX+logoSize) && (py+ysize)>logoY && (py+ysize)<(logoY+logoSize)//Piece's bottom right is inside the logo area

         );

         if(!this.props.logo || (this.props.logo && !overlapsWithLogo)){

           if (module) {
             pieces.push(this.getPiece(x,y,modules));
           }
           else{
             nonPieces.push(this.getPiece(x,y,modules));
           }
         }
       }
     }

     if(this.props.backgroundImage){
       return (
          <View style={{backgroundColor:'white',margin:this.props.padding*xsize}}>
            <Image source={this.props.backgroundImage} style={{position:'absolute',top:(this.props.padding*ysize),left:(this.props.padding*xsize),height:(this.props.size-this.props.padding*2*ysize),width:(this.props.size-this.props.padding*2*xsize)}}/>
            {this.displayLogo()}
             <Svg style={{backgroundColor:'transparent',height:this.props.size,width:this.props.size}}>
              <Defs>
                <ClipPath id="clip">
                  {nonPieces}
                </ClipPath>
              </Defs>
                 <Rect clipPath="url(#clip)" fill='white' x={0} y={0} height='100%' width='100%'/>
             </Svg>
          </View>
       );
     }
     else if(this.props.linearGradient){
       return (
         <View>
           <Svg style={{backgroundColor:this.props.backgroundColor,height:this.props.size,width:this.props.size}}>
            <Defs>
              <ClipPath id="clip">
                {pieces}
              </ClipPath>
              <LinearGradient id="grad" x1={this.props.gradientDirection[0]} y1={this.props.gradientDirection[1]} x2={this.props.gradientDirection[2]} y2={this.props.gradientDirection[3]}>
                  <Stop offset="0" stopColor={this.props.linearGradient[0]} stopOpacity="1" />
                  <Stop offset="1" stopColor={this.props.linearGradient[1]} stopOpacity="1" />
              </LinearGradient>
            </Defs>
               <Rect clipPath="url(#clip)" fill='white' x={0} y={0} height='100%' width='100%' fill='url(#grad)'/>
           </Svg>
             {this.displayLogo()}
         </View>
       );
     }
     else{
       return (
         <View>
           <Svg style={{backgroundColor:this.props.backgroundColor,height:this.props.size,width:this.props.size}}>
            <Defs>
              <ClipPath id="clip">
                {pieces}
              </ClipPath>
            </Defs>
               <Rect clipPath="url(#clip)" fill='white' x={0} y={0} height='100%' width='100%' fill={this.props.color}/>
           </Svg>
             {this.displayLogo()}
         </View>
       );
     }
   }

   //Renders the logo on top of the QR Code if there is one
   displayLogo(){
     if(this.props.logo){
       return(
          <Image source={this.props.logo} style={{width: this.props.logoSize, height: this.props.logoSize, position: 'absolute', left: ((this.props.size/2)-(this.props.logoSize/2)), top: ((this.props.size/2)-(this.props.logoSize/2))}}/>
       );
     }
     else{
       return (<View/>);
     }
   }

   //Returns an SVG Element that represents the piece of the QR code at modules[x][y]
   getPiece(x,y,modules){

     //Find out which piece type it is
     var pieceProps = this.getPieceProperties(x,y,modules);
     return drawPiece(x,y,modules,pieceProps,this.props);

   }

    //Returns an object with orientation and pieceType representation of the piece type. (See https://github.com/mpaolino/qrlib/tree/master/qrlib/static)
    getPieceProperties(x,y,modules){
      var mod_matrix = {};
      mod_matrix.topLeft = (x!=0 && y!=0 && modules[x-1][y-1]);
      mod_matrix.top = (y!=0 && modules[x][y-1]);
      mod_matrix.topRight = (x!=modules.length-1 && y!=0 && modules[x+1][y-1]);
      mod_matrix.left = (x!=0 && modules[x-1][y]);
      mod_matrix.right = (x!=modules.length-1 && modules[x+1][y]);
      mod_matrix.bottomLeft = (x!=0 && y!=modules.length-1 && modules[x-1][y+1]);
      mod_matrix.bottom = (y!=modules.length-1 && modules[x][y+1]);
      mod_matrix.bottomRight = (x!=modules.length-1 && y!=modules.length-1 && modules[x+1][y+1]);

      //  (surroundingCount holds the number of pieces above or to the side of this piece)
      var surroundingCount = 0;
      if(mod_matrix.top){surroundingCount++;}
      if(mod_matrix.left){surroundingCount++;}
      if(mod_matrix.right){surroundingCount++;}
      if(mod_matrix.bottom){surroundingCount++;}

      var pieceProperties = {};
      var orientation = 0;

      //Determine what the piece properties are from its surrounding pieces.
      //  (surroundingCount holds the number of pieces above or to the side of this piece)
      //  (See https://github.com/mpaolino/qrlib/tree/master/qrlib/static)
      switch(surroundingCount){
        case 0:
          pieceProperties.pieceType = '1a';
          if(mod_matrix.right){orientation=90;}
          else if(mod_matrix.bottom){orientation=180;}
          else if(mod_matrix.left){orientation=270;}
          pieceProperties.orientation = orientation;
          return pieceProperties;
        case 1:
          pieceProperties.pieceType = '2b';
          pieceProperties.orientation = 0;
          return pieceProperties;
        case 2:
          if( (mod_matrix.top && mod_matrix.bottom) || (mod_matrix.left && mod_matrix.right) ){
            var orientation = (mod_matrix.top && mod_matrix.bottom) ? 0 : 90;
            pieceProperties.pieceType = '1b3b';
            pieceProperties.orientation = orientation;
            return pieceProperties;
          }
          else{
            var orientation = 0;
            if(mod_matrix.top && mod_matrix.right){pieceProperties.orientation=90; pieceProperties.pieceType = mod_matrix.topRight ? '2a1b1a' : '2a1b'; return pieceProperties;}
            else if(mod_matrix.right && mod_matrix.bottom){pieceProperties.orientation=180; pieceProperties.pieceType = mod_matrix.bottomRight ? '2a1b1a' : '2a1b'; return pieceProperties;}
            else if(mod_matrix.left && mod_matrix.bottom){pieceProperties.orientation=270; pieceProperties.pieceType = mod_matrix.bottomLeft ? '2a1b1a' : '2a1b'; return pieceProperties;}
            else{ pieceProperties.pieceType = mod_matrix.topLeft ? '2a1b1a' : '2a1b'; return pieceProperties;}
          }
        case 3:
          pieceProperties.pieceType = '2a1b2c';
          var orientation = 0;
          if(mod_matrix.top && mod_matrix.right && mod_matrix.bottom){orientation=90;}
          else if(mod_matrix.right && mod_matrix.bottom && mod_matrix.left){orientation=180;}
          else if(mod_matrix.bottom && mod_matrix.left && mod_matrix.top){orientation=270;}
          pieceProperties.orientation = orientation;
          return pieceProperties;
        case 4:
          pieceProperties.pieceType = '2a1b2c3b';
          pieceProperties.orientation = 0;
          return pieceProperties;
      }
    }

  //---------------------Rendering-----------------------

    render () {
        return this.getPieces();
    }
}
