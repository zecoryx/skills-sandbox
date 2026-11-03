import { test } from "node:test";
import assert from "node:assert/strict";
import { isEmail, isValidBalance, parseId } from "../src/validate.js";

test("isEmail accepts a normal address", () => {
  assert.equal(isEmail("a@b.co"), true);
});

test("isEmail rejects missing domain and non-strings", () => {
  assert.equal(isEmail("a@"), false);
  assert.equal(isEmail(42), false);
});

test("isValidBalance accepts 0 and positive integers only", () => {
  assert.equal(isValidBalance(0), true);
  assert.equal(isValidBalance(10), true);
  assert.equal(isValidBalance(-1), false);
  assert.equal(isValidBalance(1.5), false);
  assert.equal(isValidBalance("10"), false);
});

test("parseId accepts positive integers only", () => {
  assert.equal(parseId("7"), 7);
  assert.equal(parseId("0"), null);
  assert.equal(parseId("abc"), null);
});
