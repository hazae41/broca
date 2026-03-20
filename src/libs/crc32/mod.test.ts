/// <reference types="@/libs/bytes/lib.d.ts" />

import { assert, test } from "@hazae41/phobos";
import { crc32 } from "./mod.ts";

test("test vector", async () => {
  assert(crc32.digest(new TextEncoder().encode("a")) === 0xe8b7be43)
  assert(crc32.digest(new TextEncoder().encode("abc")) === 0x352441c2)
  assert(crc32.digest(new TextEncoder().encode("hello world")) === 0x0d4a1185)
  assert(crc32.digest(new TextEncoder().encode("123456789")) === 0xcbf43926)
  assert(crc32.digest(new TextEncoder().encode("The quick brown fox jumps over the lazy dog")) === 0x414fa339)
})