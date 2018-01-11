

<p align="center">
  <img alt="example-qr-code-1" src="./assets/qr-code-1.png" width="250">
  <img alt="react-native-custom-qr-codes" src="./assets/qr-code-2.png" width="250">
  <img alt="example-qr-code-3" src="./assets/qr-code-3.png" width="250">
</p>

<p align="center">
  Customisable QR Codes for React Native.
</p>

<!---
<p align="center">
  <a href="http://standardjs.com/"><img alt="JavaScript Style Guide" src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square"></a>
  <a href="https://npmjs.org/package/react-native-swiper"><img alt="npm version" src="http://img.shields.io/npm/v/react-native-swiper.svg?style=flat-square"></a>
  <a href="https://npmjs.org/package/react-native-swiper"><img alt="npm version" src="http://img.shields.io/npm/dm/react-native-swiper.svg?style=flat-square"></a>
  <a href="https://github.com/leecade/react-native-swiper/pulls?q=is%3Apr+is%3Aclosed"><img alt="PR Stats" src="https://img.shields.io/issuestats/i/github/leecade/react-native-swiper.svg?style=flat-square"></a>
  <a href="https://github.com/leecade/react-native-swiper/issues?q=is%3Aissue+is%3Aclosed"><img alt="Issue Stats" src="https://img.shields.io/issuestats/p/github/leecade/react-native-swiper.svg?style=flat-square"></a>
  <a href="https://gitter.im/leecade/react-native-swiper?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge"><img alt="Join the chat" src="https://badges.gitter.im/leecade/react-native-swiper.svg"></a>
</p>
--->

# react-native-custom-qr-codes (Under Development)

### TODO:
- [x] Implement QR Code generation algorithm
- [x] Create component
- [x] Implement properties for the component
- [x] Create first few standard designs
- [x] Test every potential usage
- [x] Create design file standard
- [x] Document usage
- [x] Pimp out README.md
- [ ] Create Project Files
- [ ] Write code contribution guide
- [ ] Write up design contribution guide
- [ ] Upload the package to npm

## Installation

.

## Usage


```jsx
import QRCode from 'react-native-custom-qr-codes';

<QRCode content='https://reactnative.com'/>
```

### Properties

| Prop | Description | Default |
|---|---|---|
|**`content`**|The String to be encoded in the QR code. |`'No Content'`|
|**`codeStyle`**|The style of the centre QR Code pieces. |`square`|
|**`outerEyeStyle`**|The style of the outside of the QR Code's eyes. |`square`|
|**`innerEyeStyle`**|The style of the inside of the QR Code's eyes. |`square`|
|**`size`**|The width & height of the component. |`250`|
|**`color`**|The color of the QR Code. |`black`|
|**`backgroundColor`**|The background color of the component. |`white`|
|**`padding`**|The padding between the edge of the component and the QR Code itself (In terms of QR code piece sizes). |`1`|
|**`logo`**|The image to be put in the centre of the QR Code.<br>**Must use a higher `ecl` for QR Code to work with a logo. <br>(L->M->Q->H)** |none|
|**`logoSize`**|The size of the logo in the QR Code. |none|
|**`linearGradient`**|The two colors to be used for the linear gradient for the foreground. |none|
|**`gradientDirection`**|The numbers that [define the orientation of the linear gradient](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Gradients). |`[0,0,170,0]`|
|**`backgroundImage`**|The image to be used as the filling of the QR Code pieces.<br>**The Eyes can not be styled if a background image is used.**|none|
|**`ecl`**|The [error correction level](http://www.qrcode.com/en/about/error_correction.html) of the QR Code. |`L`|

## Examples

### `codeStyle`
```jsx
<QRCode codeStyle='square' />
<QRCode codeStyle='circle' />
<QRCode codeStyle='dot' />
<QRCode codeStyle='diamond' />
<QRCode codeStyle='sharp' />
```
<img src='./assets/example-code-styles.png' height='250'/>

### `outerEyeStyle`
```jsx
<QRCode outerEyeStyle='square' />
<QRCode outerEyeStyle='circle' />
<QRCode outerEyeStyle='diamond' />
```
<img src='./assets/example-outer-eye-styles.png' height='250'/>

### `innerEyeStyle`
```jsx
<QRCode  innerEyeStyle='square' />
<QRCode  innerEyeStyle='circle' />
<QRCode  innerEyeStyle='diamond' />
```
<img src='./assets/example-inner-eye-styles.png' height='250'/>

### logo
```jsx
<QRCode logo={require('./dab.png')} />
```
<img src='./assets/example-logo.png' height='250'/>

### linearGradient
```jsx
<QRCode linearGradient={['rgb(255,0,0)','rgb(0,255,255)']} />
<QRCode linearGradient={['rgb(255,0,0)','rgb(0,255,255)']} gradientDirection={[0,170,0,0]} />
```
<img src='./assets/example-linear-gradient.png' height='250'/>

### backgroundImage
```jsx
<QRCode backgroundImage={require('./galaxy.png')} />
```
<img src='./assets/example-background-image.png' height='250'/>

## Contributing

.

## License

[MIT License](http://opensource.org/licenses/mit-license.html). © Geoffrey Natin 2018
