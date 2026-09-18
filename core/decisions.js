// ============================================================================
// LUDUS — THE DECISION LOG
//
// What was decided, when, and what it replaced. Printed as the last chapter of
// the Core Book, so that a decision revisited in six months can be revisited
// with its reasoning rather than re-argued from nothing.
//
// Only entries that CHANGED something go here. A decision that merely confirmed
// what everybody already thought is not worth a line.
// ============================================================================

const decisions = [
  ["12/08/2026", "The session is the class",
   "An earlier design had the game as a 40–50 minute block inside an ordinary lesson. Replaced: " +
   "the session IS the class, two hours a week, and the coursebook trail is autonomous study."],

  ["06/09/2026", "Four arcs, not three",
   "The three-arc spine was specific to one setting. The four-arc skeleton fits any Door, and " +
   "Arc 4 exists because a table that has played for a year does not want to be told it is over."],

  ["06/09/2026", "The relic comes at the end of Arc 3",
   "Not in Arc 2. What the table chases in Arc 2 is a narrative resource specific to that " +
   "campaign. One campaign, one relic, one of the four skills."],

  ["06/09/2026", "Opportunity, not talk time",
   "An earlier rule asked for equal speaking time. Wrong: the more proficient student will speak " +
   "more, and that is fine. What is never acceptable is a student finishing a session without " +
   "having been invited. What is distributed is the invitation."],

  ["13/09/2026", "English for everything used at the table",
   "Names, places, mechanics, GM lines, lantern prompts, the Codex. Portuguese survives only in " +
   "planning conversation and in commercial copy, where the word is 'aula' and not 'session'."],

  ["13/09/2026", "Growth Level is not the coursebook level",
   "A formula of the shape (level − 1) × 2 + 1 had circulated in operational notes and reached a " +
   "real classroom before it was caught. There is no conversion. Everybody starts at Growth 1."],

  ["15/09/2026", "The system is called LUDUS",
   "Ludify stays as the house mark; RPL becomes the internal shorthand and never appears on a " +
   "cover. Latin ludus means both school and game, and Ludify comes from the same root."],

  ["15/09/2026", "Money is a ladder, not arithmetic",
   "Coin, handful, bag, chest — descriptive, answering what a rung buys rather than how much you " +
   "have. Everyone starts with three handfuls, and answers one question about where it came from."],

  ["15/09/2026", "Language Points are counted at the close and spent next time",
   "They used to be awarded mid-scene and spent minutes later. Now: counted out loud at the " +
   "debrief, written down by the student, spent the following session. And paid for the ATTEMPT."],

  ["15/09/2026", "The Homework Bonus is retired",
   "It added a flat +1 to a roll and was described as the only exception to the law that nothing " +
   "modifies the dice. With homework worth a Language Point instead, the exception disappears and " +
   "the law has no hole in it."],

  ["15/09/2026", "One Spotlight Token per scene, and they are transferable",
   "Without the per-scene cap the brake is spent in the opening. Without the transfer, tokens " +
   "restrain the loud student and do nothing for the quiet one, whose three expire unused."],

  ["16/09/2026", "One hour of class is one lesson of the cycle",
   "Not one meeting. Every group does two hours a week, so every group does two lessons a week " +
   "and a unit every two weeks. This corrected a year-plan that was out by a factor of two."],

  ["16/09/2026", "The students manage their own resources",
   "Language Points and Spotlight Tokens are the student's to track. The GM announces; the student " +
   "records and crosses off — out loud, in English, which is the point."],

  ["16/09/2026", "The coursebook is Evolve with Digital Pack, and the quiz is ours",
   "Evolve Digital went off sale. The printed book with the activation code gives the same " +
   "homework. The Cambridge unit test capped attempts at two and needed an administrator to " +
   "reset; our own quiz in Google Forms removes the cap and the dependency."],

  ["16/09/2026", "The truth moved into core/",
   "Every rule, term and number now lives in one place and is imported by every book and every " +
   "spreadsheet. A definition found inside a build script is a defect. This is the decision that " +
   "makes all the others enforceable."],

  ["17/09/2026", "\"The Second Look\" names the lantern rule; the other one is \"Say It Again\"",
   "One name was carrying two different rules, and both were printed in the same book: the " +
   "lantern passing twice over one object, and a player's permission to redo their own sentence. " +
   "The lantern keeps the name. The permission becomes Say It Again, which is the sentence the " +
   "teacher already says out loud in Session Zero."],

  ["17/09/2026", "The Player's Guide prints only what core/ can prove",
   "Three campaign shapes, a Language Focus card the GM hands out, and every trace of equal " +
   "speaking time came out of the Player's Guide because nothing in core/ supported them. What " +
   "is distributed is the invitation, never the minutes."],
];

module.exports = { decisions };
