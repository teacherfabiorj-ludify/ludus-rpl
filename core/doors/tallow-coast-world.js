// ============================================================================
// THE TALLOW COAST — THE WORLD, IN PROSE
//
// Companion to tallow-coast.js, which holds the reference TABLES.
//
//   door-fantasy/src/build.js   requires it -> prints ALL of it, as Chapter 2
//   players-guide/src/build.js  requires it -> prints the `student` extracts
//
// EVERYTHING IN THIS FILE IS PUBLIC. A resident of the coast knows all of it.
// The secrets — who is draining the wardstones, how a stone is actually fed,
// and how anyone learned to MOVE kindling — live in the Door Book, chapter 3.
//
// ---------------------------------------------------------------------------
// DECISIONS 17/09/2026
//   1. Burning pulls from the PLACE, not the burner and not a regional stock.
//   2. Wardstones are wells of it, which is why a walled city can burn safely.
//   3. The Concord is a TREATY of three cities: archive, seal, no soldiers.
//   4. Burning is DOMESTIC — nearly everyone can raise a spark.
//
// DECISIONS 18/09/2026 — this pass
//   5. THE RESOURCE IS CALLED THE KINDLING. It was "the quiet" until today,
//      which collided with the silence of a drained place AND with the Hush.
//      Three silence-words for three different things. "Kindling" joins the
//      rung lexicon (spark · taper · lantern · pyre) and makes Fábio's own
//      coinage — the Unkindled — load-bearing.
//   6. THE RUNG IS DECIDED BY ARTICULATION, not effort. How much structure you
//      can hold at once. This is why a child cannot light a pyre by straining,
//      and it is quietly the whole pedagogy of the game.
//   7. THE CRIME IS NOT BURNING. It is Burning Unanswered — burning with no
//      name attached. A treaty with no army cannot stop you; it can only make
//      you answerable.
//   8. A PLACE CAN BE WOUNDED. Four stages: spent · sour · hollow · a wound.
//      A wound makes the Unkindled. Rare, old, named, fenced — a NEW one is a
//      coast-wide emergency, and that is the Arc 1 → Arc 2 hinge.
//   9. AN UNKINDLED CANNOT BE BROUGHT BACK. Their true name will QUIET one,
//      briefly. Enough to pass, to run, to bury somebody. Never to cure.
//  10. WARDSTONES ARE FED BY LIVES GATHERED AROUND THEM. ★ SECRET ★ In public
//      a wardstone is simply "the heart of the city" and nobody knows how it
//      fills. What mass death would do to one is deliberately unanswered.
//
// DECISIONS 20/09/2026 — THE FOUR FLAMES (Fábio's design, adopted whole)
//  11. EVERY PERSON IS BORN WITH A FLAME — red, yellow, blue or green — tied
//      to one of the four Focuses. It never changes. It is not an object.
//  12. THE COLOUR IS THE DOMAIN; THE RUNG IS THE SCALE. One idea at three
//      sizes, never three separate powers. This is theRungRule applied to a
//      person rather than to an act.
//  13. A FLAME IS INVISIBLE except to a green flame, who can look at one
//      person and see the colour. Nobody can see their own.
//  14. FLAME IS ORTHOGONAL TO LINEAGE AND TO ARCHETYPE. A Wickborn can be any
//      colour. So can a Vanguard.
//  15. THE NATIVE TAPER. The taper of your colour is the one taper a flame
//      reaches with no trade behind it. Bone, lock and weather remain LEARNED
//      tapers, from a shop on Taper Row. Same rung, different training.
//  16. THE OLD SENSE AND THE GREEN FLAME DO NOT OVERLAP. A Wickborn feels an
//      EVENT: burning happened here, roughly this much, in the past, in a
//      place — and works in an empty room. A green flame reads the LIVING:
//      who is in front of you, now. Neither can do the other's job, which is
//      why the Concord still has to hire readers.
// ============================================================================

// ---------------------------------------------------------------------------
// THE OPENING. Read aloud, slowly, at the top of Session Zero, before anybody
// has a character. Roughly ninety seconds.
// ---------------------------------------------------------------------------
const readAloud = [
  "The coast smells of tallow. It smells of tallow in Ashlight, where the rendering sheds " +
  "stand upwind of the market and nobody has ever thought that funny; it smells of tallow in " +
  "Bellmoor under the salt and the river mud; and it smells of tallow in Saltgate, where they " +
  "boil it with seal fat and sell it to ships. Mutton fat, seal fat, whale fat when a whale is " +
  "unlucky. Candles, soap, lamp oil, waterproofing for boots and boats and rope. It is a coast " +
  "of three walled cities that got rich making light out of animals, and it is named for it.",

  "Which is the joke, and everyone here has heard it. The Tallow Coast burns candles. The " +
  "other kind of burning — the old kind, the kind that sets a bone or turns the weather — is " +
  "licensed, and has been for eighty years, and needs a folded grey card with a wax seal on it. " +
  "You can light a candle with a word here. You need a signature to close a wound.",

  "Eighty years ago there were four cities. The fourth one is still standing. Nothing in it " +
  "moves. Nobody goes inland any more, the road stops where the road stops, and if you ask what " +
  "the fourth city was called you will get three answers from four people and a change of " +
  "subject from the fifth.",

  "That is the coast. Three cities, a bad road between them, a great deal of candle smoke, and " +
  "one silence everybody has agreed to live beside. You have just come through the Door into it, " +
  "and the first thing in front of you is a gate with a tired man at it who would like to see " +
  "your papers.",
];

// ---------------------------------------------------------------------------
// BURNING
// ---------------------------------------------------------------------------
const burning = {
  whatItIs:
    "Burning is the old magic, and on this coast it is not mysterious and not rare. Most people " +
    "can raise a spark the way most people can whistle: badly, usefully, without thinking about " +
    "it. A cook starts the stove with one. A carter finds the pin he dropped in the straw. A " +
    "mother warms a bottle at three in the morning without getting out of bed. Children are told " +
    "not to do it indoors and do it indoors.",

  whatItLooksLike:
    "It looks like almost nothing. A brief warmth on the skin, a pressure behind the ears that " +
    "arrives and leaves, and then the smell — the smell of a candle just snuffed. No light, no " +
    "gesture anybody agrees on, no words that work better than other words. On a coast that " +
    "renders tallow for a living, a burn smells exactly like the room you are already standing " +
    "in, which is the single most useful fact a liar on this coast can know.",

  whatItCosts:
    "Burning does not take anything from the person burning. It takes it from the place. Every " +
    "place holds a certain amount of what this coast calls THE KINDLING — nobody can measure it, " +
    "everybody can feel it — and a burn spends some of it. It comes back on its own, slowly, the " +
    "way a well comes back. A room replaces a spark in about an hour. A street replaces a taper " +
    "in about a day. A whole district needs most of a season to replace a lantern. Nothing " +
    "replaces a pyre.",

  whereKindlingIs:
    "The kindling is not evenly spread, and where it is thickest is the first thing a traveller " +
    "on this coast learns to read. A wood in summer is rich. A herd, a wheat field, a crowded " +
    "market, a harbour full of fish — rich. A bare hill in February is thin. A dry salt flat is " +
    "thinner. The rule of thumb every carter knows is that the more living things are in a " +
    "place, the more that place can give, and that nobody knows whether that is cause or " +
    "coincidence.",
};

