// ─────────────────────────────────────────────────────────────────────────────
// The 56 assessment statements, grouped by the research framework they come from.
// Changing an item's wording can change what it measures, so treat edits here as
// part of the psychologist review.
// ─────────────────────────────────────────────────────────────────────────────

export type Question = {
  id: number;       // 1-indexed, global (1–56)
  text: string;
  reverse: boolean;
  dimension: string;
};

export type SectionDef = {
  title: string;
  subtitle: string;
  framework: string;
  scaleLow: string;
  scaleHigh: string;
  /** The five answer labels, low to high, matching the published instrument's anchors. */
  scaleLabels: [string, string, string, string, string];
  /** Short question shown above the answer options. */
  ask: string;
  questions: Question[];
};

export const SECTIONS: SectionDef[] = [
  {
    title: "Understanding Your Personality",
    subtitle: "Rate how accurately each statement describes you.",
    framework: "Big Five / Mini-IPIP (20 items)",
    scaleLow: "Very inaccurate",
    scaleHigh: "Very accurate",
    scaleLabels: ["Very inaccurate", "Moderately inaccurate", "Neither", "Moderately accurate", "Very accurate"],
    ask: "How accurately does this describe you?",
    questions: [
      { id: 1, text: "I am the life of the party.", reverse: false, dimension: "Extraversion" },
      { id: 2, text: "I sympathize with others' feelings.", reverse: false, dimension: "Agreeableness" },
      { id: 3, text: "I get chores done right away.", reverse: false, dimension: "Conscientiousness" },
      { id: 4, text: "I have frequent mood swings.", reverse: false, dimension: "Neuroticism" },
      { id: 5, text: "I have a vivid imagination.", reverse: false, dimension: "Openness" },
      { id: 6, text: "I don't talk a lot.", reverse: true, dimension: "Extraversion" },
      { id: 7, text: "I am not interested in other people's problems.", reverse: true, dimension: "Agreeableness" },
      { id: 8, text: "I often forget to put things back in their proper place.", reverse: true, dimension: "Conscientiousness" },
      { id: 9, text: "I am relaxed most of the time.", reverse: true, dimension: "Neuroticism" },
      { id: 10, text: "I am not interested in abstract ideas.", reverse: true, dimension: "Openness" },
      { id: 11, text: "I talk to a lot of different people at parties.", reverse: false, dimension: "Extraversion" },
      { id: 12, text: "I feel others' emotions.", reverse: false, dimension: "Agreeableness" },
      { id: 13, text: "I like order.", reverse: false, dimension: "Conscientiousness" },
      { id: 14, text: "I get upset easily.", reverse: false, dimension: "Neuroticism" },
      { id: 15, text: "I have difficulty understanding abstract ideas.", reverse: true, dimension: "Openness" },
      { id: 16, text: "I keep in the background.", reverse: true, dimension: "Extraversion" },
      { id: 17, text: "I am not really interested in others.", reverse: true, dimension: "Agreeableness" },
      { id: 18, text: "I make a mess of things.", reverse: true, dimension: "Conscientiousness" },
      { id: 19, text: "I seldom feel blue.", reverse: true, dimension: "Neuroticism" },
      { id: 20, text: "I do not have a good imagination.", reverse: true, dimension: "Openness" },
    ],
  },
  {
    title: "Your Career Interests",
    subtitle: "Rate how much you'd enjoy each activity.",
    framework: "Holland Code / O*NET-style interests",
    scaleLow: "Strongly dislike",
    scaleHigh: "Strongly like",
    scaleLabels: ["Strongly dislike", "Dislike", "Unsure", "Like", "Strongly like"],
    ask: "How much would you enjoy this?",
    questions: [
      { id: 21, text: "Fix a broken appliance or piece of furniture.", reverse: false, dimension: "Realistic" },
      { id: 22, text: "Build kitchen cabinets or other woodwork.", reverse: false, dimension: "Realistic" },
      { id: 23, text: "Study how the human body works.", reverse: false, dimension: "Investigative" },
      { id: 24, text: "Do scientific research to answer a question.", reverse: false, dimension: "Investigative" },
      { id: 25, text: "Write a story, song, or poem.", reverse: false, dimension: "Artistic" },
      { id: 26, text: "Create a work of art.", reverse: false, dimension: "Artistic" },
      { id: 27, text: "Teach someone how to do something.", reverse: false, dimension: "Social" },
      { id: 28, text: "Help people with their personal problems.", reverse: false, dimension: "Social" },
      { id: 29, text: "Start your own business.", reverse: false, dimension: "Enterprising" },
      { id: 30, text: "Lead a team to reach a goal.", reverse: false, dimension: "Enterprising" },
      { id: 31, text: "Keep track of financial records or expenses.", reverse: false, dimension: "Conventional" },
      { id: 32, text: "Organize information so it's easy to find.", reverse: false, dimension: "Conventional" },
    ],
  },
  {
    title: "Your Relationship Style",
    subtitle: "Rate how accurately each statement describes you in close relationships.",
    framework: "Attachment Style / ECR-12",
    scaleLow: "Strongly disagree",
    scaleHigh: "Strongly agree",
    scaleLabels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
    ask: "How much do you agree?",
    questions: [
      { id: 33, text: "I prefer not to show others how I feel deep down.",           reverse: false, dimension: "Avoidance" },
      { id: 34, text: "I worry about being abandoned by those I care about.",        reverse: false, dimension: "Anxiety" },
      { id: 35, text: "I am very comfortable being close to others.",                reverse: true,  dimension: "Avoidance" },
      { id: 36, text: "I worry a lot about my relationships.",                       reverse: false, dimension: "Anxiety" },
      { id: 37, text: "When someone gets too close, I find myself pulling away.",    reverse: false, dimension: "Avoidance" },
      { id: 38, text: "I worry that others don't care as much as I care for them.",  reverse: false, dimension: "Anxiety" },
      { id: 39, text: "I get uncomfortable when someone wants to be very close.",    reverse: false, dimension: "Avoidance" },
      { id: 40, text: "I often feel a strong need for reassurance from others.",     reverse: false, dimension: "Anxiety" },
      { id: 41, text: "I don't feel comfortable opening up to others.",              reverse: false, dimension: "Avoidance" },
      { id: 42, text: "I often wish my relationships were deeper than they are.",    reverse: false, dimension: "Anxiety" },
      { id: 43, text: "I find it difficult to depend on other people.",              reverse: false, dimension: "Avoidance" },
      { id: 44, text: "I worry about being alone more than most people.",            reverse: false, dimension: "Anxiety" },
    ],
  },
  {
    title: "Your Inner Strengths",
    subtitle: "Rate how accurately each statement describes you.",
    framework: "Character Strengths / IPIP-VIA",
    scaleLow: "Very much unlike me",
    scaleHigh: "Very much like me",
    scaleLabels: ["Very much unlike me", "Unlike me", "Neutral", "Like me", "Very much like me"],
    ask: "How much is this like you?",
    questions: [
      { id: 45, text: "I am always coming up with new and different ideas.",         reverse: false, dimension: "Creativity" },
      { id: 46, text: "I find the world a very interesting place.",                  reverse: false, dimension: "Curiosity" },
      { id: 47, text: "People often come to me for advice.",                         reverse: false, dimension: "Perspective" },
      { id: 48, text: "I stand up for what I believe in, even if it's unpopular.",  reverse: false, dimension: "Bravery" },
      { id: 49, text: "I finish whatever I start.",                                  reverse: false, dimension: "Perseverance" },
      { id: 50, text: "I am a genuine and authentic person.",                        reverse: false, dimension: "Honesty" },
      { id: 51, text: "I approach life with excitement and energy.",                 reverse: false, dimension: "Zest" },
      { id: 52, text: "I go out of my way to help other people.",                    reverse: false, dimension: "Kindness" },
      { id: 53, text: "I am good at sensing what other people are feeling.",         reverse: false, dimension: "Social Intelligence" },
      { id: 54, text: "I am a helpful member of every group I'm in.",               reverse: false, dimension: "Teamwork" },
      { id: 55, text: "I treat everyone equally, regardless of who they are.",      reverse: false, dimension: "Fairness" },
      { id: 56, text: "I let my accomplishments speak for themselves.",              reverse: false, dimension: "Humility" },
    ],
  },
];

export const TOTAL_QUESTIONS = SECTIONS.reduce((n, s) => n + s.questions.length, 0);
