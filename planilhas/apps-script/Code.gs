/**
 * LUDUS — Character Sheet sidebar
 * Ludify · paste this into the MASTER character sheet, once.
 *
 * WHY THIS WORKS WHERE A PREVIOUS ATTEMPT DID NOT
 * Every cell is addressed by NAMED RANGE (LUD_charName, LUD_pack1, ...), never
 * by A1. The names are created by planilhas/src/build_ficha.py and survive the
 * .xlsx -> Google Sheets import, so if the sheet layout ever changes the
 * sidebar keeps working with no edit here.
 *
 * INSTALL (once, on the master, BEFORE you copy it for each student)
 *   1. Open the master character sheet in Google Sheets.
 *   2. Extensions -> Apps Script.
 *   3. Delete whatever is in Code.gs and paste this file.
 *   4. File + -> HTML -> name it exactly  Sidebar  -> paste Sidebar.html.
 *   5. Save. Reload the spreadsheet. A "Ludus" menu appears.
 *   6. Ludus -> Open character sheet. Authorise once.
 *
 * Every copy you make of the master carries this script with it.
 */

var FIELDS = [
  { key: 'charName',        label: 'Character name',     type: 'text' },
  { key: 'people',          label: 'People',             type: 'select',
    options: ['', 'Human', 'Wickborn', 'Greenkept', 'Duskborn', 'Hybrid'] },
  { key: 'lineage',         label: 'Lineage or Gift',    type: 'text' },
  { key: 'archetype',       label: 'Archetype',          type: 'select',
    options: ['', 'Vanguard', 'Diplomat', 'Strategist', 'Scout'] },
  { key: 'bloodline',       label: 'Bloodline',          type: 'select',
    options: ['', 'Elf-touched', 'Orc-blooded'] },
  { key: 'hybridFeature',   label: 'Hybrid feature',     type: 'area' },
  { key: 'flame',           label: 'Flame',              type: 'select',
    options: ['', 'Red flame', 'Yellow flame', 'Blue flame', 'Green flame'] },
  { key: 'taperCharge',     label: 'Taper charge',       type: 'select',
    options: ['ready', 'spent this scene'] },
  { key: 'focus_courage',   label: 'Courage',            type: 'focus' },
  { key: 'focus_empathy',   label: 'Empathy',            type: 'focus' },
  { key: 'focus_wit',       label: 'Wit',                type: 'focus' },
  { key: 'focus_instinct',  label: 'Instinct',           type: 'focus' },
  { key: 'languagePoints',  label: 'Language Points',    type: 'number' },
  { key: 'spotlightTokens', label: 'Spotlight Tokens',   type: 'number' },
  { key: 'signatureMove',   label: 'Signature Move',     type: 'area' },
  { key: 'tier',            label: 'Tier',               type: 'select',
    options: ['1', '2', '3', '4'] },
  { key: 'crossTraining1',  label: 'Cross-Training 1',   type: 'text' },
  { key: 'crossTraining2',  label: 'Cross-Training 2',   type: 'text' },
  { key: 'pack1',           label: 'Pack slot 1',        type: 'text' },
  { key: 'pack2',           label: 'Pack slot 2',        type: 'text' },
  { key: 'pack3',           label: 'Pack slot 3',        type: 'text' },
  { key: 'pack4',           label: 'Pack slot 4',        type: 'text' },
  { key: 'pack5',           label: 'Pack slot 5',        type: 'text' },
  { key: 'pack6',           label: 'Pack slot 6',        type: 'text' },
  { key: 'boons',           label: 'Boons',              type: 'area' },
  { key: 'money_coin',      label: 'Coins',              type: 'number' },
  { key: 'money_handful',   label: 'Handfuls',           type: 'number' },
  { key: 'money_bag',       label: 'Bags',               type: 'number' },
  { key: 'money_chest',     label: 'Chests',             type: 'number' },
  { key: 'note1',           label: 'Note 1',             type: 'text' },
  { key: 'note2',           label: 'Note 2',             type: 'text' },
  { key: 'note3',           label: 'Note 3',             type: 'text' },
  { key: 'note4',           label: 'Note 4',             type: 'text' },
  { key: 'note5',           label: 'Note 5',             type: 'text' }
];