// THE RUNG IS DECIDED BY ARTICULATION. The quiet centre of the whole design:
// in a language school, the magic ladder is the language ladder.
const theRungRule = {
  headline: "The rung is not decided by effort. It is decided by how much you can hold at once.",
  body:
    "A spark is one intention, immediate, about one thing: light it, warm it, find it. It needs " +
    "nothing but wanting, which is why anybody can. A taper needs you to hold a STRUCTURE while " +
    "you burn: to set a bone you must know how that bone is put together; to make a door stay " +
    "shut you must have the whole mechanism in your head the entire time. A lantern needs more " +
    "than one person normally holds, and is usually done by several people speaking to each " +
    "other while they do it. A pyre needs what nobody should be able to hold, and that is why " +
    "there has only ever been one.",
  consequence:
    "So a frightened child cannot reach a taper by trying harder, any more than they could write " +
    "a paragraph in a language they do not speak by pressing the pen down. Strain a spark and " +
    "you get a slightly larger spark.",
  forTheTeacherOnly:
    "Say none of this to a student. But notice what it is: a spark is a word, a taper is a " +
    "sentence, a lantern is a paragraph said by several people at once, and a pyre is something " +
    "nobody should be able to say. The magic of this world is the thing your students are " +
    "actually climbing.",
};

const accidents = {
  theCommonOne:
    "Accidents happen and they are small. The ordinary one is a child burning indoors all day " +
    "and leaving the room SOUR — that feeling of a room somebody has just walked out of. Hence " +
    "the first thing every child on this coast is told about magic, which is not about power: " +
    "not indoors. You will not hurt anyone. You will spoil your mother's kitchen.",
  theRealDanger:
    "The one genuine danger of untrained burning is panic. A person in terror pulls without " +
    "structure, without a target, and spends far more than they meant to — a drowning, a fire, a " +
    "birth going wrong. Every village on this coast has a story about a place that was bad for a " +
    "year because somebody despaired there.",
};

// ---------------------------------------------------------------------------
// HOW YOU LEARN. There is no magic college and there must not be one.
// ---------------------------------------------------------------------------
const learning = {
  noSchool:
    "There is no college of magic on the Tallow Coast and there never has been. If a rung is a " +
    "held structure, then learning to burn is learning a TRADE, not learning an art of its own. " +
    "There is no such person as a mage here. There is a midwife, a smith, a locksmith, a " +
    "bone-setter and a weather-reader, and some of them burn.",
  taper:
    "You learn taper from somebody who already does it in the trade you want. The bone is learnt " +
    "from whoever sets bones; the lock from whoever makes locks. This is why Taper Row in " +
    "Ashlight is a street of SHOPS and not a guild hall.",
  lantern:
    "Lantern is another matter. Ten years with a named master, and then a public demonstration " +
    "at the Assize: you explain out loud what you are about to do, why, and what it will spend, " +
    "before you are allowed to do it. Only then is a sealed Warrant issued. There are perhaps " +
    "forty lantern-holders on the whole coast and most people could name one.",
  theGift:
    "A public examination in which you must say what you intend, out loud, in front of people, " +
    "before you may act — is a scene, and it costs nothing to run.",
};

// ---------------------------------------------------------------------------
// WHAT A DRAINED PLACE IS LIKE — the four stages. This is the answer to the
// question the world could not previously answer.
// ---------------------------------------------------------------------------
const depletion = [
  ["Spent", "Hours to a day",
   "Normal, and nobody worries. The room after a spark, the street after a taper. Burns there " +
   "take a moment longer. Nothing else."],
  ["Sour", "A season, if left alone",
   "Burned more than it replaced, for weeks. Burns fail or need two tries. Birds go off. Milk " +
   "turns early. Bread will not rise. People tire at four in the afternoon and cannot say why, " +
   "and sleeping does not fix it. A sour street is a normal thing to complain about, like damp."],
  ["Hollow", "A generation, and not reliably",
   "Years of it. Nothing grows properly, animals leave, cuts heal slowly and badly, and burning " +
   "does not work at all. People move away, which makes it worse — a hollow place is quieter " +
   "every year, and the quieter it gets the less it has to give. Bellmoor keeps one on purpose, " +
   "walled, to show people."],
  ["A wound", "Never, so far as anyone knows",
   "The ground gives up. See below. There are six on the coast and everybody knows where."],
];

const depletionNote =
  "The stages are not a mechanic and there is nothing to roll. They exist so that a GM can " +
  "describe a place consistently, and so that a student who says 'the bread will not rise here' " +
  "has said something the whole table understands.";

// ---------------------------------------------------------------------------
// WOUNDS AND THE UNKINDLED — new 18/09/2026. Rare, old, named and avoided:
// this is a world of licences and arguments, not a monster hunt.
// ---------------------------------------------------------------------------
const wounds = {
  whatItIs:
    "Where a place has been burned hard and often, far from any wardstone, it can stop coming " +
    "back at all. The coast calls that a WOUND. Life leaves; because life has left, the kindling " +
    "does not return; because the kindling does not return, more life leaves. A wound is a place " +
    "where that loop started running backwards and nobody was there to stop it.",

  whatItIsLike:
    "It is never brighter than dusk inside one, at noon, in July. It is cold — your breath shows " +
    "in summer, ten steps in. A flame will not take: not a candle, not a lamp, not a struck " +
    "match, and not a spark. And there is no sound of animals at all, which is the thing people " +
    "notice last and remember longest.",

  howBig: "From a barn to a valley. The largest known is about a mile across.",

  howMany:
    "Six are known on the coast, all named, all fenced by whoever lives nearest, all avoided. " +
    "The newest of the six is forty years old. Nobody has made a new one in living memory, which " +
    "is the single strongest argument the Concord has ever had for its own existence.",

  canItBeHealed:
    "No, and nobody has ever managed it. A wound is not drained ground that will recover: it is " +
    "ground that has stopped recovering. Fences, prayers, planting and fire have all been tried " +
    "on the six, over eighty years, by serious people.",
};

