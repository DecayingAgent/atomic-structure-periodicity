import assert from "node:assert/strict";
import test from "node:test";
import {
  hydrogenTransition,
  quantumNumbersAreValid,
  visibleColorAtWavelength,
  wavelengthToFrequency,
} from "../app/chapter7-utils.ts";

test("650 nm light has the expected frequency", () => {
  assert.equal(wavelengthToFrequency(650).toExponential(2), "4.61e+14");
});

test("hydrogen n=2 to n=1 is the 121.6 nm Lyman-alpha transition", () => {
  assert.ok(Math.abs(hydrogenTransition(2, 1).wavelengthNm - 121.6) < 0.2);
});

test("quantum-number validator enforces shell and orientation bounds", () => {
  assert.equal(quantumNumbersAreValid(3, 1, -1), true);
  assert.equal(quantumNumbersAreValid(2, 2, 0), false);
  assert.equal(quantumNumbersAreValid(3, 1, 2), false);
});

test("visible-spectrum bands classify the reference wavelength ranges", () => {
  assert.equal(visibleColorAtWavelength(449), "violet");
  assert.equal(visibleColorAtWavelength(450), "blue");
  assert.equal(visibleColorAtWavelength(604), "orange");
  assert.equal(visibleColorAtWavelength(625), "red");
});
