// ============================================================================
// LUDUS — ★ THE TRAIL: the 72 units
//
// Generated. Do not edit by hand:
//     python3 planilhas/src/export_units.py     → core/units.json
//
// This is THE trail layer. It is the only file in the repository that pairs a
// coursebook with a unit number. Everything that prints the official Language
// Focus table reads it: the Core Book, the Panel, the session preparation.
//
// Swapping coursebook one day means regenerating this file from another
// catalogue. Nothing else in core/ has to be opened.
// ============================================================================

const data = require("./units.json");

const units = data.units;
const coursebook = data.coursebook;

// The ones whose lesson 1 / lesson 2 split has NOT been confirmed against the
// printed book. Printed with a warning wherever the table appears.
const unitsToCheck = units.filter((u) => u.checked !== "inferred");

function unit(key) {
  return units.find((u) => u.key === key);
}

function unitsOfLevel(level) {
  return units.filter((u) => u.level === level);
}

module.exports = { units, coursebook, unitsToCheck, unit, unitsOfLevel };