/* Read-only rows that come down from the Class Board. */
var PULLED = [
  ['Growth Level',      2],
  ['Where you are',     3],
  ['Lesson',            4],
  ['Language Focus',    5],
  ['Presenting today?', 6],
  ['Your Actions',      7],
  ['Next lesson',       9]
];

/* 24/09/2026 — the six Moves and the modifier the sheet works out for each.
   Same reason they went onto the sheet: mid-scene, the question is which Focus
   a Move uses, and the sidebar is what a student has open. Read-only, and read
   off the cells rather than recomputed here — a rule computed in this file
   would be a rule that lives nowhere in core/. */
var MOVE_READ = ['Act Under Pressure', 'Face Danger', 'Read the Scene',
                 'Persuade or Manipulate', 'Parley', 'Help or Interfere'];

/* Read-only rows that the sheet works out from your Flame. 20/09/2026.
   Same trick as PULLED: read what the cell already shows, never recompute a
   rule here. A rule computed in this file would be a rule that lives nowhere
   in core/, which is the one thing this project does not allow. */
var FLAME_READ = ['Focus you burn with', 'Your spark', 'Your taper'];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Ludus')
    .addItem('Open character sheet', 'showSidebar')
    .addToUi();
}

function showSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Your character');
  SpreadsheetApp.getUi().showSidebar(html);
}

function nameRange_(key) {
  return SpreadsheetApp.getActive().getRangeByName('LUD_' + key);
}

/** Everything the sidebar needs, in one call. */
function getSheetData() {
  var out = { fields: [], pulled: [], flame: [], moves: [], studentName: '' };
  var nameR = nameRange_('studentName');
  out.studentName = nameR ? String(nameR.getDisplayValue()) : '';

  for (var i = 0; i < FIELDS.length; i++) {
    var f = FIELDS[i];
    var r = nameRange_(f.key);
    out.fields.push({
      key: f.key,
      label: f.label,
      type: f.type,
      options: f.options || null,
      value: r ? String(r.getDisplayValue()) : '',
      missing: !r
    });
  }

  /* The blue block is a VLOOKUP into the imported board. Read what the cells
     already show rather than recomputing anything here. */
  var sh = SpreadsheetApp.getActive().getSheetByName('CHARACTER SHEET');
  if (sh) {
    /* B..I, because the sheet is two columns wide: the left block is B/C/D and
       the right block is F/G/I. */
    var wide = sh.getRange('B1:I200').getDisplayValues();
    var vals = wide;
    for (var p = 0; p < PULLED.length; p++) {
      var label = PULLED[p][0];
      for (var row = 0; row < vals.length; row++) {
        if (String(vals[row][0]).toLowerCase().indexOf(label.toLowerCase()) === 0) {
          out.pulled.push({ label: label, value: vals[row][1] });
          break;
        }
      }
    }
    /* A Move can be in either block, so look in both label columns. */
    for (var mi = 0; mi < MOVE_READ.length; mi++) {
      var mlabel = MOVE_READ[mi];
      for (var mrow = 0; mrow < wide.length; mrow++) {
        if (String(wide[mrow][0]) === mlabel) {
          out.moves.push({ label: mlabel, value: wide[mrow][1], focus: wide[mrow][2] });
          break;
        }
        if (String(wide[mrow][4]) === mlabel) {
          out.moves.push({ label: mlabel, value: wide[mrow][5], focus: wide[mrow][7] });
          break;
        }
      }
    }
    for (var q = 0; q < FLAME_READ.length; q++) {
      var flabel = FLAME_READ[q];
      for (var frow = 0; frow < vals.length; frow++) {
        if (String(vals[frow][0]).toLowerCase().indexOf(flabel.toLowerCase()) === 0) {
          out.flame.push({ label: flabel, value: vals[frow][1] });
          break;
        }
      }
    }
  }
  return out;
}

/** Write one field back. Returns the value the cell ended up with. */
function saveField(key, value) {
  var r = nameRange_(key);
  if (!r) throw new Error('Field not found: ' + key);
  r.setValue(value);
  SpreadsheetApp.flush();
  return r.getDisplayValue();
}

/** Spend one of something, without letting it go below zero. */
function spendOne(key) {
  var r = nameRange_(key);
  if (!r) throw new Error('Field not found: ' + key);
  var n = Number(r.getValue()) || 0;
  if (n > 0) { r.setValue(n - 1); SpreadsheetApp.flush(); }
  return String(r.getDisplayValue());
}
