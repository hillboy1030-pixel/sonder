// Sample output used only in local development (SONDER_MOCK=1) so the design can
// be reviewed without calling the AI. Never served in production.

export const MOCK_PREVIEW = {
  previewInsights: [
    {
      title: "The Quiet Rehearsal",
      insight:
        "Before most hard conversations, you've already had them three times in the car. The version you finally say is gentler than any of the drafts, and nobody knows how much was cut.",
      shareLine: "I've usually had the hard conversation three times in my head before I say a word.",
    },
    {
      title: "The Glass Wall",
      insight:
        "People experience you as open and easy to talk to, and they're right, up to a point. There's a room past that point where you decide things alone, and very few people have been inside it.",
      shareLine: "I'm easy to talk to. I'm just not easy to know, and I'm okay with that.",
    },
    {
      title: "Proof of Worth",
      insight:
        "Underneath the drive to do things well is a quieter wish to be needed for who you are rather than what you carry. The to-do list is real, but it's also a place to hide.",
      shareLine: "I don't just want to be useful. I want to be known.",
    },
  ],
};

const para = (s: string) => s.trim().replace(/\s+/g, " ");

export const MOCK_REPORT = {
  sections: [
    {
      title: "What I see in you",
      content: [
        para(`You walk into a room and read it before you speak. Who is tired, who is pretending, where the tension sits. It happens so fast you rarely notice you've done it, and by the time you say hello you've already adjusted your voice to fit.`),
        para(`The combination that defines you is curiosity paired with care. You want to understand things all the way down, and you want the people around you to be okay. Most days those two pull in the same direction. On the hard days they don't, and you choose care, and something in you goes unfed.`),
        para(`The particular loneliness of this profile isn't being alone. It's being surrounded by people who are glad you're there and still feeling like the one holding the map.`),
      ].join("\n\n"),
    },
    {
      title: "What you're carrying",
      content: [
        para(`You're starting something new at work while trying to stay present at home, and from the outside you look like you're handling it. You probably are. You're good at reading what a new room needs and becoming that, fast.`),
        para(`Here's what I'd want you to notice: handling it and carrying it alone have started to look the same to you. You come home with the day still on you, and instead of setting it down you get useful again. Dishes, homework, a fix for someone's problem.`),
        para(`What would happen if, one evening this week, you walked in and said "today was a lot" before you did anything helpful? Not to be rescued. Just to be known.`),
      ].join("\n\n"),
    },
    {
      title: "The work that fits you",
      content: [
        para(`Work has to mean something to you, and it has to involve people. You do your best work when you're helping someone see a path they couldn't see alone, which is why you light up in conversations that other people find draining.`),
        para(`The blind spot is that you treat your own energy as unlimited. You will take the extra call, cover the extra shift, and say "no problem" in a voice that means it, then wonder on Thursday night why you're short with the people you love most.`),
        para(`The career mistake people with this profile make is staying in a role long after it stopped growing them, because leaving would let someone down.`),
      ].join("\n\n"),
    },
    {
      title: "How you let people in",
      content: [
        para(`In close relationships you are generous and steady. You remember what people said three weeks ago and you show up. What fewer people see is how carefully you manage how much you ask for in return.`),
        para(`You long to be known without having to explain yourself, and you quietly fear that if you stopped being useful the closeness would thin out. So you stay useful. It works, and it costs you the experience of being cared for when you have nothing to offer.`),
      ].join("\n\n"),
    },
    {
      title: "What you're really after",
      content: [
        para(`Curiosity gives you a world that never gets boring, and costs you the ability to leave a question alone at midnight. Kindness gives you people who trust you completely, and costs you the word no. Perspective makes you the person others call, and leaves you with no one you call.`),
        para(`Underneath all three is one need: to matter in a way that doesn't depend on being impressive. You're trying to build a life where being yourself is enough.`),
      ].join("\n\n"),
    },
    {
      title: "Where you get stuck",
      content: [
        para(`**Saying yes before you've checked.** It's Tuesday afternoon, someone asks for help, and you've agreed before you've looked at your week. It makes sense: helping is how you feel useful. It has already cost you rest you needed. What would happen if you said "let me check" and meant it?`),
        para(`**Thinking instead of feeling.** When something hurts, you analyze it until it's interesting instead of painful. It makes sense: understanding feels like control. It has cost you the relief of just being sad. What are you avoiding by being so reasonable?`),
        para(`**Carrying it alone.** You make the big decisions privately. What would it feel like to let someone help before it's solved?`),
      ].join("\n\n"),
    },
    {
      title: "Other people's trails",
      content: [
        para(`When someone goes quiet after you've helped them, you read it as disappointment. More often they are moved and don't know what to say.`),
        para(`When a friend doesn't call back, you assume you've asked too much. Usually their week is just as full as yours.`),
        para(`When someone offers to help you, you hear that you've slipped. They're trying to give back what you've given them.`),
        para(`The reframe: letting people help you is a gift you give them.`),
      ].join("\n\n"),
    },
    {
      title: "The paradox you carry",
      content: [
        para(`The thing that makes you easy to love is the same thing that makes you hard to reach. Your care is real, and it is also a wall.`),
        para(`Picture an ordinary evening: dishes done, the house finally quiet, and someone you love asking how you are. Then picture answering with the true thing instead of the useful one. That's the whole journey, right there.`),
      ].join("\n\n"),
    },
    {
      title: "Where to begin",
      content: [
        `Begin small and begin tomorrow. The ninety days ahead are made of ordinary Tuesdays, and the first one is enough.`,
        `**Books**`,
        `**The Gifts of Imperfection** — Brené Brown. A short, warm book about letting yourself be seen before you're finished. It speaks directly to the habit of earning your place.`,
        `**Four Thousand Weeks** — Oliver Burkeman. A clear-eyed look at limits and why saying no is a form of care. Good company for someone who treats energy as unlimited.`,
        `**Letters to a Young Poet** — Rainer Maria Rilke. Slow, patient letters about living the questions. For a mind that wants every answer by midnight.`,
        `**Start tomorrow**`,
        `**The pause.** Before agreeing to anything, say "let me check" and wait an hour. It turns your yes from a reflex into a choice, and it gives you a moment to notice what you actually want.`,
        `**A question for this week**`,
        `What are you analyzing right now that you'd rather just feel? It names the move you make when things hurt, so you can catch it.`,
        `You are sondering. That is enough.`,
      ].join("\n\n"),
    },
  ],
};

export function mockDelay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
