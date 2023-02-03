/*
   Copyright 2023 Alexander Stokes
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import { GaloisField, ReedSolomonDecoder, ReedSolomonEncoder } from "../mod.ts";

const field = new GaloisField(0x10, 0x13, 2);

console.time('Testing 10k');

const array = [4, 7, 2, 0, 3, 2, 3];

for (let ik = 0; ik < 10000; ik++) {

  const BLOCKS_LENGTH = 15;
  const BLOCKS_DATA = array.length;
  const BLOCKS_ECC = BLOCKS_LENGTH - BLOCKS_DATA;

  const rse = new ReedSolomonEncoder(field, BLOCKS_ECC);

  const encoded = rse.encode(array);

  const offset = Math.floor(Math.random() * 12);
  for (let i = offset; i < 3 + offset; i++) {
    encoded[i] = Math.floor(Math.random() * 15);
  }

  ReedSolomonDecoder(field, encoded, BLOCKS_ECC);

  for (let i = 0; i < 7; i++) {
    if (array[i] !== encoded[i]) {
      console.error('Failed to correct');
    }
  }
}

console.timeEnd('Testing 10k');
