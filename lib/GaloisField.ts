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

export class GaloisField {
  length = 0;
  generator = 0;
  base = 0;

  expTable: Array<number> = [];
  logTable: Array<number> = [];

  constructor(size: number, generator: number, base: number) {
    this.expTable = [];
    this.logTable = [0];

    let j = 1;
    for (let i = 0; i < size; i++) {
      this.expTable[i] = j;
      j = j << 1;
      if (j >= size) j ^= generator;
    }

    for (let i = 0; i < size - 1; i++) {
      this.logTable[this.expTable[i]] = i;
    }

    const length: number = size - 1;

    this.base = base;
    this.length = length;
    this.generator = generator;

    return;
  }

  multiply(x: number, y: number) {
    if (x === 0 || y === 0) return 0;
    return this.expTable[(this.logTable[x] + this.logTable[y]) % this.length];
  }

  invert(x: number) {
    return this.expTable[this.length - this.logTable[x]];
  }

  divide(x: number, y: number) {
    return this.multiply(x, this.invert(y));
  }

  log(x: number) {
    return this.logTable[x];
  }

  exp(x: number) {
    return this.expTable[x];
  }

  public static IsZero(x: number) {
    return x === 0;
  }

  public static IsOne(x: number) {
    return x === 1;
  }

  public static Add(x: number, y: number) {
    return x ^ y;
  }
}