const unkindled = {
  whatTheyAre:
    "Living things that stay near a wound too long do not die. They go out. The coast calls them " +
    "THE UNKINDLED. They stop reasoning, they stop speaking, they become dangerous to anything " +
    "warm, and they will not go into sunlight — not cannot, as far as anyone can tell, but will " +
    "not, the way you will not put your hand in a fire.",

  whatTheyWere:
    "Most of them were people, and a few of them were animals, and about the rest nobody agrees. " +
    "They keep things. A coat. A limp. A way of standing. Somebody in the village usually knows " +
    "which one is which, and does not say it out loud.",

  whereTheyStay:
    "Inside the wound, mostly. At night they come a little way out — never far, and never past " +
    "a fire that somebody is sitting beside. A wound is a place you do not go, not a thing that " +
    "comes for you.",

  theName:
    "Say an Unkindled's true name and it stops. It turns, and it looks at you, and for a few " +
    "seconds it does nothing at all. That is all that happens, and it is a great deal: it is " +
    "long enough to get past one, to get somebody away, to bury somebody.",

  andNoMore:
    "It is not a cure and it has never been one. Nobody has ever brought an Unkindled back — not " +
    "by name, not by talking, not by years of it. Whoever tells you otherwise is selling " +
    "something, and there is always somebody selling it.",

  whyItMatters:
    "Because every other silence on this coast answers to being spoken to, and this one answers " +
    "only for a moment. That is the thing that frightens people about the Unkindled, and it is " +
    "not the teeth.",
};

// ---------------------------------------------------------------------------
// WARDSTONES. The public face. What actually feeds one is Chapter 3.
// ---------------------------------------------------------------------------
const wardstones = {
  what:
    "A wardstone is a buried well of kindling — old, deep, and drawn on first. Burn inside the " +
    "walls and the stone pays before the street does, so a city can light ten thousand stoves at " +
    "dusk and nobody gets tired. Every one of the three cities is built around its stone, and " +
    "everybody knows where it is. In Ashlight it is under the market square, and children stand " +
    "on the flagstone over it to dare each other.",

  theHeartOfTheCity:
    "Nobody knows how a wardstone fills. Nobody has any record of one being made, and the Bell " +
    "House archive — which has a paper for everything — has no paper for that. What people say " +
    "instead is that the wardstone is the heart of the city, and they say it the way you say a " +
    "thing that is obviously true and has never been examined.",

  andWhyTheRoadIsFrightening:
    "Villages mostly have no stone. Out there a burn is paid for by the place and the people in " +
    "it, immediately and visibly. That is why a village healer who burns to save lives is the " +
    "hardest problem on this coast rather than a simple hero: she is keeping them alive by " +
    "spending the thing that keeps them alive, and she knows it, and she does it anyway.",

  theLadderInWords:
    "The four rungs are not a scale of power. They are a scale of how much of a place you are " +
    "spending, and that is why they are the same four words in a law book and in a kitchen. " +
    "A spark is an hour of a room. A taper is a day of a street. A lantern is a season of a " +
    "district. A pyre is more than anywhere has.",

  thePyre:
    "There has been one pyre in living memory and it is the reason everything on this coast is " +
    "the way it is. No Warrant for a pyre has ever been issued, no Warrant for one exists to be " +
    "issued, and the Concord's own charter does not describe the procedure for issuing one — " +
    "which lawyers in Bellmoor will tell you is not the same as forbidding it.",
};

const fallow =
  "You cannot put kindling back. It returns on its own or it does not, and the only thing anyone " +
  "can do is stop taking. Villages therefore rotate where they burn, the way they rotate what " +
  "they plant, and they call it letting the ground LIE FALLOW. Nobody thinks of this as magic. " +
  "They think of it as not being stupid.";

const theSeaLoophole =
  "The sea holds more kindling than anybody could spend, and this is the largest hole in the " +
  "Concord. On the water a burn costs nothing anyone can notice. Why does the whole coast not " +
  "live on boats? Because a burn pulls from where you ARE: a hundred yards inland and you are " +
  "spending the shore again. So harbour towns cheat, everybody knows they cheat, and Saltgate " +
  "is rich.";

// ---------------------------------------------------------------------------
// THE CONCORD
// ---------------------------------------------------------------------------
const concord = {
  inOneLine:
    "The Concord is a treaty between three frightened cities, eighty years old, with an archive, " +
    "a seal, and no army.",

  what:
    "After the fourth city stopped, the three that were left did the only thing three " +
    "half-ruined cities can do: they met, and they signed something. The document is called the " +
    "Concord of the Three Bells and the original is in Bellmoor, in a case, and school children " +
    "are taken to look at it. It says, in far more words, one thing: from now on nobody burns " +
    "above a spark without a paper, and the paper is issued by us, together, and none of us " +
    "issues it alone.",

  whatItIsNot:
    "It is not a kingdom, a church, or a guild of mages. Its inspectors are not better at " +
    "burning than a fishwife — several of them cannot raise a spark at all, and one of those is " +
    "famously proud of it. It owns no soldiers. It cannot arrest anybody: a Warden who wants " +
    "somebody held has to ask the city guard, in that city, and be given it. Everything the " +
    "Concord has, it has because the three cities keep agreeing that it should.",

  whatYouSeeOfIt: [
    ["The Grey Stair, Bellmoor", "Where you queue for a Warrant. Four flights, a bench on each landing, and a clerk at the top who has heard your explanation before."],
    ["The Bell House", "The archive. Every Warrant ever issued, every burn ever reported, every failure ever recorded. Nine clerks, one Archivist-General, and a smell of wet paper."],
    ["The seal", "Dark red wax, a bell over three lines. Faked constantly and badly. A real one has a thumbprint pressed into the back of it, because the clerk who seals it is answerable for it."],
    ["The Wardens", "Inspectors, not soldiers. Three of them for a hundred miles of road. They travel, they ask, they write things down, and they carry no weapon beyond whatever anybody carries on that road."],
    ["The Assize", "Four times a year, in each city, in public. Where Warrants are granted, challenged and revoked, in front of whoever wants to sit in. Anybody may speak. Most people do."],
  ],

  theWarrant:
    "A Warrant is a folded card of grey paper about the size of a hand. On it: your name, the " +
    "rung you are licensed to — written in words, never numbers — what you are licensed to do " +
    "with it, the name of the person who has signed to answer for you, and the date it dies. " +
    "You carry it in a wallet with your other papers, you show it at gates, and it gets wet and " +
    "soft at the folds. A plain Warrant is signed by one clerk. A sealed Warrant needs a " +
    "second name on it, and that second person is liable for what you do — which is why asking " +
    "somebody to sign for you is one of the largest things you can ask of anybody here.",

  whyPeopleObeyIt:
    "Not fear of the Wardens. People obey it because their grandmother told them what the week " +
    "before the Hush felt like, because everybody has walked past a fence around a wound, and " +
    "because a Warrant is also a receipt: it is the thing you produce when your neighbour's roof " +
    "falls and somebody wants to know who burned near it.",

  whyPeopleHateIt:
    "Because it is slow, because it is issued in Bellmoor to people who can get to Bellmoor, and " +
    "because the road between the villages and the Grey Stair is four days long and a broken leg " +
    "does not wait four days. Every argument on this coast that matters is a version of this one.",

  theHonestVersion:
    "Warden Alder is right that the licence is what stands between the coast and another Hush. " +
    "Hesper Vane is right that the licence has never once been on time. Neither of them is " +
    "lying and neither of them is the villain, and a table that understands that has understood " +
    "the Tallow Coast.",
};

