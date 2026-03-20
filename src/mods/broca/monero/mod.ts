import { crc32 } from "@/libs/crc32/mod.ts";
import { Nullable } from "@/libs/nullable/mod.ts";
import { english } from "@/libs/wordlists/monero/english/mod.ts";

export namespace MoneroSeedPhrase {

  /**
   * Generate a mnemonic seed phrase with the given wordlist and prefix length
   * @param wordlist wordlist to use (default: english) 
   * @param prefix number of characters to use as prefix for checksum (default: 3)
   * @returns mnemonic seed phrase
   */
  export function generate(wordlist = english, prefix = 3) {
    return encode(crypto.getRandomValues(new Uint8Array(32)), wordlist, prefix)
  }

  /**
   * Encode entropy into a mnemonic seed phrase
   * @param entropy entropy bytes
   * @param wordlist wordlist to use (default: english)
   * @param prefix number of characters to use as prefix for checksum (default: 3)
   * @returns mnemonic seed phrase
   */
  export function encode(entropy: Uint8Array<ArrayBuffer>, wordlist = english, prefix = 3) {
    const data = new DataView(entropy.buffer)

    const words = new Array<string>(24)

    for (let i = 0; i < 8; i++) {
      const l = wordlist.length
      const x = data.getUint32(i * 4, true)

      const w0 = x % l
      const w1 = (Math.floor(x / l) + w0) % l
      const w2 = (Math.floor(Math.floor(x / l) / l) + w1) % l

      words[i * 3 + 0] = wordlist[w0]
      words[i * 3 + 1] = wordlist[w1]
      words[i * 3 + 2] = wordlist[w2]
    }

    const food = words.map(w => w.slice(0, prefix)).join("")
    const hash = crc32.digest(new TextEncoder().encode(food))

    words.push(words[hash % 24])

    return words.join(" ")
  }

  /**
   * Decode a mnemonic seed phrase into entropy
   * @param mnemonic mnemonic seed phrase
   * @param wordlist wordlist to use (default: english)
   * @param prefix number of characters to use as prefix for checksum (default: 3)
   * @returns entropy bytes or null if invalid
   */
  export function decode(mnemonic: string, wordlist = english, prefix = 3): Nullable<Uint8Array<ArrayBuffer>> {
    const words = mnemonic.trim().normalize("NFKD").split(/\s+/)

    if (words.length !== 25)
      return
    if (!words.every(word => wordlist.includes(word)))
      return

    const food = words.slice(0, 24).map(w => w.slice(0, prefix)).join("")
    const hash = crc32.digest(new TextEncoder().encode(food))

    const checksum = words[hash % 24]

    if (checksum !== words[24])
      return

    const seed = new Uint8Array(32)
    const data = new DataView(seed.buffer)

    for (let i = 0; i < 8; i++) {
      const l = wordlist.length

      const w0 = wordlist.indexOf(words[(i * 3) + 0])
      const w1 = wordlist.indexOf(words[(i * 3) + 1])
      const w2 = wordlist.indexOf(words[(i * 3) + 2])

      const x0 = w0
      const x1 = l * (((l - w0) + w1) % l)
      const x2 = l * l * (((l - w1) + w2) % l)

      const x = x0 + x1 + x2

      data.setUint32(i * 4, x, true)
    }

    return seed
  }

  /**
   * Validate a mnemonic seed phrase
   * @param mnemonic mnemonic seed phrase
   * @param wordlist wordlist to use (default: english)
   * @param prefix number of characters to use as prefix for checksum (default: 3)
   * @returns whether the mnemonic is valid
   */
  export function validate(mnemonic: string, wordlist = english, prefix = 3) {
    return decode(mnemonic, wordlist, prefix) != null
  }

}