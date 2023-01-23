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

import { GaloisField } from "./GaloisField.ts";

export class Polynomial {
  field: GaloisField;
  coefficients: Array<number>;

  constructor(field: GaloisField) {
    this.field = field;
    this.coefficients = [1];
  }

  copy() {
    const that = new Polynomial(this.field);
    that.coefficients = this.coefficients.slice(0);
    return that;
  }

  reduce() {
    const l = this.coefficients.length;
    if (l === 1) {
      return this;
    }

    while (
      this.coefficients.length > 1 &&
      GaloisField.IsZero(this.leadingCoefficient())
    ) {
      this.coefficients.pop();
    }

    return this;
  }

  degree() {
    return this.coefficients.length - 1;
  }

  leadingCoefficient() {
    return this.coefficients[this.degree()];
  }

  constantCoefficient() {
    return this.coefficients[0];
  }

  zero() {
    return this.degree() === 0 && this.constantCoefficient() === 0;
  }

  coefficientAt(i: number) {
    if (i > this.degree()) return 0;

    return this.coefficients[i];
  }

  evaluateAt(a: number) {
    if (GaloisField.IsZero(a)) {
      return this.constantCoefficient();
    } else if (GaloisField.IsOne(a)) {
      let result = 0;
      for (let l = this.coefficients.length; l--;) {
        result = GaloisField.Add(result, this.coefficients[l]);
      }
      return result;
    }

    let result = this.leadingCoefficient();
    for (let l = this.degree(); l--;) {
      result = GaloisField.Add(
        this.field.multiply(result, a),
        this.coefficients[l],
      );
    }

    return result;
  }

  add(that: Polynomial) {
    for (
      let l = Math.max(this.coefficients.length, that.coefficients.length),
        i = 0;
      l--;
      i++
    ) {
      this.coefficients[i] = GaloisField.Add(
        this.coefficientAt(i),
        that.coefficientAt(i),
      );
    }

    return this.reduce();
  }

  multiply(that: Polynomial) {
    const newSize = that.coefficients.length + this.coefficients.length + 1;
    const coefficients = new Array<number>(newSize).map(() => {
      return 0;
    });

    that.coefficients
      .map((that) => {
        return this.copy().multiplyByScalar(that);
      })
      .forEach((that, i) => {
        that.coefficients.forEach((that, j) => {
          coefficients[i + j] = GaloisField.Add(coefficients[i + j], that);
        });
      });

    this.coefficients = coefficients;
    return this.reduce();
  }

  multiplyByScalar(coefficient: number) {
    for (let l = this.coefficients.length; l--;) {
      this.coefficients[l] = this.field.multiply(
        this.coefficients[l],
        coefficient,
      );
    }

    return this;
  }

  findZeroes() {
    const errorCount = this.degree();

    if (errorCount === 1) {
      return [this.field.invert(this.leadingCoefficient())];
    }

    const zeroes = [];
    for (let i = 1, l = this.field.length; l--; i++) {
      if (!GaloisField.IsZero(this.evaluateAt(i))) continue;
      zeroes.push(i);
      if (zeroes.length === errorCount) return zeroes;
    }

    return zeroes;
  }

  shift(degree: number) {
    for (let l = degree; l--;) {
      this.coefficients.unshift(0);
    }

    return this;
  }

  public static from(
    field: GaloisField,
    array: Array<number>,
    BLOCKS_ECC: number,
  ) {
    const poly = Polynomial.fromArray(field, array);
    const that = new Polynomial(field);
    that.coefficients = new Array<number>(BLOCKS_ECC);

    for (let i = BLOCKS_ECC; i--;) {
      that.coefficients[i] = poly.evaluateAt(
        field.exp(GaloisField.IsOne(field.base) ? i : i + 1),
      );
    }

    return that.reduce();
  }

  public static monomial(field: GaloisField, degree: number, scale: number) {
    const that = new Polynomial(field);
    that.coefficients = new Array<number>(degree).map(() => {
      return 0;
    });
    that.coefficients[degree] = scale;

    return that;
  }

  public static zero(field: GaloisField) {
    const that = new Polynomial(field);
    that.coefficients = [0];

    return that;
  }

  public static one(field: GaloisField) {
    const that = new Polynomial(field);
    that.coefficients = [1];

    return that;
  }

  public static fromArray(field: GaloisField, array: Array<number>) {
    const that = new Polynomial(field);
    that.coefficients = array.slice().reverse();
    that.reduce();

    return that;
  }
}
