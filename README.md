
<!---
<p align="center">
  <img alt="react-native-custom-qr-codes" src="http://i.imgur.com/P4cRUgD.png" width="208">
</p>
--->
<p align="center">
  A Customisable QR Codes for React Native.
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
- [ ] Test every potential usage
- [ ] Create design file standard
- [ ] Document usage
- [ ] Pimp out README.md
- [ ] Create Project Files
- [ ] Add tests for the package
- [ ] Write code contribution guide
- [ ] Write up design contribution guide
- [ ] Upload the package to npm

## Installation

.

## Usage


```jsx
import QRCode from 'react-native-custom-qr-codes';

<QRCode content='https://i-love-qr-codes.com' size={200}/>
```

### Properties

| Prop | Description | Default |
|---|---|---|
|**`content`**|The String to be encoded in the QR code. |`Somebody forgot to put 'content' in this QR Code!`|
|**`size`**|The width & height of the component. |`200`|
|**`padding`**|The padding between the edge of the component and the QR Code itself. |`4`|
|**`color`**|The color of the QR Code. |`black`|
|**`backgroundColor`**|The background color of the component. |`white`|
|**`codeStyle`**|The particular style of the QR Code. |`square`|
|**`logoSize`**|The size of the logo in the QR Code. |`color`|
|**`errorCorrectionLevel`**|The [error correction level](http://www.qrcode.com/en/about/error_correction.html) of the QR Code. |`H`|

## Examples

.

## Contributing

.

### Inspirations

QR Code generation: [papnkukn](https://github.com/papnkukn/qrcode-svg) (who got altered [davidshimjs](https://github.com/davidshimjs/qrcodejs)' original code)  
QR data styling algorithim: [mpaolino](https://github.com/mpaolino/qrlib)  
QR Code Designs: [QR Code Monkey](https://www.qrcode-monkey.com/)

