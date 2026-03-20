/// <reference types="@/libs/bytes/lib.d.ts" />

import { assert, test } from "@hazae41/phobos";
import { MoneroSeedPhrase } from "./mod.ts";

function f(x: string, y: string) {
  const seed = MoneroSeedPhrase.decode(x)

  assert(seed != null)
  assert(seed.toHex() === y)

  assert(MoneroSeedPhrase.encode(seed) === x)
}

test("test vector", async () => {
  f("vinegar talent sorry hybrid ultimate template nimbly jukebox axes inactive veered toenail pride plotting chrome victim agnostic science bailed paddles wounded peaches king laptop king", "6ee02ef8647856f4080882a1ec4fabee19ec047ca24d3abb13c0ce589a46f702")
  f("spout midst duckling tepid odds glass enhanced avatar ocean rarest eavesdrop egotistic oxygen trying future airport session nanny tedious guru asylum superior cement cunning eavesdrop", "af6082af29108abda69cc385dfed2102b892a871695367cb22a4b9b6df8b3206")
  f("essential future brunt cajun upper ammo incur smelting usual tyrant tattoo virtual long hectare idols guarded blender usage ghost sample eagle shelter does dozen usage", "0a0214cf7716292246d277214830411b20d3cd08cd119dcd9e149d7bd1151e02")
})