import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const clientRoot = new URL("../dist/client/", import.meta.url);

test("exports an accessible study companion document", async () => {
  const html = await readFile(new URL("index.html", clientRoot), "utf8");
  assert.match(html, /<title>Atomic Structure &amp; Periodicity \| ATOM\/07<\/title>/i);
  assert.match(html, /Atomic structure/i);
  assert.match(html, /Light is a measurement/i);
  assert.match(html, /Hydrogen leaves fingerprints/i);
  assert.match(html, /Prove it to yourself/i);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|Building your site/i);
});

test("static export includes scripts and styles", async () => {
  const html = await readFile(new URL("index.html", clientRoot), "utf8");
  assert.match(html, /<script[^>]+src=/i);
  assert.match(html, /<link[^>]+stylesheet/i);
  await access(new URL("_next/", clientRoot));
});
