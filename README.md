This is a mini-demo for the issued currency functionality in the RippleX SDK (https://github.com/xpring-eng/Xpring-JS)

To set this up:
- Clone the repo
- Run `npm install`
- Clone the Xpring-JS repo locally, build it
- Expose `WalletFactory`, `IssuedCurrencyClient`, and `XrpTestUtils`
- Set up `npm link` to connect the Xpring-JS repo to this repo
- Run `node src/index.js`