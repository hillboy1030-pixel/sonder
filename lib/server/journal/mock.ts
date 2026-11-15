// Sample journal content for local development and the sample PDF.
// Written by hand in Ember's voice; days repeat in a cycle to fill 90.

import type { JournalContent, JournalDay } from "@/lib/journal/types";

const GROUND: JournalDay[] = [
  { lesson: "We start by watching, not fixing. A trail you've walked a thousand times still has things you've never noticed.", challenge: "Each time you say yes today, make a small mark on your hand or a note in your phone. Don't change anything. Just count.", prompt: "How many marks? Which yes surprised you?" },
  { lesson: "You're good at reading a room. Today, read yourself the same way.", challenge: "Three times today, stop and name what you're feeling in one word before you answer anyone.", prompt: "Which word showed up most? Where did you feel it in your body?" },
  { lesson: "Tired isn't a character flaw. It's information.", challenge: "Notice the moment today when your energy drops. Write down the time and what you were doing.", prompt: "What was happening right before the drop?" },
  { lesson: "The voice that says 'just one more thing' sounds like responsibility. Sometimes it's fear wearing a work shirt.", challenge: "When you catch yourself adding one more task to today, write it down instead of doing it.", prompt: "Look at the list. What would happen if none of it got done?" },
  { lesson: "You rehearse hard conversations so many times that the real one barely gets a chance.", challenge: "Catch one conversation you're rehearsing in your head. Note who it's with and how many times you've run it.", prompt: "What are you afraid will happen if you say it once, plainly?" },
  { lesson: "Rest counts as part of the climb.", challenge: "Take five minutes today doing nothing useful. Sit outside, look out a window, or lie on the floor.", prompt: "What did your mind try to do during those five minutes?" },
  { lesson: "People feel at ease around you. Do you feel at ease around you?", challenge: "Notice one moment today when you were kind to someone else in a way you wouldn't be to yourself.", prompt: "What would it sound like to say that same thing to yourself?" },
  { lesson: "Patterns are loudest at the edges of the day.", challenge: "Notice the first thought you have this morning and the last one tonight.", prompt: "Were they about you, or about what you owe?" },
  { lesson: "You carry a lot quietly. Quiet doesn't mean light.", challenge: "Write down three things you're carrying right now that nobody else knows about.", prompt: "Which one is the heaviest? Which one isn't yours to carry?" },
  { lesson: "Curiosity beats judgment. Every time.", challenge: "When you feel frustrated with yourself today, replace 'why did I do that' with 'huh, interesting.'", prompt: "What changed when you got curious instead of critical?" },
];

const CLIMB: JournalDay[] = [
  { lesson: "You don't owe anyone an instant yes. A pause isn't a no. It's room to choose.", challenge: "Before you agree to anything today, say 'let me check' and wait an hour.", prompt: "What did the pause tell you about the yes you almost gave?" },
  { lesson: "Small honest moments build the muscle for big ones.", challenge: "Tell one person one true thing today that you'd normally smooth over. Keep it small.", prompt: "How did they respond? How did you feel afterward?" },
  { lesson: "Asking for help is a skill. It gets easier with reps.", challenge: "Ask someone for help with one small thing you'd usually do yourself.", prompt: "What did asking cost you? What did it give you?" },
  { lesson: "You can do things well without doing everything.", challenge: "Pick one task today and do it at 80 percent. On purpose.", prompt: "Did anyone notice? Did you?" },
  { lesson: "A boundary is just a clear sentence said kindly.", challenge: "Write one boundary you need in a single sentence. Say it out loud once, even if only to yourself.", prompt: "What made that sentence hard to write?" },
  { lesson: "Good days on the trail are the ones where you look up.", challenge: "Spend ten minutes today on something you enjoy for no reason at all.", prompt: "When was the last time you did that before today?" },
  { lesson: "The conversation you rehearse is never as hard as the silence you keep.", challenge: "Have one of the conversations you've been rehearsing. Say the first sentence and let it go from there.", prompt: "What happened that you didn't rehearse?" },
  { lesson: "Notice who you become when you're not trying to be useful.", challenge: "Spend time with someone today without fixing, planning, or helping anything.", prompt: "What was it like to just be there?" },
  { lesson: "Progress on a mountain looks like nothing up close.", challenge: "Look back at your first week of pages. Write one thing you do differently now.", prompt: "What do you want to be different by day 60?" },
  { lesson: "Your strengths are tools, not obligations.", challenge: "Use your perspective today for yourself: give yourself the advice you'd give a friend.", prompt: "Will you take it?" },
];