// ---------------------------------------------------------------------------
// THE LAW. The crime is not burning.
// ---------------------------------------------------------------------------
const theLaw = {
  headline: "It is not illegal to burn. It is illegal to burn with nobody answering for it.",
  body:
    "The offence in the charter is BURNING UNANSWERED: a burn above a spark with no name " +
    "attached to it. This is the only kind of law a treaty without soldiers can actually write. " +
    "The Concord does not stop you doing anything. It makes you answerable for what you did.",
  theUseful:
    "Which means burning in the wild and REPORTING it afterwards to the nearest clerk is a fine " +
    "and a note in the Bell House. Burning in the wild and saying nothing, and being found out, " +
    "is a different matter entirely. The world rewards people who say what they did.",
  whatStopsYouAnyway:
    "Nothing stops you going somewhere remote and burning. But somewhere remote is somewhere " +
    "with no wardstone, so it costs more, and you sleep in what you spent. The mark stays a " +
    "season and shepherds talk. The real detection network on this coast is not three Wardens: " +
    "it is gossip.",
  penalties: [
    ["A fine", "Set at the Assize, collected by the city, not by the Concord."],
    ["Struck from the roll", "Your Warrant is revoked and nobody may sign for you. On a coast where half the trades need a taper, this is professional death — and anybody who signs for a struck person becomes liable with them, which makes you radioactive."],
    ["The Naming", "Your name read aloud at the Assize and entered in the Bell House. There is no force behind it at all. It is a punishment made entirely of reputation, which is the only kind a treaty can impose."],
    ["Unanswerable", "Declared by the three cities together. No city gate admits you. It is exile without an army — three gatekeepers and a list."],
  ],
};

// ---------------------------------------------------------------------------
// HOW THE CONCORD INVESTIGATES
// ---------------------------------------------------------------------------
const investigation = {
  whoDoesWhat:
    "The Warden finds out and writes it down. The Assize decides, in public. The city guard, if " +
    "it agrees, does the holding. Three jobs, three sets of hands, and the Concord only has the " +
    "first.",
  wardCandle:
    "Every Warden carries a stub of ordinary tallow candle in a sealed glass tube. In a healthy " +
    "place it burns normally. Where the kindling is low it burns badly — gutters, will not take, " +
    "goes out. Inside a wound it will not light at all. It is crude, it is arguable, and " +
    "everybody on the coast knows what it means when a Warden takes the tube out of his coat.",
  wickbornReaders:
    "A Wickborn feels that burning has happened nearby and roughly how much — never who, never " +
    "why, never what it did. The Concord wants that badly and does not have enough Wickborn of " +
    "its own, so Wardens travel with a READER: hired by the job, not a Warden, paid in coin and " +
    "resented in three villages out of four. Being Wickborn on this coast means being asked.",
  whatAReaderCannotDo:
    "The Old Sense is a sense for EVENTS. It works best in an empty room, hours after everybody " +
    "has gone, and it will tell a Warden that somebody spent a taper's worth of this street last " +
    "night. It will not tell him which of the nine people in the tavern did it. A green flame is " +
    "the opposite instrument: it reads the LIVING, in front of you, now, and says nothing " +
    "whatever about what was burned here. The Concord would give a great deal for one person who " +
    "could do both, and has never found one — a Wickborn who is also green flame is the most " +
    "expensive hire on the coast, and there are fewer than ten.",
  theMethod:
    "A Warden does not interrogate. He asks the same short list of questions of several people " +
    "and lays the answers side by side. What did you notice? When? Who told you that? Did you " +
    "see it, or were you told? And he writes what he was told beside what he saw, and marks " +
    "which is which — the same thing Keeper Marrow does at her stone, for the same reason.",
};

// ---------------------------------------------------------------------------
// THE HUSH
// ---------------------------------------------------------------------------
const hush = {
  whatEverybodyKnows:
    "Eighty years ago there was a fourth city, inland, at the end of the road where nothing is " +
    "now. Somebody there lit a pyre. The city was not destroyed and nobody found bodies. It " +
    "stopped. It is still standing, doors on their hinges, washing on the lines, and nothing in " +
    "it moves.",

  notAWound:
    "The Hush is not a big wound, and this is the detail that keeps old people awake. A wound is " +
    "slow, and it has the Unkindled in it. The Hush happened in an afternoon, and there is " +
    "nothing in it at all. Whatever took a whole city's kindling at once did not leave what a " +
    "wound leaves, and nobody has ever explained why.",

  theEdge:
    "You can walk to the edge of it, and people have. The edge is not a wall and not a line on " +
    "the ground; it is a place where the road gets very quiet and then quieter. Everyone who has " +
    "gone in has come back. Every one of them came back less willing to talk, and the ones who " +
    "went furthest in stopped talking altogether for a while. Talking is what brings them back. " +
    "Nobody knows why that is true and everybody on the coast knows that it is.",

  theName:
    "Nobody agrees what the fourth city was called. The Concord files it as Site Nine, which is " +
    "an archive number and everybody knows it. The coast calls it Cinder, which is a nickname " +
    "and everybody knows that too. Old people from Stonewake families will tell you both of " +
    "those are wrong and then change the subject. One person alive knows the real name and will " +
    "not say it, and her reason is not that it is dangerous: it is that nobody has yet asked her " +
    "the right way.",

  whyItMattersEveryDay:
    "It is not a legend on this coast. It is the reason the paperwork exists, the reason the " +
    "inland road has no traffic, the reason there is a standing stone on the coast road with " +
    "names cut into it, and the reason a stranger who says the words 'I only need a taper' gets " +
    "a different look here than they would anywhere else.",
};

