/*

QRCode.js

This is a Customisable QR Code Component for React Native Applications.

  --Geoff Natin 08/7/17 21:49

*/

import { Image, View } from "react-native";
//-----------------------------Imports-----------------------------------
import React, { PureComponent } from "react";
import Svg, {
  ClipPath,
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";

import PropTypes from "prop-types";
import { drawPiece } from "./styles";
import { generateQRCode } from "./QRCodeGenerator.js";
import styled from "../../styled-components";

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
    innerEyeStyle: PropTypes.oneOf([
      "circle",
      "circles",
      "diamond",
      "rounded",
      "square",
    ]),
    outerEyeStyle: PropTypes.oneOf([
      "circle",
      "circles",
      "diamond",
      "rounded",
      "square",
    ]),
    codeStyle: PropTypes.oneOf([
      "circle",
      "diamond",
      "dot",
      "ninja",
      "sharp",
      "square",
    ]),
    logo: PropTypes.oneOfType([Image.propTypes.source, PropTypes.string]),
    backgroundImage: Image.propTypes.source,
    logoSize: PropTypes.number,
    ecl: PropTypes.oneOf(["L", "M", "Q", "H"]),
    svg: PropTypes.any,
  };

  static defaultProps = {
    content: "No Content",
    size: 250,
    padding: 0,
    color: "black",
    gradientDirection: [0, 0, 170, 0],
    backgroundColor: "transparent",
    codeStyle: "square",
    outerEyeStyle: "square",
    innerEyeStyle: "square",
    logoSize: 100,
    ecl: "H",
  };

  //-----------------------Methods-----------------------

  //Returns an array of SVG Elements that represent the pieces of the QR Code
  getPieces() {
    var qr = generateQRCode(this.props);

    var modules = qr.qrcode.modules;

    var size = this.props.size;
    var length = modules.length;
    var xsize = size / length;
    var ysize = size / length;
    var logoX = this.props.size / 2 - this.props.logoSize / 2;
    var logoY = this.props.size / 2 - this.props.logoSize / 2;
    var logoSize = this.props.logoSize;

    var pieces = [];
    var nonPieces = [];

    this.length = length;
    this.ratio = xsize;

    //Add the SVG element of each piece in the body of the QR Code
    for (var y = 0; y < length; y++) {
      for (var x = 0; x < length; x++) {
        var module = modules[x][y];
        var px = x * xsize;
        var py = y * ysize;

        //TODO: Add function to compute if pieces overlap with circular logos (more complex. Must see if tl or br is inside the radius from the centre of the circle (pythagoras theorem?))
        var overlapsWithLogo =
          (px > logoX &&
            px < logoX + logoSize &&
            py > logoY &&
            py < logoY + logoSize) || //Piece's top left is inside the logo area
          (px + xsize > logoX &&
            px + xsize < logoX + logoSize &&
            py + ysize > logoY &&
            py + ysize < logoY + logoSize); //Piece's bottom right is inside the logo area

        if (!this.props.logo || (this.props.logo && !overlapsWithLogo)) {
          if (module) {
            pieces.push(this.getPiece(x, y, modules));
          } else {
            nonPieces.push(this.getPiece(x, y, modules));
          }
        }
      }
    }

    if (this.props.backgroundImage) {
      return (
        <View
          style={{
            backgroundColor: "transparent",
            margin: 0,
          }}
        >
          <Image
            source={this.props.backgroundImage}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: this.props.logoSize,
              width: this.props.logoSize,
            }}
          />
          {this.displayLogo()}
          <Svg
            style={{
              backgroundColor: "transparent",
              height: this.props.logoSize,
              width: this.props.logoSize,
            }}
          >
            <Defs>
              <ClipPath id="clip">{nonPieces}</ClipPath>
            </Defs>
            <Rect
              clipPath="url(#clip)"
              fill="transparent"
              x={0}
              y={0}
              height="100%"
              width="100%"
            />
          </Svg>
        </View>
      );
    } else if (this.props.linearGradient) {
      return (
        <View>
          <Svg
            style={{
              backgroundColor: this.props.backgroundColor,
              height: this.props.size,
              width: this.props.size,
            }}
          >
            <Defs>
              <ClipPath id="clip">{pieces}</ClipPath>
              <LinearGradient
                id="grad"
                x1={this.props.gradientDirection[0]}
                y1={this.props.gradientDirection[1]}
                x2={this.props.gradientDirection[2]}
                y2={this.props.gradientDirection[3]}
              >
                <Stop
                  offset="0"
                  stopColor={this.props.linearGradient[0]}
                  stopOpacity="1"
                />
                <Stop
                  offset="1"
                  stopColor={this.props.linearGradient[1]}
                  stopOpacity="1"
                />
              </LinearGradient>
            </Defs>
            <Rect
              clipPath="url(#clip)"
              fill="transparent"
              x={0}
              y={0}
              height="100%"
              width="100%"
              fill="url(#grad)"
            />
          </Svg>
          {this.displayLogo()}
        </View>
      );
    } else {
      return (
        <View>
          <Svg
            style={{
              backgroundColor: this.props.backgroundColor,
              height: this.props.size,
              width: this.props.size,
            }}
          >
            <Defs>
              <ClipPath id="clip">{pieces}</ClipPath>
            </Defs>
            <Rect
              clipPath="url(#clip)"
              fill="transparent"
              x={0}
              y={0}
              height="100%"
              width="100%"
              fill={this.props.color}
            />
          </Svg>
          {this.displayLogo()}
        </View>
      );
    }
  }

  //Renders the logo on top of the QR Code if there is one
  displayLogo() {
    if (this.props.logo && !this.props.svg) {
      return (
        <Image
          source={this.props.logo}
          style={{
            width: this.props.logoSize,
            height: this.props.logoSize,
            position: "absolute",
            left: this.props.size / 2 - this.props.logoSize / 2,
            top: this.props.size / 2 - this.props.logoSize / 2,
            borderRadius: 20,
          }}
        />
      );
    } else {
      return <View />;
    }
  }

  //Returns an SVG Element that represents the piece of the QR code at modules[x][y]
  getPiece(x, y, modules) {
    //Find out which piece type it is
    var pieceProps = this.getPieceProperties(x, y, modules);
    return drawPiece(x, y, modules, pieceProps, this.props);
  }

  //Returns an object with orientation and pieceType representation of the piece type. (See https://github.com/mpaolino/qrlib/tree/master/qrlib/static)
  getPieceProperties(x, y, modules) {
    var mod_matrix = {};
    mod_matrix.topLeft = x != 0 && y != 0 && modules[x - 1][y - 1];
    mod_matrix.top = y != 0 && modules[x][y - 1];
    mod_matrix.topRight =
      x != modules.length - 1 && y != 0 && modules[x + 1][y - 1];
    mod_matrix.left = x != 0 && modules[x - 1][y];
    mod_matrix.right = x != modules.length - 1 && modules[x + 1][y];
    mod_matrix.bottomLeft =
      x != 0 && y != modules.length - 1 && modules[x - 1][y + 1];
    mod_matrix.bottom = y != modules.length - 1 && modules[x][y + 1];
    mod_matrix.bottomRight =
      x != modules.length - 1 &&
      y != modules.length - 1 &&
      modules[x + 1][y + 1];

    //  (surroundingCount holds the number of pieces above or to the side of this piece)
    var surroundingCount = 0;
    if (mod_matrix.top) {
      surroundingCount++;
    }
    if (mod_matrix.left) {
      surroundingCount++;
    }
    if (mod_matrix.right) {
      surroundingCount++;
    }
    if (mod_matrix.bottom) {
      surroundingCount++;
    }

    var pieceProperties = {};
    var orientation = 0;

    //Determine what the piece properties are from its surrounding pieces.
    //  (surroundingCount holds the number of pieces above or to the side of this piece)
    //  (See https://github.com/mpaolino/qrlib/tree/master/qrlib/static)
    switch (surroundingCount) {
      case 0:
        pieceProperties.pieceType = "1a";
        if (mod_matrix.right) {
          orientation = 90;
        } else if (mod_matrix.bottom) {
          orientation = 180;
        } else if (mod_matrix.left) {
          orientation = 270;
        }
        pieceProperties.orientation = orientation;
        return pieceProperties;
      case 1:
        pieceProperties.pieceType = "2b";
        pieceProperties.orientation = 0;
        return pieceProperties;
      case 2:
        if (
          (mod_matrix.top && mod_matrix.bottom) ||
          (mod_matrix.left && mod_matrix.right)
        ) {
          var orientation = mod_matrix.top && mod_matrix.bottom ? 0 : 90;
          pieceProperties.pieceType = "1b3b";
          pieceProperties.orientation = orientation;
          return pieceProperties;
        } else {
          var orientation = 0;
          if (mod_matrix.top && mod_matrix.right) {
            pieceProperties.orientation = 90;
            pieceProperties.pieceType = mod_matrix.topRight ? "2a1b1a" : "2a1b";
            return pieceProperties;
          } else if (mod_matrix.right && mod_matrix.bottom) {
            pieceProperties.orientation = 180;
            pieceProperties.pieceType = mod_matrix.bottomRight
              ? "2a1b1a"
              : "2a1b";
            return pieceProperties;
          } else if (mod_matrix.left && mod_matrix.bottom) {
            pieceProperties.orientation = 270;
            pieceProperties.pieceType = mod_matrix.bottomLeft
              ? "2a1b1a"
              : "2a1b";
            return pieceProperties;
          } else {
            pieceProperties.pieceType = mod_matrix.topLeft ? "2a1b1a" : "2a1b";
            return pieceProperties;
          }
        }
      case 3:
        pieceProperties.pieceType = "2a1b2c";
        var orientation = 0;
        if (mod_matrix.top && mod_matrix.right && mod_matrix.bottom) {
          orientation = 90;
        } else if (mod_matrix.right && mod_matrix.bottom && mod_matrix.left) {
          orientation = 180;
        } else if (mod_matrix.bottom && mod_matrix.left && mod_matrix.top) {
          orientation = 270;
        }
        pieceProperties.orientation = orientation;
        return pieceProperties;
      case 4:
        pieceProperties.pieceType = "2a1b2c3b";
        pieceProperties.orientation = 0;
        return pieceProperties;
    }
  }

  //---------------------Rendering-----------------------

  render() {
    let pieces = this.getPieces();
    let eyeSize = 7 * this.ratio;
    let eyeCoords = [
      [0, 0], // top left
      [0, this.props.size - eyeSize], // bottom left
      [this.props.size - eyeSize, 0], // top right
    ];

    return (
      <View>
        <QRView size={this.props.size}>
          {pieces}
          {eyeCoords.map((eyeCoord, index) => (
            <Eyes
              key={index}
              outerEyeStyle={this.props.outerEyeStyle}
              innerEyeStyle={this.props.innerEyeStyle}
              size={eyeSize}
              color={this.props.color}
              x={eyeCoord[0]}
              y={eyeCoord[1]}
              ratio={this.ratio}
            />
          ))}
        </QRView>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              position: "absolute",
              backgroundColor: this.props.logo,
              height: 60,
              width: 60,
              borderRadius: 20,
            }}
          />
          {this.props.svg}
        </View>
      </View>
    );
  }
}

