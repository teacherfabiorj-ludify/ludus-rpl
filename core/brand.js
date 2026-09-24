// ============================================================================
// LUDUS — BRAND AND NAMES
//
// Locked 15/09/2026. Three naming slots, and they are not interchangeable.
//
//   HOUSE   Ludify   the registered mark. The school. Never changes.
//   GAME    Ludus    the system. What goes on the cover of every book.
//   METHOD  RPL      the internal acronym. Repository, spreadsheets, notes.
//                    NEVER on a cover, never said to a student, never in copy.
//
// Latin *ludus* means both "school" (the ludus litterarius) and "game". That
// double meaning is the whole thesis of this product in one word, and Ludify
// comes from the same root — one family, not two competing names.
// ============================================================================

const HOUSE = "Ludify";
const GAME_NAME = "Ludus";
const METHOD = "RPL";

// 23/09/2026 — v3.0. Bumped because the suite is materially different from
// what v2.0 named: the four flames are canon, the Master's Guide was rewritten
// and wired to core/, and the character sheet was rebuilt in two columns.
const VERSION = "v3.0 · September 2026";

const BOOK_SUBTITLE = `A ${HOUSE} language roleplaying system`;

// Commercial copy is Portuguese and says "aula", never "session" — see
// regra-de-idioma-do-material.md. This line may be used with warm leads only,
// never as the first thing a cold lead reads.
const TAGLINE_PT = "Entre no Ludus. Saia falando inglês.";

module.exports = { HOUSE, GAME_NAME, METHOD, VERSION, BOOK_SUBTITLE, TAGLINE_PT };