// ---------------------------------------------------------------------------
// THE THREE CITIES AND THE ROAD
// ---------------------------------------------------------------------------
const places = [
  {
    name: "Ashlight",
    line: "The smallest of the three, the busiest gate, and the one the campaign begins in.",
    prose: [
      "Ashlight is walled, grey, and far more crowded than it ought to be, because the coast road " +
      "bends inland here to get around the marsh and everything travelling the coast has to come " +
      "through. It is a city of about nine thousand people that handles the traffic of a city " +
      "three times the size, and it has the temper you would expect.",

      "You arrive at the Coast Gate, which is the only gate that matters and the one Oren keeps. " +
      "The queue is always there. Inside, the street opens straight into the Ash Market, which is " +
      "the whole of Ashlight's public life in one square: fish, rope, mutton, candles, a " +
      "letter-writer, two arguments. Under the middle of it, beneath a flagstone worn smooth and " +
      "slightly paler than the ones around it, is the wardstone. Children stand on it on a dare. " +
      "Nothing happens to them and that is the point of the dare.",

      "Off the market run the three streets anybody will name for you. TAPER ROW is where the " +
      "licensed burners keep their shops, each with its Warrant nailed up behind the counter " +
      "under glass, and a queue of people who need a bone set or a door made to stay shut. " +
      "FOUNDRY LANE is the Emberkin quarter and the loudest place in the city. And THE WICK is " +
      "the rendering district, downwind by law and upwind in practice whenever the weather turns, " +
      "which is the thing people from Ashlight complain about instead of the weather.",

      "The city is run by the Nine Hands — the heads of nine guilds, who meet above the market " +
      "and who are not a government so much as nine people who have to keep getting along. They " +
      "will not help you. Any one of them might.",

      "Once a year, at the end of the harvest, the road fills up and the city doubles for a week: " +
      "the HARVEST FAIR. Every village on the coast road comes in to sell, drink, marry and " +
      "argue. It is the only fixed festival on this coast and everything else about the calendar " +
      "is yours.",
    ],
  },
  {
    name: "Bellmoor",
    line: "The largest, the richest, the middle of the road, and the seat of the Concord.",
    prose: [
      "Bellmoor sits where the river meets the coast road, on both banks, joined by the Long " +
      "Bridge, which has shops on it and a toll nobody has successfully argued their way out of. " +
      "It is loud, wealthy, and built out of the fact that every decision made about this coast " +
      "is made here. If Ashlight is nine thousand people who all know each other, Bellmoor is " +
      "forty thousand who do not.",

      "Three bells are rung at dawn, one for each surviving city, and they have been rung every " +
      "morning for eighty years. Visitors find it moving. People who live here find it early.",

      "The Concord occupies the hill. The BELL HOUSE holds the archive, and behind it is the " +
      "GREY STAIR, four flights of it, where the coast queues for its Warrants — a bench on every " +
      "landing, worn to a shine, and on those benches is where half the business of this coast " +
      "actually gets done. Below the hill is the HOLLOW YARD: a walled garden, burned deliberately " +
      "empty two generations ago and kept that way, where the Concord takes people who need to be " +
      "shown what ground with nothing left in it feels like. Twenty minutes, free, and the most " +
      "unpleasant thing available on the Tallow Coast that will not actually hurt you.",

      "Bellmoor is where an argument is won on this coast, and it is won in public, at the Assize, " +
      "in front of people. A table that likes talking will spend a lot of time here.",
    ],
  },
  {
    name: "Saltgate",
    line: "The last city before the road ends. A port, and the place people go to stop being asked things.",
    prose: [
      "Saltgate is the end of the coast road and the beginning of everywhere else. It has the " +
      "harbour, the salt pans, and the tallow works that supply half the ships on this sea, and " +
      "it smells like all three at once. The wind is constant. Everything is slightly crusted.",

      "The city works at night, because the tides do. The TIDE MARKET opens when the boats come " +
      "in and closes at dawn, and it is the only market on the coast where nobody asks where " +
      "anything came from. Behind it are THE GULLETS, a district of alleys narrow enough to " +
      "touch both walls, where the rule is that if you are lost you are somewhere you were not " +
      "invited. Along the seafront runs the SALT WALK, which is where the money lives, and where " +
      "Envoy Calla Wren keeps a set of rooms and receives people who want something from the " +
      "three cities at once.",

      "Saltgate's relationship with the Concord is a shrug, and it can afford to be, because of " +
      "the water: out on the sea a burn costs nothing anybody can feel, and the Concord has no " +
      "stone, no clerk and no standing past the harbour wall. Everyone knows. Nobody has ever " +
      "worked out what to do about it.",

      "People with a reason to stop being asked questions come here, and the city has made an " +
      "industry of not asking them. That cuts both ways and everyone in Saltgate knows it.",
    ],
  },
  {
    name: "The Coast Road, and the villages",
    line: "Days, not hours. The part of the world the students will fill in.",
    prose: [
      "It is four days from Ashlight to Bellmoor at a cart's pace and five from Bellmoor to " +
      "Saltgate, and the road is patrolled by whoever happens to be patrolling. It is not " +
      "lawless. It is unattended, which on a coast where burning spends the place you are " +
      "standing in is a different and more interesting problem.",

      "Villages line it. There are no wardstones out here, and so out here the licence stops " +
      "being paperwork and becomes the question the whole campaign is about: the nearest sealed " +
      "Warrant is four days away, the child's fever is tonight, and the only person who can help " +
      "will be spending the village's own kindling to do it.",

      "Two fixed things stand on this road. FENNY CROSS is a wetland village of about sixty " +
      "people where Hesper Vane burns tapers she has no licence for and keeps everyone alive. " +
      "And a day north of Ashlight, where the road passes a broken wall, is the MARROW STONE: a " +
      "standing stone with names cut into it, four hundred and some, all of them from the fourth " +
      "city, added over eighty years by anybody who remembered one. Keeper Marrow tends it, and " +
      "has for longer than seems possible, and she writes down what she is told beside what she " +
      "saw, and marks which is which.",

      "Everything else on this road is deliberately blank, and blank is not the same as empty. " +
      "How many villages there are, what they are called, who keeps the inn, which festival is " +
      "local to where, what the superstition is about crossroads — none of that is written " +
      "anywhere, because it belongs to whichever player is holding the lantern.",
    ],
  },
];

