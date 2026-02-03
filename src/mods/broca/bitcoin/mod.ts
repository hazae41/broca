import { Lengthed } from "@/libs/lengthed/mod.ts";
import { english } from "@/libs/wordlists/english/mod.ts";

export namespace BitcoinSeedPhrase {

  export async function generate(strength: 128 | 160 | 192 | 224 | 256, wordlist = english) {
    const source8 = crypto.getRandomValues(new Uint8Array(strength / 8))
    const source2 = Array.from(source8).map(b => b.toString(2).padStart(8, "0")).join("")

    const digest8 = new Uint8Array(await crypto.subtle.digest("SHA-256", source8))
    const digest2 = Array.from(digest8).map(b => b.toString(2).padStart(8, "0")).join("")

    const concat2 = source2 + digest2.slice(0, strength / 32)

    const words: string[] = []

    for (let i = 0; i < concat2.length; i += 11)
      words.push(wordlist[parseInt(concat2.slice(i, i + 11), 2) % wordlist.length])

    return words.join(" ")
  }

  export function validate(mnemonic: string, wordlist = english) {
    const words = mnemonic.trim().normalize("NFKD").split(/\s+/)

    if (![12, 15, 18, 21, 24].includes(words.length))
      return false
    if (!words.every(word => wordlist.includes(word)))
      return false

    return true
  }

  export async function derive(mnemonic: string, passphrase = "") {
    const raw = mnemonic.trim().normalize("NFKD").split(/\s+/).join(" ")

    const sal = new TextEncoder().encode("mnemonic" + passphrase)
    const key = new TextEncoder().encode(raw)

    const alg = { name: "PBKDF2", hash: "SHA-512", salt: sal, iterations: 2048 }
    const ref = await crypto.subtle.importKey("raw", key, { name: "PBKDF2" }, false, ["deriveBits"])

    return new Uint8Array(await crypto.subtle.deriveBits(alg, ref, 512)) as Uint8Array<ArrayBuffer> & Lengthed<64>
  }

}