const RETURN: JournalDay[] = [
  { lesson: "The change becomes real when it gets boring. Boring is good.", challenge: "Do one thing you practiced last month without thinking about it as practice.", prompt: "What felt natural today that didn't in day 1?" },
  { lesson: "The people closest to you have been climbing with you, even if they didn't know it.", challenge: "Tell someone close to you one thing you've learned about yourself this month.", prompt: "What did they say? Did it surprise you?" },
  { lesson: "Work that fits you gives something back. Notice what it gives.", challenge: "At the end of your work today, write down one moment that felt like you.", prompt: "How can you make room for one more moment like that this week?" },
  { lesson: "Kindness to yourself is not a reward for finishing. It's how you keep going.", challenge: "Say one kind, specific thing to yourself out loud today.", prompt: "Did you believe it? A little is enough." },
  { lesson: "You've been learning to choose. Keep choosing.", challenge: "Make one decision today based on what you want, not what's expected.", prompt: "What did you choose, and how did it feel?" },
  { lesson: "Habits need a place to live.", challenge: "Pick one practice from these pages and decide exactly when it happens each week.", prompt: "What will remind you when the journal is closed?" },
  { lesson: "Look how far up you've come. Then look at the view.", challenge: "Write a short note to yourself about who you were on day 1.", prompt: "What would you tell that person now?" },
  { lesson: "Sometimes the bravest thing is enjoying what you have.", challenge: "Spend an hour today fully present with the people you love. No phone.", prompt: "What did you notice when you were all there?" },
  { lesson: "There's no summit where you stop growing. There are just better views.", challenge: "Write the one pattern you most want to keep working on after day 90.", prompt: "What's the first small step, and when?" },
  { lesson: "You did this one page at a time. That's how everything gets done.", challenge: "Thank yourself for one specific day in this journal that was hard.", prompt: "What did that day teach you?" },
];

const cycle = (list: JournalDay[]) => Array.from({ length: 30 }, (_, i) => list[i % list.length]);

export function mockJournal(firstName: string, words: string[]): JournalContent {
  return {
    firstName: firstName || "Jesse",
    dedication: "For the one who rehearses everything, and is learning to just begin.",
    opening:
      "Ninety days is long enough to change how a life feels and short enough to keep in your hands. That's why this book exists.\n\nHere's what I see in you. You're steady, kind, and quietly carrying more than anyone knows. You're very good at taking care of everything, and not as practiced at letting anything take care of you. You don't need to become someone else. You need room to be who you already are, on purpose.\n\nThis journal is that room. One page a day. Each morning, a few lines from me and one small challenge. Each night, a question and some space to write. Every seventh day, we look back together.\n\nBegin whenever you're ready. Day 1 is whatever day you open this. Missed days are part of the trail, not a failure of it. Just pick up where you are.\n\nI'll be on every page. Let's start walking.",
    closing:
      "You made it to day 90. Not because every day went well, but because you kept coming back to the page.\n\nThink about where you started. You noticed patterns you'd been living inside for years. You practiced choices that used to feel impossible. You let a few people closer. Some of it is already ordinary for you. That's the whole point.\n\nHere is what I noticed in you along the way: when you stop trying to be useful, you get more honest, and when you get more honest, people trust you more, not less.\n\nKeep the practices that fit. Let go of the ones that didn't. Come back to these pages when you forget who you're becoming.\n\nYou are sondering. That is enough.",
    phases: [
      { name: "Ground", letter: "Welcome to the first stretch. For the next thirty days, your only job is to notice.\n\nYou'll catch patterns as they happen: the quick yes, the rehearsed conversation, the moment your energy drops. Don't try to fix anything yet. Just see it clearly.\n\nWhen it gets hard, remember: noticing is already changing.", days: cycle(GROUND), checkins: ["Looking back at this week, which pattern showed up most often?", "What did you notice this week that you'd never noticed before?", "Which day was hardest, and what made it hard?", "After four weeks of noticing, what do you know about yourself that you didn't on day 1?"] },
      { name: "Climb", letter: "Now we climb. For the next thirty days, you'll practice the harder choice in small, low-stakes moments.\n\nSome days will feel awkward. That's what learning feels like from the inside. You don't have to be good at this. You only have to try it, and write down what happens.\n\nWhen it gets hard, take the smaller step. It still counts.", days: cycle(CLIMB), checkins: ["Which new choice felt easiest this week? Which felt impossible?", "Who noticed something different about you this week?", "What did you learn from the day that didn't go as planned?", "What are you doing now without thinking about it that once took effort?"] },
      { name: "Return", letter: "The last stretch is about bringing it home. For these thirty days, we make what you've practiced part of how you live.\n\nYou'll take what worked into your relationships, your work, and the way you treat yourself. Less effort, more habit.\n\nWhen it gets hard, look back at day 1. You've already come a long way.", days: cycle(RETURN), checkins: ["Which practice from the climb has become ordinary?", "Where did you choose what you wanted this week?", "What would you tell someone just starting day 1?", "What do you want to keep after day 90, and how?"] },
    ],
    carry: [
      { title: "What I see in you", line: "You were never too much. You were carrying too much." },
      { title: "What you're carrying", line: "Put down one thing that isn't yours, and see who you are without it." },
      { title: "The work that fits you", line: "Work that fits you gives energy back. Notice where yours does." },
      { title: "How you let people in", line: "Let one person help you this week, and let it count." },
      { title: "Where you get stuck", line: "The rehearsal is not the conversation. Say the first sentence." },
    ],
    words: words.length ? words : ["Deep-feeling", "Helper", "Open", "Perspective"],
  };
}