// ---------------------------------------------------------------------------
// EVERYDAY LIFE
// ---------------------------------------------------------------------------
const everyday = [
  ["What it smells like", "Tallow smoke, salt, wet wool and fish, in proportions that tell you which city you are in. A burn smells like a snuffed candle, which is to say like everything else."],
  ["What people eat", "Mutton, oats, hard cheese, whatever came out of the sea that morning, and a great deal of small beer. Fresh fruit is a coastal luxury and an inland impossibility."],
  ["What people wear", "Layers, oiled wool, and boots waterproofed with the local product. Fashion on this coast is entirely about how new your coat is allowed to look."],
  ["How money is spoken", "In rungs, never in sums. A sword costs two handfuls. Nobody on this coast does arithmetic out loud, and a person who does is either a Bellmoor clerk or lying."],
  ["What people swear by", "The Six, who made the world and left. Mostly the Ledger, because this is a coast of contracts, and the Stranger, because this is a coast of weather."],
  ["What a promise is", "\"On the Ledger\" is the binding one, and it is said in front of a witness. Breaking one is not illegal and is not forgotten."],
  ["What children are taught", "Not indoors. It is the first thing anyone hears about burning and it is about spoiling the kitchen, not about danger."],
  ["What people fear", "Not monsters. A room that feels like somebody just left it."],
  ["Who refuses to burn", "Some Stonewake families, above a spark, ever, on principle. It is not religion and not law. It is eighty years of grief that turned into a habit."],
  ["What the Hush is called in company", "Cinder, usually, and quickly, and then something else. Saying Site Nine out loud marks you as Concord. Asking for the real name marks you as either a scholar or a problem."],
];

// ---------------------------------------------------------------------------
// WHAT IS DELIBERATELY BLANK
// ---------------------------------------------------------------------------
const blanks = {
  rule:
    "Everything above is fixed and will not be contradicted. Everything below is not written " +
    "down anywhere, on purpose, and the first person to describe it decides it — usually a " +
    "player, holding the lantern.",
  list: [
    "How many villages there are on the coast road, and what they are called.",
    "What Ashlight looks like off the three named streets, and who keeps which stall.",
    "Any festival except the Harvest Fair.",
    "Local superstitions, sayings and what is considered bad luck where.",
    "Every character's home town — including whether it is on the coast at all.",
    "Five of the six wounds: only their number is fixed. Names, places and what is fenced off where are open.",
    "Whether there are unregistered wardstones. Nobody has written an answer to this and nobody should, yet.",
    "What is on the other side of the sea. Ships come from there. Nobody has written it.",
  ],
};

// ---------------------------------------------------------------------------
// THE FOUR FLAMES — 20/09/2026. The tables live in tallow-coast.js; this is
// what a person on the coast would tell you about them.
// ---------------------------------------------------------------------------
const theFlames = {
  headline:
    "Everybody is born with a colour. Almost nobody has ever seen their own.",
  whatItIs:
    "Burning is one thing, but it does not come out of two people the same way, and the coast " +
    "has known that for as long as it has known anything. What comes out of you has a colour — " +
    "red, yellow, blue or green — and it is the colour you were born with. It is not a talent " +
    "and not a rank. A red flame is not stronger than a yellow one. It is the SHAPE the burning " +
    "takes when it leaves you, the way a voice has a register before it has anything to say.",
  born:
    "You do not choose it, you cannot trade it, and nothing anybody has tried has ever changed " +
    "one. Children are usually placed by about six, from what they do without being taught: the " +
    "one who steadies the ladder, the one who is at the door before the knock, the one who picks " +
    "up a broken cup and says who broke it, the one who knows the weather is turning. Families " +
    "make far too much of this and are wrong about it roughly a third of the time.",
  invisible:
    "A flame is not an object and there is nothing to look at. It sits in a person the way a key " +
    "sits in a piece of music — everywhere in it, nowhere you can point to. No instrument has " +
    "ever measured one. No burn reveals one. The one exception is the green: a green flame can " +
    "look at a person and simply see the colour, the way you see that somebody is left-handed " +
    "once you have watched them write.",
  nobodySeesTheirOwn:
    "Including the green. A green flame can read the whole room and not themselves, which is a " +
    "joke on this coast and also, in three villages, a proverb.",
  theLaw:
    "The colour decides what KIND of thing you can do. The rung decides HOW MUCH of it. Red " +
    "holds: at a spark it holds the cup on the cart for a moment, at a taper it holds your own " +
    "forearm or the patch of door under your hand, at a lantern it holds the gate of a city with " +
    "nobody touching it. That is one idea at three sizes. It is not three powers, and a person " +
    "who has climbed to a lantern has not become a different sort of person — they have become " +
    "able to hold more of the same thing at once.",
  whyItMatters:
    "So the question a burner is asked on this coast is never what can you do. It is two " +
    "questions: what colour, and how high — and the second one is the one that needs a paper.",
  notLineage:
    "Flame has nothing to do with people or lineage, and everybody muddles the two anyway. A " +
    "Wickborn can be any colour. A Greenkept can be any colour, and the name does not help. " +
    "There are Duskborn families who will tell you their line runs blue, and the Bell House has " +
    "four generations of records that say it does not.",
  theNativeTaper:
    "Your colour reaches exactly one taper on its own, with nobody teaching you and no trade " +
    "behind it. The coast calls it your own taper, and it is the same for every person of that " +
    "colour on the coast: red reinforces, yellow carries a sentence, blue reads a made thing, " +
    "green takes in everything at once. Everything ELSE at that rung — setting a bone, sealing a " +
    "lock, reading tomorrow's weather off today's — is a trade, and takes years in a shop, and " +
    "is why Taper Row is a street of shops and not a guild hall. Same rung. Different training. " +
    "A bone-setter of forty years' standing and a farmhand who has never been taught anything " +
    "are both, technically, taper burners, and the bone-setter finds that funny about once a year.",
  whatPeopleSay:
    "The coast has opinions about colours and most of them are rubbish. Red flames make soldiers. " +
    "Yellow flames cannot keep a secret. Blue flames are thieves, or they are clerks, depending " +
    "on who is speaking. Never trust a green at a market. A Concord clerk is not allowed to " +
    "record a flame colour on a Warrant, and the reason given in the Concord's own hand, eighty " +
    "years ago, was that it would be used for exactly this.",
  forTheTeacherOnly:
    "Four colours, four Focuses, four grammars. Red pulls obligation and duration — it has to " +
    "hold until we are across. Yellow pulls one careful composed sentence and then reported " +
    "speech — I told her that. Blue pulls the past and deduction — someone had repaired this " +
    "before. Green pulls description and prediction — it is going to turn before dark. That is " +
    "the whole reason there are four and not one, and you should never say it out loud.",
};