class Eyes extends React.Component {
  constructor(props) {
    super(props);
    this.size = this.props.size;
    this.ratio = this.props.ratio;

    /* XY coordinates (right-to-bottom) */
    this.x = this.props.x;
    this.y = this.props.y;

    this.outerEyeStyle = this.drawEyeStyle(this.props.outerEyeStyle, "outer");
    this.innerEyeStyle = this.drawEyeStyle(this.props.innerEyeStyle, "inner");

    this.color = this.props.color;

    /* innerEye variables */
    this.inSize = 3 * this.ratio;
    this.inX = this.ratio;
    this.inY = this.ratio;
  }

  drawEyeStyle(style, type) {
    if (type === "outer") {
      return ["diamond", "circles"].includes(style) ? null : style;
    }
    return ["diamond", "circles"].includes(style) ? null : style;
  }

  render() {
    return (
      <Container size={this.size}>
        <EyeShape
          type={this.outerEyeStyle}
          size={this.size}
          leftCornerX={this.x}
          leftCornerY={this.y}
          color={this.color}
          border
          borderWidth={this.ratio}
        >
          <EyeShape
            type={this.innerEyeStyle}
            size={this.inSize}
            leftCornerX={this.inX}
            leftCornerY={this.inY}
            color={this.color}
            borderWidth={this.ratio}
          />
        </EyeShape>
      </Container>
    );
  }
}

const EyeShape = styled.View`
  height: ${(props) => props.size}px;
  width: ${(props) => props.size}px;
  background-color: ${(props) =>
    props.border || !props.type ? "transparent" : props.color};
  top: ${(props) => props.leftCornerY}px;
  left: ${(props) => props.leftCornerX}px;
  border-radius: ${(props) => {
    switch (props.type) {
      case "circle":
        return props.size;
      case "rounded":
        return props.size / 5;
      default:
        return 0;
    }
  }}px;
  border-color: ${(props) =>
    props.border && props.type ? props.color : "transparent"};
  border-width: ${(props) => {
    if (!props.border) {
      return 0;
    }
    return props.borderWidth;
  }}px;
`;

const Container = styled.View`
  position: absolute;
  height: ${(props) => props.size}px;
  width: ${(props) => props.size}px;
`;

const QRView = styled.View`
  position: relative;
  height: ${(props) => props.size}px;
  width: ${(props) => props.size}px;
`;
