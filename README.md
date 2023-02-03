<img style="width: 100%; max-width: 497px;" src="https://user-images.githubusercontent.com/76128207/118769548-85aaa100-b83d-11eb-8798-1e217d41730a.png" alt="Reed_Solomon">

[![License: Apache 2](https://img.shields.io/badge/license-Apache%202-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
![Blazing Fast](https://img.shields.io/badge/speed-blazing%20🔥-brightgreen.svg)

## An error-correction implementation for Deno.

Reed-Solomon error correction is used in 2D barcodes, CDs and so on.

```ts

import { GaloisField, ReedSolomonEncoder, ReedSolomonDecoder } from "https://deno.land/x/reed_solomon/mod.ts";

// QR CODE
// new GaloisField(0x100, 0x11d, 1);

// MAXICODE
// new GaloisField(0x40, 0x43, 2);

// AZTEC
// new GaloisField(  0x10,   0x13, 2);
// new GaloisField(  0x40,   0x43, 2);
// new GaloisField( 0x100,  0x12d, 2);
// new GaloisField( 0x400,  0x409, 2);
// new GaloisField(0x1000, 0x1069, 2);

// DATA MATRIX
// new GaloisField(0x100, 0x12d, 2);

// EXAMPLE
const field = new GaloisField(0x10, 0x13, 2);

const array = [5, 5, 5, 0, 3, 2, 3];

const BLOCKS_LENGTH = 15;
const BLOCKS_DATA = array.length;
const BLOCKS_ECC = BLOCKS_LENGTH - BLOCKS_DATA;

const rse = new ReedSolomonEncoder(field, BLOCKS_ECC);

const encoded = rse.encode(array);

encoded[0] = 1;
encoded[1] = 1;
encoded[2] = 3;
console.log("\nBefore Restoration:");
console.log(encoded);

ReedSolomonDecoder(field, encoded, BLOCKS_ECC);

console.log("\nAfter Restoration:");
console.log(encoded);

```