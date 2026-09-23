// ── test-no-duplicate-keys.js ──────────────────────────────────────────────
// A6 guard: no object literal in the engine may declare the same key twice.
//
// WHY THIS EXISTS. `chooseOpponentMoves` built a ~60-field context literal that
// assigned `targetInfatuated: state.youAttracted` and then, 74 lines later,
// `targetInfatuated: false`. In a JS object literal the later key silently
// wins, so the real wiring was dead and five handler branches could never fire.
// It is legal JavaScript, `node --check` accepts it, and it survived fourteen
// sessions and an audit before being measured as inert (sim-audit.md §2.3).
// The brief asks for linting so the class cannot recur.
//
// Implementation notes: the engine is dependency-free and must stay that way,
// so this is a small brace-depth scanner rather than a real parser. It strips
// comments, strings and template literals first, then walks the source tracking
// a stack of `{` frames, recording `key:` at the start of a line within each
// frame. Restricting to line-initial keys is deliberate -- it is how every
// literal in this codebase is written, and it keeps ternaries, labels and
// object destructuring from producing false positives.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILES = ["logic.js", "scorekeeper.js", "opponent-adapter.js"];

function strip(src) {
  let out = "";
  let i = 0;
  const n = src.length;
  let state = "code"; // code | line | block | sq | dq | tpl
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (state === "code") {
      if (c === "/" && d === "/") { state = "line"; out += "  "; i += 2; continue; }
      if (c === "/" && d === "*") { state = "block"; out += "  "; i += 2; continue; }
      if (c === "'") { state = "sq"; out += " "; i++; continue; }
      if (c === '"') { state = "dq"; out += " "; i++; continue; }
      if (c === "`") { state = "tpl"; out += " "; i++; continue; }
      out += c; i++; continue;
    }
    if (state === "line") { if (c === "\n") { state = "code"; out += "\n"; } else out += " "; i++; continue; }
    if (state === "block") {
      if (c === "*" && d === "/") { state = "code"; out += "  "; i += 2; continue; }
      out += c === "\n" ? "\n" : " "; i++; continue;
    }
    // inside a string/template
    if (c === "\\") { out += "  "; i += 2; continue; }
    if ((state === "sq" && c === "'") || (state === "dq" && c === '"') || (state === "tpl" && c === "`")) {
      state = "code"; out += " "; i++; continue;
    }
    out += c === "\n" ? "\n" : " "; i++;
  }
  return out;
}

// Returns [{ key, line, firstLine }] for every duplicate found.
function findDuplicateKeys(src) {
  const stripped = strip(src);
  const lines = stripped.split("\n");
  const rawLines = src.split("\n");
  const stack = [];           // one Map per open brace frame
  const dups = [];
  for (let ln = 0; ln < lines.length; ln++) {
    const line = lines[ln];
    // record a line-initial `key:` against the CURRENT frame, before this
    // line's own braces change the depth
    const m = line.match(/^\s*([A-Za-z_$][\w$]*)\s*:/);
    if (m && stack.length > 0) {
      const frame = stack[stack.length - 1];
      const key = m[1];
      // `case X:` and `default:` are labels, not keys
      if (!/^\s*(case|default)\b/.test(line)) {
        if (frame.has(key)) dups.push({ key, line: ln + 1, firstLine: frame.get(key), text: rawLines[ln].trim() });
        else frame.set(key, ln + 1);
      }
    }
    for (const ch of line) {
      if (ch === "{") stack.push(new Map());
      else if (ch === "}") stack.pop();
    }
  }
  return dups;
}

let failures = 0;
console.log("-- scanning engine object literals for duplicate keys --");
for (const f of FILES) {
  const p = path.join(HERE, f);
  if (!fs.existsSync(p)) { console.log(`   ${f}: MISSING`); failures++; continue; }
  const dups = findDuplicateKeys(fs.readFileSync(p, "utf8"));
  if (dups.length === 0) {
    console.log(`   ${f}: clean`);
  } else {
    failures += dups.length;
    for (const d of dups) {
      console.log(`  FAIL ${f}:${d.line} duplicate key "${d.key}" (first declared at line ${d.firstLine}) -> ${d.text}`);
    }
  }
}

console.log();
console.log("-- self-check: the scanner must actually catch the A6 shape --");
{
  const sample = [
    "const ctx = {",
    "  targetInfatuated: state.youAttracted,",
    "  other: 1,",
    "  nested: { targetInfatuated: false },   // different frame, must NOT flag",
    "  targetInfatuated: false,",
    "};",
  ].join("\n");
  const found = findDuplicateKeys(sample);
  const hit = found.filter((d) => d.key === "targetInfatuated");
  if (hit.length !== 1) { failures++; console.log(`  FAIL self-check expected exactly 1 duplicate, got ${found.length}: ${JSON.stringify(found)}`); }
  else console.log(`   caught the duplicate at line ${hit[0].line} (first at ${hit[0].firstLine}); the nested same-name key in a different frame was correctly ignored`);

  // and a string containing "foo:" twice must not trip it
  const strSample = 'const a = {\n  msg: "foo: bar foo: baz",\n  b: 2,\n};';
  if (findDuplicateKeys(strSample).length !== 0) { failures++; console.log("  FAIL self-check: string contents must be ignored"); }
  else console.log("   key-like text inside strings and comments is ignored");
}

console.log();
console.log(failures === 0 ? "ALL PASS -- no duplicate object keys" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
