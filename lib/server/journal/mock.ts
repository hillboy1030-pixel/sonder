// Sample journal content for local development and the sample PDF, written by
// hand in Ember's voice for a sample person (steady, warm, carries a lot,
// helps everyone, rehearses hard conversations). Pools repeat to fill 90 days.

import { WEEKS, type DayKind, type JournalContent, type JournalDay } from "@/lib/journal/types";

type Shared = Pick<JournalContent, "firstName" | "hope" | "retake" | "carry" | "words" | "books" | "care">;
type Part = Partial<Omit<JournalDay, "day" | "kind">>;

const POOLS: Record<DayKind, Part[]> = {
  practice: [
    { lesson: "We start by watching, not fixing. A trail you've walked a thousand times still has things on it you've never seen.", when: "When I say yes to anything today,", then: "I will make a small mark on my hand before I do it. Just count.", prompt: "How many marks? Which yes surprised you?" },
    { lesson: "You read a room faster than anyone in it. Today, read yourself first.", when: "When someone asks me how I am,", then: "I will pause for one breath and find the true word before I answer.", prompt: "What was the true word? Did you say it out loud?" },
    { lesson: "Tired isn't a character flaw. It's information.", when: "When my energy drops this afternoon,", then: "I will write down the time and what I was doing.", prompt: "What happened right before the drop?" },
    { lesson: "The voice that says \"just one more thing\" sounds like responsibility. Sometimes it's fear wearing a work shirt.", when: "When I'm about to add one more task to today,", then: "I will write it on a list instead of doing it.", prompt: "Look at the list. What would happen if none of it got done?" },
    { lesson: "Who are you when you walk into a room? And who are you two minutes before?", when: "When I arrive somewhere with people today,", then: "I will notice the exact moment my face changes.", prompt: "What did your face change into? Who taught it that?" },
    { lesson: "You rehearse hard conversations so many times the real one barely gets a turn.", when: "When I catch myself rehearsing a conversation,", then: "I will note who it's with and how many times I've run it.", prompt: "What are you afraid will happen if you say it once, plainly?" },
    { lesson: "People feel at ease around you. Do you feel at ease around you?", when: "When I'm kind to someone today,", then: "I will notice whether I'd say the same thing to myself.", prompt: "What would it sound like said to you?" },
    { lesson: "Patterns are loudest at the edges of the day.", when: "When I first wake up tomorrow,", then: "I will catch my first thought before I reach for my phone.", prompt: "Was the first thought about you, or about what you owe?" },
    { lesson: "Curiosity beats judgment. Every time.", when: "When I get frustrated with myself today,", then: "I will swap \"why did I do that\" for \"huh, interesting.\"", prompt: "What changed when you got curious instead of critical?" },
    { lesson: "You've been carrying this mask so long it fits. That doesn't make it your face.", when: "When I laugh today,", then: "I will notice whether I meant it.", prompt: "How many laughs were yours? How many were the room's?" },
    { lesson: "A pause isn't a no. It's room to choose.", when: "When someone asks me for something today,", then: "I will say \"let me check\" and wait an hour before I answer.", prompt: "What did the hour tell you about the yes you almost gave?" },
    { lesson: "Small honest moments build the muscle for big ones.", when: "When I'm about to smooth something over,", then: "I will say one true thing instead. Small is fine.", prompt: "How did they respond? How did you feel a minute later?" },
    { lesson: "You can do something well without doing everything.", when: "When I start my next task,", then: "I will do it at 80 percent, on purpose, and stop.", prompt: "Did anyone notice? Did you?" },
    { lesson: "Asking for help is a skill, not a confession.", when: "When I'm about to do something alone that someone could help with,", then: "I will ask them.", prompt: "What did asking cost you? What did it give you?" },
    { lesson: "Notice who you become when you're not trying to be useful.", when: "When I'm with someone I love today,", then: "I will spend ten minutes not fixing, planning, or helping anything.", prompt: "What was it like to just be there?" },
    { lesson: "The change becomes real when it gets boring. Boring is good.", when: "When the old pattern shows up today,", then: "I will do the new thing without making it a big deal.", prompt: "What felt ordinary today that didn't on day 1?" },
    { lesson: "The people closest to you have been climbing with you, whether they knew it or not.", when: "When I'm with someone close tonight,", then: "I will tell them one thing I've learned about myself this month.", prompt: "What did they say? Did it surprise you?" },
    { lesson: "Habits need a place to live, or they wander off.", when: "When I sit down tonight,", then: "I will choose one practice from these pages and decide exactly when it happens each week.", prompt: "What will remind you when the book is closed?" },
    { lesson: "Look how far up you've come. Now look at the view.", when: "When I have a quiet minute today,", then: "I will reread one page from the first week.", prompt: "What would you tell the person who wrote it?" },
    { lesson: "You did this one page at a time. That's how everything gets done.", when: "When I open this book tonight,", then: "I will thank myself, specifically, for one hard day in it.", prompt: "What did that day teach you?" },
  ],
  question: [
    { prompt: "Who would you be if nobody ever thanked you again?" },
    { prompt: "What are you protecting by staying this busy?" },
    { prompt: "If you stopped being useful for a week, who would still be there?" },
    { prompt: "What do you know that you keep pretending not to know?" },
    { prompt: "What part of you have you never let anyone meet?" },
    { prompt: "What are you waiting for permission to do?" },
    { prompt: "When did you last surprise yourself?" },
    { prompt: "What will you be glad you didn't wait for?" },
  ],
  mirror: [
    { lesson: "Today we look at other people, which is often the clearest way to see ourselves.", steps: ["Who bothered you today, even a little?", "What was the quality, in one word?", "Where does that quality live in you, even a small amount?"], prompt: "What would it look like to make peace with that part of you?" },
    { lesson: "The people who irritate us most are often carrying something we've put down too hard.", steps: ["Who did you judge today, out loud or quietly?", "What did they do that you'd never let yourself do?", "What would it cost you to do it, just once?"], prompt: "What did you learn about the rule you've been following?" },
    { lesson: "Admiration is a mirror too.", steps: ["Who did you envy or admire today?", "What exactly do they have, in one word?", "Where is that already in you, waiting?"], prompt: "What's one small way to let it out this week?" },
  ],
  dream: [
    { lesson: "Your mind keeps telling stories when you're not looking. Let's listen to one.", steps: ["Write down a dream from last night, or a daydream from today. Fragments are fine.", "Choose one figure, object, or place in it. Ask it a question.", "Write its answer without stopping to think."], prompt: "What might it be trying to tell you?" },
    { lesson: "Daydreams are where the parts of you that don't get airtime go to talk.", steps: ["Where did your mind wander today? Write the scene.", "Who were you in it?", "Ask that version of you what they need."], prompt: "What would it take to give them a little of it?" },
  ],
  honest: [
    { title: "Day one of four: what you carry", lesson: "For the next fifteen to twenty minutes, write about something hard you've been carrying. Your deepest thoughts and feelings about it. Don't worry about spelling or sense. Just keep the pen moving.", prompt: "How do you feel now, compared to before you started?" },
    { title: "Day two of four: what it touches", lesson: "Write about the same thing again, or something close to it. This time, follow it outward: how it touches your work, the people you love, the way you see yourself. Fifteen to twenty minutes.", prompt: "What did you write today that you didn't yesterday?" },
    { title: "Day three of four: what you've never said", lesson: "Write the part you've left out. The thought you skip past, the feeling under the feeling. Nobody will read this. Fifteen to twenty minutes.", prompt: "Was there a moment the writing got easier?" },
    { title: "Day four of four: what it means now", lesson: "One last time. Write about what this experience means to you now, and what you understand that you didn't on day one. Fifteen to twenty minutes.", prompt: "What do you want to carry forward from these four days?" },
  ],
  letter: [
    { title: "To the critic in your head", lesson: "That voice has had a lot to say for a long time. Today it gets a letter back. You'll never send it." },
    { title: "To you at fifteen", lesson: "They're still in there somewhere, trying hard. Tell them what you know now." },
    { title: "To someone you never thanked", lesson: "Someone helped make you who you are. Tell them exactly how. You don't have to send it." },
    { title: "To the work you do", lesson: "You've given it a lot of yourself. What do you want to say to it? What do you want back?" },
    { title: "To the person you're becoming", lesson: "Write to who you'll be a year from now. What do you want them to remember about right now?" },
  ],
  wild: [
    { lesson: "No challenge today. Walk somewhere with no destination for fifteen minutes and notice three things you've never seen before.", prompt: "What were the three things?" },
    { lesson: "Do one thing badly today. On purpose. Fold the laundry wrong. Send a text with a typo. Let it be.", prompt: "What did you feel? Did the world end?" },
    { lesson: "Eat one meal today with no screen, no rush, and no conversation about logistics. That's the whole assignment.", prompt: "What did you taste?" },
    { lesson: "Today, say no to one small thing you'd normally say yes to. Don't explain. Smile.", prompt: "What happened in your body when you said it?" },
    { lesson: "Go to bed thirty minutes early tonight. Not to sleep. Just to lie there and let the day go.", prompt: "What did your mind do with the extra time?" },
    { lesson: "Ask someone you love a question you've never asked them. Then just listen.", prompt: "What did you learn about them? About you?" },
    { lesson: "Spend ten minutes today doing something you loved as a kid. Draw, climb, build, sing. Nobody needs to see.", prompt: "Who showed up while you were doing it?" },
    { lesson: "Throw out the plan. Today, do whatever this page would least expect you to do. You'll know what it is.", prompt: "What did you choose, and why that?" },
  ],
  strength: [
    { lesson: "Your strength is perspective: you see the whole trail when others see their feet.", when: "When I finish a hard conversation today,", then: "I will use that perspective on myself, the way I would for a friend.", prompt: "What did you see when you stepped back?" },
    { lesson: "You're kind in a way people remember for years.", when: "When I'm hard on myself today,", then: "I will aim that kindness inward for one full minute.", prompt: "How long did you last? A little is enough." },
    { lesson: "You stay. When things get hard, you're the one who stays.", when: "When I want to quit something small today,", then: "I will stay five more minutes, and notice why.", prompt: "Was staying the right call this time?" },
    { lesson: "Your curiosity is a lantern. Most people never turn theirs on.", when: "When someone I don't understand speaks today,", then: "I will ask one more question than I normally would.", prompt: "What did you find out?" },
  ],
  savor: [
    { lesson: "After hard days, the good ones count double.", prompt: "Three things that went well today, and why each one happened." },
    { lesson: "Good moments go by fast unless you hold them still.", prompt: "Pick one good moment from today. Write it slowly, in every detail you can remember." },
    { lesson: "Look for the small, ordinary good. It's there.", prompt: "Three good things from today. At least one should be tiny." },
  ],
  bestself: [
    { lesson: "Imagine your life three years from now, going as well as it realistically could. Write one ordinary day in it, in detail: where you wake up, who's there, what you do, how you feel. Then name the one thing most likely to get in the way, and what you'd do when it shows up.", prompt: "What surprised you about the day you wrote?" },
    { lesson: "Write that ordinary good day again, three years from now. Then turn back to day 3 and read what you wrote there.", prompt: "What changed between the two days? What does that tell you?" },
  ],
  retake: [
    { lesson: "Ten statements from your climb. Answer each one as you are today, without looking back. When you're done, turn the book over to see how you answered before.", prompt: "What moved? What didn't? Why do you think so?" },
    { lesson: "The same ten statements, one last time. Answer as you are today. Then turn the book over and compare all three.", prompt: "Look at all three answers. What do you notice about the person who climbed this mountain?" },
  ],
  rest: [
    { lesson: "Rest is part of the climb. Nothing to do today." },
    { lesson: "Today you don't owe this page anything." },
    { lesson: "Sit down on the trail. The mountain will wait." },
    { lesson: "No challenge. No question. Just today." },
  ],
};

