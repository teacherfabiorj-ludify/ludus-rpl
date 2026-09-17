// ============================================================================
// LUDUS — THE BRIDGE
//
// The books are built in JavaScript; the spreadsheets are built in Python.
// Python cannot require a JS file, and for months that meant the Focus names
// were typed twice — once in system.js and once in make_figures.py — with a
// comment apologising for it.
//
// This script ends that. It dumps every export of core/ into core.json, and
// the Python builders read the JSON. One source, two languages.
//
//   node core/export.js            → writes core/core.json
//
// RUN export_units.py FIRST (it writes core/units.json), THEN this, THEN the
// Python builds. If core.json is older than the .js files
// it came from, the spreadsheets are being built from stale truth.
// ============================================================================

const { writeFileSync } = require("fs");
const path = require("path");

const brand = require("./brand.js");
const system = require("./system.js");
const method = require("./method.js");
const glossary = require("./glossary.js");
const units = require("./units.js");
const ludus = require("./ludus.js");
const decisions = require("./decisions.js");
const tallowCoast = require("./doors/tallow-coast.js");

const payload = {
  _generated: new Date().toISOString(),
  _warning: "GENERATED FILE — do not edit. Edit core/*.js and run: node core/export.js",
  brand,
  system,
  method,
  glossary: glossary.glossary,
  units: { coursebook: units.coursebook, units: units.units, unitsToCheck: units.unitsToCheck },
  ludus,
  decisions: decisions.decisions,
  doors: { tallowCoast },
};

const out = path.join(__dirname, "core.json");
writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");
console.log("core.json written —", Object.keys(payload).length, "sections");
