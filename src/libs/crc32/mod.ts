export namespace crc32 {

  export const table = new Uint32Array(256)

  for (let i = 0; i < 256; i++) {
    let crc = i;

    for (let j = 0; j < 8; j++)
      crc = (crc & 1) !== 0 ? (crc >>> 1) ^ 0xEDB88320 : crc >>> 1

    table[i] = crc;
  }

  export function digest(bytes: Uint8Array): number {
    let crc = 0xffffffff;

    for (let i = 0; i < bytes.length; i++)
      crc = (crc >>> 8) ^ table[(crc & 0xff) ^ bytes[i]]

    return (crc ^ 0xffffffff) >>> 0;
  }

}