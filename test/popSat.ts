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

const field = new GaloisField(0x100, 0x12d, 2);

console.time('Testing 8-bit 1k');

const array = `Or, if there were a sympathy in choice, 
War, death, or sickness did lay siege to it, 
Making it momentary as a sound, 
Swift as a shadow, short as any dream, 
Brief as the lightning in the collied night;`.split(' ').map((ea)=>{
  return ea.charCodeAt(0);
}); // RS(255,223)

while (array.length < 223) { array.push(0x20); }

for (let ik = 0; ik < 1000; ik++) {

  const BLOCKS_LENGTH = 255;
  const BLOCKS_DATA = array.length;
  const BLOCKS_ECC = BLOCKS_LENGTH - BLOCKS_DATA;

  const rse = new ReedSolomonEncoder(field, BLOCKS_ECC);

  const encoded = rse.encode(array);

  const offset = Math.floor(Math.random() * 12);
  for (let i = offset; i < 3 + offset; i++) {
    encoded[i] = Math.floor(Math.random() * 15);
  }

  ReedSolomonDecoder(field, encoded, BLOCKS_ECC);

  for (let i = 0; i < 223; i++) {
    if (array[i] !== encoded[i]) {
      console.error('Failed to correct', i);
    }
  }
}

console.timeEnd('Testing 8-bit 1k');