// ---------------------------------------------------------------------------
// WHAT THE PLAYERS ACTUALLY DO — the rules half, kept beside the world half so
// the two cannot drift apart. The tables (sparks, tapers, lanterns, the bands)
// are in tallow-coast.js -> flameSparks / flameTapers / flameLanterns /
// burningRoll. This is the prose that explains them.
// ---------------------------------------------------------------------------
const playerBurning = {
  theShortVersion:
    "Your character was born with a flame. A spark is free, small and never rolled. Your taper " +
    "is one roll, once a scene, and it can fail. A lantern is not something you have.",
  spark:
    "A spark costs nothing, needs no paper and is never rolled — so it can never solve the scene " +
    "and must never be allowed to. It is there so the world stays the world the rest of this " +
    "book describes: a coast where the cook lights the stove without standing up. Say what you " +
    "do, in English, in one sentence, and it happens.",
  taper:
    "A taper is a real act, it needs a Warrant or it is Burning Unanswered, and it rolls. Roll " +
    "2d6 and add the Focus that matches your flame — Courage for red, Empathy for yellow, Wit " +
    "for blue, Instinct for green. Read it against the same three bands as everything else.",
  notAMove:
    "⚠ This is not one of the six Moves and it does not replace one. It is its own roll, and it " +
    "is the only other roll in the game. A character who reinforces a door has not Faced the " +
    "Danger; they have burned. If Facing the Danger is also the right thing to do, it is a " +
    "second roll.",
  theMiss:
    "On a miss the burn fails and the place is spent anyway. Say so, out loud, at the table: the " +
    "room is colder, the burn did not take, and the street has less in it than it had a minute " +
    "ago. Nothing else in this game teaches what burning costs as fast as one wasted taper does.",
  theScene:
    "You get one taper a scene. A scene is not a session: a scene can take up most of a session, " +
    "or run across two or three of them, and it ends when the table's attention moves — a new " +
    "place, a new day, a decision made and acted on. The GM says when it ends, out loud, in a " +
    "line everybody learns to recognise, and everybody's taper comes back with the new scene.",
  theSceneForTheGM:
    "Say it the same way every time so the players can hear it coming. Something like: THAT IS " +
    "WHERE THIS ONE ENDS — take a breath, and tell me where you are. It is a bell, not a rule, " +
    "and it does two jobs at once: it hands the tapers back and it tells four students that the " +
    "unit of the story is the SCENE, which is also the unit of the lesson.",
  languagePoints:
    "A Language Point rerolls a burning roll exactly as it rerolls a Move — both dice, never one. " +
    "That is the whole economy. There is nothing to buy a second taper with, and that is on " +
    "purpose.",
  lanterns:
    "The lantern of each colour is printed in this book and in the Player's Guide, and no player " +
    "character is going to reach one. A lantern needs a sealed Warrant, which needs a named " +
    "person who has signed to be liable for you, which is not a rule — it is a story about " +
    "somebody trusting you that much. If a table ever gets there, it will be because they earned " +
    "it in fiction, and by then you will know it.",
  whenTheyLearn:
    "Sparks from Session Zero: a five-year-old on this coast can do it and it would be absurd to " +
    "lock it. Tapers are UNLOCKED at the end of Arc 1, Adventure 2 — after the Warrant in " +
    "Adventure 1, and after The Empty Taper has shown them three burns failing in the same street " +
    "for no reason anyone will explain. Permission first, then the cost, then the power. Those " +
    "two adventures with sparks only are exactly the time it takes for the spark to become a habit.",
  whoTeaches:
    "Hesper Vane, if she is alive and free. She keeps Fenny Cross going on unlicensed tapers and " +
    "she knows to the ounce what she is spending; teaching four strangers is the most dangerous " +
    "and most in-character thing she can do. If Arc 1 went badly for her, it is the licensed " +
    "burner on Taper Row instead, and it costs a favour the table will be paying off in Arc 2.",
};