const blank: Omit<JournalDay, "day" | "kind"> = { lesson: "", when: "", then: "", prompt: "", title: "", steps: [] };

export function mockJournal(kinds: DayKind[], shared: Shared): JournalContent {
  const seen: Partial<Record<DayKind, number>> = {};
  const days = kinds.map((kind, i): JournalDay => {
    const n = seen[kind] ?? 0;
    seen[kind] = n + 1;
    const pool = POOLS[kind];
    return { day: i + 1, kind, ...blank, ...pool[n % pool.length] };
  });
  return {
    ...shared,
    firstName: shared.firstName || "Jesse",
    hope: shared.care ? "" : shared.hope || "I want to feel present at home again, and stop treating rest like something I have to earn.",
    dedication: "For the one who rehearses everything, and is learning to just begin.",
    pattern: "saying yes before I've decided",
    opening:
      "Ninety days is long enough to change how a life feels and short enough to keep in your hands. That's why this book exists.\n\nHere's what I see in you. You're steady, kind, and quietly carrying more than anyone knows. You're very good at taking care of everything, and not as practiced at letting anything take care of you. You don't need to become someone else. You need room to be who you already are, on purpose.\n\nThis book is that room. One spread a day. Some days are practice, some are questions, a few are strange on purpose. Every seventh day, we look back together.\n\nBegin whenever you're ready. Day 1 is whatever day you open this. Missed days are part of the trail, not a failure of it.\n\nI'll be on every page. Let's start walking.",
    closing:
      "You made it to day 90. Not because every day went well, but because you kept coming back to the page.\n\nThink about where you started. You noticed a pattern you'd been living inside for years. You met the parts of yourself you usually keep out of sight, and found they weren't so frightening up close. You let a few people nearer. Some of it is already ordinary for you. That's the point.\n\nHere is what I noticed along the way: when you stop trying to be useful, you get more honest, and when you get more honest, people trust you more, not less.\n\nKeep the practices that fit. Let go of the rest. Come back to these pages when you forget who you're becoming.\n\nYou are sondering. That is enough.",
    phases: [
      { name: "Ground", letter: "Welcome to the first stretch. For the next thirty days, your only job is to notice.\n\nYou'll catch the pattern as it happens: the quick yes, the rehearsed conversation, the face you put on at the door. Don't try to fix anything yet. Just see it clearly, and count it in the corner of each page.\n\nWhen it gets hard, remember: noticing is already changing." },
      { name: "Climb", letter: "Now we climb. This stretch asks more of you.\n\nFor thirty days, we'll meet the parts of you that usually stay out of sight: what you avoid, what irritates you in others, the things you've never fully written down. None of it is as dangerous as it feels from a distance.\n\nWhen it gets hard, take the smaller step. Every hard page has a way out. Use it whenever you need to." },
      { name: "Return", letter: "The last stretch is about coming home.\n\nFor these thirty days, we take what you've found and make it ordinary: in how you love, how you work, how you speak to yourself. Less effort, more habit. And somewhere in here, you'll find what you carry back for other people.\n\nWhen it gets hard, turn back to day 1. You've already come a long way." },
    ],
    days,
    weeks: WEEKS.map((w, k) => ({
      n: w.n,
      theme: w.theme,
      checkin: [
        "Looking back at this week, where did you notice yourself most clearly?",
        "When did the mask feel heaviest this week? When did it slip?",
        "What filled you up this week, and what quietly drained you?",
        "What story did the voice in your head tell most often this week?",
        "What did you push away this week, and what happened when you didn't?",
        "After four honest days, what feels different, even slightly?",
        "What did the people who bothered you this week teach you about yourself?",
        "Which harder choice did you make this week? What did it cost, and what did it give?",
        "Who saw a little more of you this week?",
        "Where did your work give something back this week?",
        "When were you kind to yourself this week, without earning it first?",
        "What did you give away this week that you used to keep?",
      ][k],
    })),
    notes: [
      { onDay: 1, readOn: 90, text: "You did it. Whatever these ninety days held, you stayed. I knew you would. Now look at the first page you wrote, and be gentle with the person who wrote it." },
      { onDay: 9, readOn: 42, text: "You just wrote the hardest pages in this book. Put the pen down. Get some air. Nothing you wrote can hurt you now; it's on the page instead of in you." },
      { onDay: 36, readOn: 66, text: "Halfway down the mountain. Notice how much lighter the pack feels? That's not an accident. That's you." },
    ],
    openWhen: [
      { when: "When you want to quit", letter: "Then quit for today. Close the book. Tomorrow, open it to any page and start there.\n\nWanting to quit usually means you're near something that matters. The trail always gets steepest right before the view." },
      { when: "When someone hurts you", letter: "That hurt is real. You don't have to understand it yet, forgive it yet, or fix it yet.\n\nTonight, just write what happened and how it felt, as plainly as you can. Then do one kind thing for yourself before you sleep." },
      { when: "When you're proud of yourself", letter: "Good. Stay here a minute. Don't rush past it to the next thing.\n\nWrite down exactly what you did and what it took. On a harder day, you'll want proof that this person exists. Here it is." },
      { when: "When you can't sleep", letter: "Write down everything that's circling. Every last thing. Then close the book and leave it all inside.\n\nIt'll still be here in the morning, and so will you. That's enough for tonight." },
      { when: "When you slip back into the old pattern", letter: "Of course you did. You practiced that pattern for years; you've practiced this for weeks.\n\nSlipping back isn't starting over. Notice it, name it, and do the next small thing. That's the whole practice." },
      { when: "When you feel lost", letter: "Turn to the map at the front of this book. Read the four words and the lines you're carrying.\n\nYou're not lost. You're somewhere on the trail you haven't been before. That's what climbing feels like." },
    ],
    // Without real answers every original is 3; vary them so the sample looks real.
    retake: shared.retake.every((r) => r.original === 3)
      ? shared.retake.map((r, k) => ({ ...r, original: [5, 2, 4, 1, 4, 2, 5, 3, 4, 2][k % 10] }))
      : shared.retake,
    carry: shared.carry.length
      ? shared.carry
      : [
          { title: "What I see in you", line: "You were never too much. You were carrying too much." },
          { title: "What you're carrying", line: "Put down one thing that isn't yours, and see who you are without it." },
          { title: "The work that fits you", line: "Work that fits you gives energy back. Notice where yours does." },
          { title: "How you let people in", line: "Let one person help you this week, and let it count." },
          { title: "Where you get stuck", line: "The rehearsal is not the conversation. Say the first sentence." },
        ],
    words: shared.words.length ? shared.words : ["Deep-feeling", "Helper", "Open", "Perspective"],
    books: shared.books.length
      ? shared.books
      : [
          { title: "The Gifts of Imperfection", author: "Brené Brown" },
          { title: "Four Thousand Weeks", author: "Oliver Burkeman" },
          { title: "Letters to a Young Poet", author: "Rainer Maria Rilke" },
        ],
  };
}

