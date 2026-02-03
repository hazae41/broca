import { Lengthed } from "@/libs/lengthed/mod.ts";
import { Nullable } from "@/libs/nullable/mod.ts";
import { english } from "@/libs/wordlists/english/mod.ts";

export namespace BitcoinSeedPhrase {

  /**
   * Generate a mnemonic seed phrase with the given strength and wordlist
   * @param strength bits of entropy (128, 160, 192, 224, 256)
   * @param wordlist wordlist to use (default: english)
   * @returns 
   */
  export async function generate(strength: 128 | 160 | 192 | 224 | 256, wordlist = english) {
    return await encode(crypto.getRandomValues(new Uint8Array(strength / 8)), wordlist)
  }

  /**
   * Encode entropy into a mnemonic seed phrase
   * @param entropy entropy bytes
   * @param wordlist wordlist to use (default: english)
   * @returns mnemonic seed phrase
   */
  export async function encode(entropy: Uint8Array<ArrayBuffer>, wordlist = english) {
    const source8 = entropy
    const source2 = Array.from(source8).map(b => b.toString(2).padStart(8, "0")).join("")

    const digest8 = new Uint8Array(await crypto.subtle.digest("SHA-256", source8))
    const digest2 = Array.from(digest8).map(b => b.toString(2).padStart(8, "0")).join("")

    const concat2 = source2 + digest2.slice(0, source8.length / 4)

    const words: string[] = []

    for (let i = 0; i < concat2.length; i += 11)
      words.push(wordlist[parseInt(concat2.slice(i, i + 11), 2)])

    return words.join(" ")
  }

  /**
   * Decode a mnemonic seed phrase into entropy
   * @param mnemonic mnemonic seed phrase
   * @param wordlist wordlist to use (default: english)
   * @returns entropy bytes or null if invalid
   */
  export async function decode(mnemonic: string, wordlist = english): Promise<Nullable<Uint8Array<ArrayBuffer>>> {
    const words = mnemonic.trim().normalize("NFKD").split(/\s+/)

    if (![12, 15, 18, 21, 24].includes(words.length))
      return
    if (!words.every(word => wordlist.includes(word)))
      return

    const concat2 = words.map(word => wordlist.indexOf(word).toString(2).padStart(11, "0")).join("")

    const source2 = concat2.slice(0, (concat2.length * 32) / 33)
    const source8 = new Uint8Array(source2.length / 8)

    for (let i = 0; i < source8.length; i += 1)
      source8[i] = parseInt(source2.slice(i * 8, (i + 1) * 8), 2)

    const redigest8 = new Uint8Array(await crypto.subtle.digest("SHA-256", source8))
    const redigest2 = Array.from(redigest8).map(b => b.toString(2).padStart(8, "0")).join("")

    const checksum0 = concat2.slice(source2.length)
    const checksum1 = redigest2.slice(0, source8.length / 4)

    if (checksum0 !== checksum1)
      return

    return source8
  }

  /**
   * Validate a mnemonic seed phrase
   * @param mnemonic mnemonic seed phrase
   * @param wordlist wordlist to use (default: english)
   * @returns whether the mnemonic is valid
   */
  export function validate(mnemonic: string, wordlist = english) {
    return decode(mnemonic, wordlist) != null
  }

  /**
   * Derive a seed from a mnemonic seed phrase and optional passphrase
   * @param mnemonic mnemonic seed phrase
   * @param passphrase optional passphrase (default: "")
   * @returns derived seed bytes (64 bytes)
   */
  export async function derive(mnemonic: string, passphrase = "") {
    const raw = mnemonic.trim().normalize("NFKD").split(/\s+/).join(" ")

    const sal = new TextEncoder().encode("mnemonic" + passphrase)
    const key = new TextEncoder().encode(raw)

    const alg = { name: "PBKDF2", hash: "SHA-512", salt: sal, iterations: 2048 }
    const ref = await crypto.subtle.importKey("raw", key, { name: "PBKDF2" }, false, ["deriveBits"])

    return new Uint8Array(await crypto.subtle.deriveBits(alg, ref, 512)) as Uint8Array<ArrayBuffer> & Lengthed<64>
  }

}