// ---------------------------------------------------------------------------
// THE GLOSSARY — asked for on 18/09/2026, and overdue.
// Categories: place · burning · law · peoples · the past · people
// Printed in full in the Door Book and in the Player's Guide.
// ---------------------------------------------------------------------------
const glossary = [
  // --- burning ------------------------------------------------------------
  ["Burning", "burning", "The old magic. Common, domestic, and nearly invisible: a brief warmth, a pressure behind the ears, and the smell of a snuffed candle."],
  ["The kindling", "burning", "What a place holds and a burn spends. It returns on its own, slowly. Thickest where there is most life; thin on bare ground."],
  ["A spark", "burning", "One intention, one thing, right now. No paper. Anyone may."],
  ["A taper", "burning", "A held structure — a bone, a lock, a fever. A plain Warrant. About a day of a street."],
  ["A lantern", "burning", "More than one person normally holds, usually done by several speaking together. A sealed Warrant. About a season of a district."],
  ["A pyre", "burning", "More than anywhere has. There is no Warrant for one and there never has been."],
  ["Wardstone", "burning", "A buried well of kindling under each of the three cities. It pays before the street does. Called the heart of the city; nobody knows how it fills."],
  ["Sour", "burning", "Ground burned faster than it replaces. Burns fail, milk turns, bread will not rise, people tire early. Recovers in a season if left alone."],
  ["Hollow", "burning", "Years of sour. Nothing grows, animals leave, burning does not work. Recovers in a generation, if at all. Bellmoor keeps one on purpose."],
  ["A wound", "burning", "Ground that has stopped recovering. Dusk at noon, cold in summer, no flame will take, no animals. Six are known on the coast. None has ever been healed."],
  ["The Unkindled", "burning", "What living things become if they stay near a wound. No reason, no speech, dangerous, and unwilling to enter sunlight. Their true name stops one for a few seconds. Nothing has ever brought one back."],
  ["Lying fallow", "burning", "Not burning a place so it can come back. Village practice, rotated like crops, and thought of as sense rather than magic."],
  ["A flame", "burning", "The colour a person's burning comes out in — red, yellow, blue or green. Born with, never changed, invisible, and nothing to do with lineage."],
  ["Red flame", "burning", "Courage. Burning that HOLDS. Its own taper is Reinforce."],
  ["Yellow flame", "burning", "Empathy. Burning that CARRIES. Its own taper is Message."],
  ["Blue flame", "burning", "Wit. Burning that READS WHAT WAS MADE. Its own taper is Imprint."],
  ["Green flame", "burning", "Instinct. Burning that READS WHAT IS ALIVE — including the colour of a flame in front of you. Its own taper is Senses."],
  ["Your own taper", "burning", "The one taper your colour reaches with no trade behind it. Everything else at that rung is learnt in a shop, over years."],
  ["Reinforce", "burning", "Red taper. Part of your body, or a small area of something you are touching, becomes very hard to break. It ends when you let go."],
  ["Message", "burning", "Yellow taper. One sentence reaches one person you have met, wherever they are. They hear your voice and cannot answer."],
  ["Imprint", "burning", "Blue taper. Touch a made thing and learn one true fact about who made it, who carried it, or how it broke."],
  ["Senses", "burning", "Green taper. A few seconds of everything at once — sky, wind, the worn ground that means passage — and the flame colour of everyone in sight."],
  ["Ward-candle", "burning", "A tallow stub in a sealed glass tube, carried by every Warden. It burns badly where the kindling is low and will not light inside a wound."],

  // --- law ----------------------------------------------------------------
  ["The Concord", "law", "The treaty between the three cities, signed eighty years ago, and the body that runs it. An archive, a seal, inspectors, and no soldiers."],
  ["Concord of the Three Bells", "law", "The document itself. The original is in Bellmoor, in a case."],
  ["Warrant", "law", "The licence. A folded grey card: your name, your rung in words, what for, who answers for you, and when it dies. Plain = one clerk. Sealed = a second name, liable for you."],
  ["Warden", "law", "A Concord inspector. Investigates and writes; does not arrest. Three of them for a hundred miles of road."],
  ["Reader", "law", "A Wickborn hired by the job to travel with a Warden and say whether burning happened here. Not a Warden, and not popular."],
  ["The Assize", "law", "Public court, four times a year in each city. Warrants granted, challenged and revoked. Anybody may speak."],
  ["Burning Unanswered", "law", "The actual offence: burning above a spark with nobody's name attached. Not burning — burning that no one answers for."],
  ["Struck from the roll", "law", "Warrant revoked, and nobody may sign for you. Professional death, because whoever signs for you is liable with you."],
  ["The Naming", "law", "Your name read aloud at the Assize and written in the Bell House. A punishment made only of reputation."],
  ["Unanswerable", "law", "Declared by the three cities together: no gate admits you. Exile without an army."],
  ["The Bell House", "law", "The Concord archive in Bellmoor. Every Warrant, every reported burn, every recorded failure."],
  ["The Grey Stair", "law", "Four flights behind the Bell House where the coast queues for Warrants. Half the business of this coast is done on its benches."],
  ["The Hollow Yard", "law", "A walled garden below the Concord hill, burned empty on purpose and kept that way, where people are shown what hollow ground feels like."],

  // --- the past -----------------------------------------------------------
  ["The Hush", "the past", "The fourth city, which stopped eighty years ago when somebody lit a pyre. Still standing. Nothing in it moves. It is not a wound and has none of a wound's marks."],
  ["Site Nine", "the past", "The Concord's file number for the fourth city. Saying it out loud marks you as Concord."],
  ["Cinder", "the past", "What the coast calls the fourth city. A nickname, and known to be wrong."],
  ["The Marrow Stone", "the past", "A standing stone a day north of Ashlight with four hundred and some names cut into it, all from the fourth city. Keeper Marrow tends it."],

  // --- place --------------------------------------------------------------
  ["Ashlight", "place", "The smallest of the three cities and the busiest gate. Where the campaign begins."],
  ["Bellmoor", "place", "The largest, the richest, and the seat of the Concord. Three bells at dawn, one for each surviving city."],
  ["Saltgate", "place", "The port at the end of the road. Works at night, asks no questions, and cheats on the water."],
  ["Fenny Cross", "place", "A wetland village of sixty on the coast road, kept alive by Hesper Vane's unlicensed tapers."],
  ["The Coast Road", "place", "Four days Ashlight to Bellmoor, five Bellmoor to Saltgate. Not lawless — unattended."],
  ["Inland", "place", "Where the road gives up. Nobody goes. This is where the Hush is."],

  // --- peoples ------------------------------------------------------------
  ["Wickborn", "peoples", "A people who feel that burning has happened nearby and roughly how much. Never who, never why, never what it did."],
  ["Greenkept", "peoples", "A people who can tell how long a place has been as it is. Never a date."],
  ["Duskborn", "peoples", "A people who see in poor light as others see at dusk, and whose eyes tire in full day."],
  ["Stonewake", "peoples", "A human lineage descended from those who left the fourth city before it stopped. Uneasy in places that are too quiet, and many of them will not burn above a spark."],
  ["Fenfolk", "peoples", "A human lineage of the inland wetlands. Herbalists, midwives, bone-setters — and where the Concord has licensed nobody, what stands between a village and the burying ground."],

  // --- people -------------------------------------------------------------
  ["Oren", "people", "Gatekeeper of Ashlight. Tired and correct. Asks for papers, and asks again."],
  ["Keeper Marrow", "people", "Tends the Marrow Stone. Writes what she was told beside what she saw, and marks which is which. Knows the fourth city's name and will not say it."],
  ["Warden Alder", "people", "Concord inspector. Polite, inflexible, and not a villain. He believes the licence is what stands between the coast and another Hush."],
  ["Envoy Calla Wren", "people", "Speaks for the coast cities. Never says no; says that would be difficult."],
  ["Hesper Vane", "people", "Burns without a licence and keeps Fenny Cross alive on it. Knows exactly what she is spending."],
  ["The Six", "people", "The gods who made the world and left: the Wright, the Ferryman, the Ledger, the Green Mother, the Watcher, the Stranger. They answer nothing. They supply idiom."],
];

// ---------------------------------------------------------------------------
// THE STUDENT EXTRACTS
// ---------------------------------------------------------------------------
const student = {
  opening: readAloud,
  flames: [
    theFlames.whatItIs,
    theFlames.born,
    theFlames.invisible,
    theFlames.theLaw,
    theFlames.notLineage,
    theFlames.theNativeTaper,
    theFlames.whatPeopleSay,
  ],
  burning: [
    burning.whatItIs,
    burning.whatItLooksLike,
    burning.whatItCosts,
    burning.whereKindlingIs,
  ],
  concord: [
    concord.inOneLine,
    concord.what,
    concord.whatItIsNot,
    concord.theWarrant,
    concord.whyPeopleHateIt,
  ],
  hush: [
    hush.whatEverybodyKnows,
    hush.notAWound,
    hush.theEdge,
    hush.theName,
  ],
  closing:
    "That is the coast as everybody on it understands it. What is under the kindling, who is " +
    "doing something about it, and what the fourth city was actually called are not in this " +
    "book — and not because we are teasing you. They are the parts your table finds out by " +
    "playing.",
};

module.exports = {
  readAloud, burning, theRungRule, accidents, learning,
  depletion, depletionNote, wounds, unkindled,
  wardstones, fallow, theSeaLoophole,
  concord, theLaw, investigation, hush,
  places, everyday, blanks, glossary, student,
  theFlames, playerBurning,
};
