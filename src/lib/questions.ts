export interface QuestionChoice {
  question: string;
  choices: string[];
}

export const accountabilityQuestions: QuestionChoice[] = [
  {
    question: "If the missioner is UNABLE TO GO due to unforeseen reasons, please*",
    choices: [
      "Redirect my support to the team fund",
      "Redirect my support to the Every Nation World Missions General Fund",
    ],
  },
  {
    question: "If the missioner or team is REROUTED, please*",
    choices: ["Retain my support", "Redirect my support to the Every Nation World Missions General Fund"],
  },
  {
    question: "If the trip is CANCELED, please*",
    choices: ["Redirect my support to the Every Nation World Missions General Fund"],
  },
];
