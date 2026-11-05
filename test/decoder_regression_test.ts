import { GaloisField, ReedSolomonDecoder, ReedSolomonEncoder } from "../mod.ts";

function assert(value: unknown, message = "Assertion failed"): asserts value {
  if (!value) throw Error(message);
}
function equal(actual: number[], expected: number[], context: string) {
  assert(
    actual.length === expected.length &&
      actual.every((value, i) => value === expected[i]),
    `${context}: expected [${expected}], received [${actual}]`,
  );
}
function recover(
  field: GaloisField,
  received: number[],
  sent: number[],
  parity: number,
  context: string,
) {
  // Existing API: true reports failure; clean and repaired results are falsy.
  assert(
    ReedSolomonDecoder(field, received, parity) !== true,
    `${context}: decoding failed`,
  );
  equal(received, sent, context);
}

Deno.test("5000 deterministic cases cover shortened words, odd parity and multiple fields", () => {
  let state = 0x12345;
  const random = (limit: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % limit;
  };
  for (
    const [size, polynomial, base] of [
      [0x10, 0x13, 2],
      [0x40, 0x43, 2],
      [0x100, 0x11d, 1],
      [0x100, 0x12d, 2],
      [0x400, 0x409, 2],
    ]
  ) {
    const field = new GaloisField(size, polynomial, base);
    for (let round = 0; round < 1000; round++) {
      const parity = 2 + random(Math.min(12, size - 3));
      const length = 1 + random(Math.min(size - 1 - parity, 40));
      const payload = Array.from({ length }, () => random(size));
      // Exercise all-zero and leading-zero payloads as well as arbitrary data.
      if (round % 10 === 0) payload.fill(0);
      else if (round % 10 === 1) payload[0] = 0;
      const sent = new ReedSolomonEncoder(field, parity).encode(payload);
      const received = sent.slice();
      const errors = 1 + random(Math.floor(parity / 2));
      const positions = new Set<number>();
      while (positions.size < errors) positions.add(random(received.length));
      for (const position of positions) {
        received[position] ^= 1 + random(size - 1);
      }
      recover(
        field,
        received,
        sent,
        parity,
        `GF(${size}), base ${base}, parity ${parity}, case ${round}`,
      );
    }
  }
});
