export type Question = {
  id: number;       // 1-indexed, global (1–72)
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
  questions: Question[];
};

export const SECTIONS: SectionDef[] = [
  {
    title: "Understanding Your Personality",
    subtitle: "Rate how accurately each statement describes you.",
    framework: "Big Five / IPIP-NEO-30",
    scaleLow: "Strongly Disagree",
    scaleHigh: "Strongly Agree",
    questions: [
      { id: 1,  text: "I worry about things.",                                      reverse: false, dimension: "Neuroticism" },
      { id: 2,  text: "I get angry easily.",                                        reverse: false, dimension: "Neuroticism" },
      { id: 3,  text: "I often feel blue.",                                         reverse: false, dimension: "Neuroticism" },
      { id: 4,  text: "I am easily intimidated.",                                   reverse: false, dimension: "Neuroticism" },
      { id: 5,  text: "I often give in to my urges.",                               reverse: false, dimension: "Neuroticism" },
      { id: 6,  text: "I feel that I'm unable to deal with things.",                reverse: false, dimension: "Neuroticism" },
      { id: 7,  text: "I make friends easily.",                                     reverse: false, dimension: "Extraversion" },
      { id: 8,  text: "I love large parties.",                                      reverse: false, dimension: "Extraversion" },
      { id: 9,  text: "I take charge of situations.",                               reverse: false, dimension: "Extraversion" },
      { id: 10, text: "I am always on the go.",                                     reverse: false, dimension: "Extraversion" },
      { id: 11, text: "I love excitement and thrills.",                             reverse: false, dimension: "Extraversion" },
      { id: 12, text: "I radiate joy and optimism.",                                reverse: false, dimension: "Extraversion" },
      { id: 13, text: "I have a vivid imagination.",                                reverse: false, dimension: "Openness" },
      { id: 14, text: "I believe in the importance of art.",                        reverse: false, dimension: "Openness" },
      { id: 15, text: "I experience my emotions intensely.",                        reverse: false, dimension: "Openness" },
      { id: 16, text: "I prefer to stick to things that I know.",                   reverse: true,  dimension: "Openness" },
      { id: 17, text: "I enjoy thinking about complex ideas.",                      reverse: false, dimension: "Openness" },
      { id: 18, text: "I believe there is no absolute right and wrong.",            reverse: false, dimension: "Openness" },
      { id: 19, text: "I trust what people say.",                                   reverse: false, dimension: "Agreeableness" },
      { id: 20, text: "I would never cheat on my taxes.",                           reverse: false, dimension: "Agreeableness" },
      { id: 21, text: "I love to help others.",                                     reverse: false, dimension: "Agreeableness" },
      { id: 22, text: "I am easy to satisfy.",                                      reverse: false, dimension: "Agreeableness" },
      { id: 23, text: "I believe that I am better than others.",                    reverse: true,  dimension: "Agreeableness" },
      { id: 24, text: "I feel sympathy for those who are worse off.",               reverse: false, dimension: "Agreeableness" },
      { id: 25, text: "I am always prepared.",                                      reverse: false, dimension: "Conscientiousness" },
      { id: 26, text: "I like to keep my things in order.",                         reverse: false, dimension: "Conscientiousness" },
      { id: 27, text: "I keep my promises.",                                        reverse: false, dimension: "Conscientiousness" },
      { id: 28, text: "I work hard to reach my goals.",                             reverse: false, dimension: "Conscientiousness" },
      { id: 29, text: "I get chores done right away.",                              reverse: false, dimension: "Conscientiousness" },
      { id: 30, text: "I avoid making mistakes.",                                   reverse: false, dimension: "Conscientiousness" },
    ],
  },
  {
    title: "Your Career Interests",
    subtitle: "Rate how much you enjoy each type of activity.",
    framework: "Holland Code / O*NET",
    scaleLow: "Strongly Dislike",
    scaleHigh: "Really Enjoy",
    questions: [
      { id: 31, text: "Fix a broken appliance or piece of furniture.",              reverse: false, dimension: "Realistic" },
      { id: 32, text: "Operate a machine on an assembly line.",                     reverse: false, dimension: "Realistic" },
      { id: 33, text: "Build kitchen cabinets or other woodwork.",                  reverse: false, dimension: "Realistic" },
      { id: 34, text: "Study the structure of the human body.",                     reverse: false, dimension: "Investigative" },
      { id: 35, text: "Develop a new medicine or vaccine.",                         reverse: false, dimension: "Investigative" },
      { id: 36, text: "Conduct scientific research in a lab.",                      reverse: false, dimension: "Investigative" },
      { id: 37, text: "Write a play, poem, or novel.",                              reverse: false, dimension: "Artistic" },
      { id: 38, text: "Design the layout for a magazine or website.",               reverse: false, dimension: "Artistic" },
      { id: 39, text: "Create a work of art (painting, sculpture, etc).",           reverse: false, dimension: "Artistic" },
      { id: 40, text: "Teach someone how to do something.",                         reverse: false, dimension: "Social" },
      { id: 41, text: "Help people with their personal problems.",                  reverse: false, dimension: "Social" },
      { id: 42, text: "Take care of sick or injured people.",                       reverse: false, dimension: "Social" },
      { id: 43, text: "Manage a retail store or business.",                         reverse: false, dimension: "Enterprising" },
      { id: 44, text: "Lead a team to reach a specific goal.",                      reverse: false, dimension: "Enterprising" },
      { id: 45, text: "Sell products or services to customers.",                    reverse: false, dimension: "Enterprising" },
      { id: 46, text: "Keep track of financial records or expenses.",               reverse: false, dimension: "Conventional" },
      { id: 47, text: "Manage a database of records or information.",               reverse: false, dimension: "Conventional" },
      { id: 48, text: "Organize a filing system for an office.",                    reverse: false, dimension: "Conventional" },
    ],
  },
  {
    title: "Your Relationship Style",
    subtitle: "Rate how accurately each statement describes you in close relationships.",
    framework: "Attachment Style / ECR-12",
    scaleLow: "Strongly Disagree",
    scaleHigh: "Strongly Agree",
    questions: [
      { id: 49, text: "I prefer not to show others how I feel deep down.",           reverse: false, dimension: "Avoidance" },
      { id: 50, text: "I worry about being abandoned by those I care about.",        reverse: false, dimension: "Anxiety" },
      { id: 51, text: "I am very comfortable being close to others.",                reverse: true,  dimension: "Avoidance" },
      { id: 52, text: "I worry a lot about my relationships.",                       reverse: false, dimension: "Anxiety" },
      { id: 53, text: "When someone gets too close, I find myself pulling away.",    reverse: false, dimension: "Avoidance" },
      { id: 54, text: "I worry that others don't care as much as I care for them.",  reverse: false, dimension: "Anxiety" },
      { id: 55, text: "I get uncomfortable when someone wants to be very close.",    reverse: false, dimension: "Avoidance" },
      { id: 56, text: "I often feel a strong need for reassurance from others.",     reverse: false, dimension: "Anxiety" },
      { id: 57, text: "I don't feel comfortable opening up to others.",              reverse: false, dimension: "Avoidance" },
      { id: 58, text: "I often wish my relationships were deeper than they are.",    reverse: false, dimension: "Anxiety" },
      { id: 59, text: "I find it difficult to depend on other people.",              reverse: false, dimension: "Avoidance" },
      { id: 60, text: "I worry about being alone more than most people.",            reverse: false, dimension: "Anxiety" },
    ],
  },
  {
    title: "Your Inner Strengths",
    subtitle: "Rate how accurately each statement describes you.",
    framework: "Character Strengths / IPIP-VIA",
    scaleLow: "Strongly Disagree",
    scaleHigh: "Strongly Agree",
    questions: [
      { id: 61, text: "I am always coming up with new and different ideas.",         reverse: false, dimension: "Creativity" },
      { id: 62, text: "I find the world a very interesting place.",                  reverse: false, dimension: "Curiosity" },
      { id: 63, text: "People often come to me for advice.",                         reverse: false, dimension: "Perspective" },
      { id: 64, text: "I stand up for what I believe in, even if it's unpopular.",  reverse: false, dimension: "Bravery" },
      { id: 65, text: "I finish whatever I start.",                                  reverse: false, dimension: "Perseverance" },
      { id: 66, text: "I am a genuine and authentic person.",                        reverse: false, dimension: "Honesty" },
      { id: 67, text: "I approach life with excitement and energy.",                 reverse: false, dimension: "Zest" },
      { id: 68, text: "I go out of my way to help other people.",                    reverse: false, dimension: "Kindness" },
      { id: 69, text: "I am good at sensing what other people are feeling.",         reverse: false, dimension: "Social Intelligence" },
      { id: 70, text: "I am a helpful member of every group I'm in.",               reverse: false, dimension: "Teamwork" },
      { id: 71, text: "I treat everyone equally, regardless of who they are.",      reverse: false, dimension: "Fairness" },
      { id: 72, text: "I let my accomplishments speak for themselves.",              reverse: false, dimension: "Humility" },
    ],
  },
];

export const TOTAL_QUESTIONS = SECTIONS.reduce((n, s) => n + s.questions.length, 0);
