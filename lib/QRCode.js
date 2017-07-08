/*

QRCode.js

This is a QR Component for React Native Applications.

  --Geoff Natin 08/7/17 21:49

*/


//-----------------------------Imports-----------------------------------
import React, { Component, PropTypes } from 'react'
import { View, Image } from 'react-native';
import generateQRCode from './QRCodeGenerator';

//-----------------------------Component---------------------------------
export default class QRCode extends Component {

//-----------------------Properties---------------------
  static propTypes = {
    content: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    padding: PropTypes.number,
    color: PropTypes.string,
    backgroundColor: PropTypes.string,
    logo: Image.propTypes.source,
    logoSize: PropTypes.number,
    ecl: PropTypes.oneOf(['L', 'M', 'Q', 'H'])
  };

  static defaultProps = {
    content: 'Somebody forgot to put "content" in this QR Code!',
    width: 100,
    size: 100,
    color: 'black',
    backgroundColor: 'white',
    logoSize: 25,
    ecl: 'H'
  };

//---------------------Constructor---------------------
   constructor(props) {
      super();
   }

//-----------------------Methods-----------------------



//---------------------Rendering-----------------------
  //This component is made up of a view with an SVG of a QR Code, and optionally
  //  a logo rendered on top of it.
  render () {
    return (
      <View>
        {generateQRCode(this.props)}
        {if(this.logo){
          <Image src={this.logo} style={{width: this.logoSize, height: this.logoSize, position: 'absolute', left: ((this.size/2)-(logoSize/2)), top: ((this.size/2)-(logoSize/2))}}/>
        }}
      </View>
    )
  }
}
