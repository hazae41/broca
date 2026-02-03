# Broca

Mnemonic derivation (BIP-39, Monero) for TypeScript

```bash
npm install @hazae41/broca
```

[**📦 NPM**](https://www.npmjs.com/package/@hazae41/broca)

## Features

### Current features
- 100% TypeScript and ESM
- No external dependencies
- Rust-like patterns
- Uses WebCrypto
- BIP-39, Monero

## Usage

### BIP-39

```tsx
const mnemonic = await BitcoinSeedPhrase.generate(256)

if (!BitcoinSeedPhrase.validate(mnemonic))
  throw new Error("Invalid mnemonic seed phrase")

const seed = await BitcoinSeedPhrase.derive(mnemonic)
```

<!-- ### Monero

```tsx
const mnemonic = await MoneroSeedPhrase.generate(256)

if (!MoneroSeedPhrase.validate(mnemonic))
  throw new Error("Invalid mnemonic seed phrase")

const seed = await MoneroSeedPhrase.derive(mnemonic)
``` -->