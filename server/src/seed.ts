import { PrismaClient, Difficulty } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

type Q = { q: string; correct: string; options: string[] };

const tests: {
  title: string;
  description: string;
  topic: string;
  difficulty: Difficulty;
  price: number;
  questions: Q[];
}[] = [
  {
    title: "JavaScript Basics",
    description: "Test your fundamentals of JavaScript.",
    topic: "Programming",
    difficulty: "BEGINNER",
    price: 0,
    questions: [
      { q: "Which keyword declares a block-scoped variable?", correct: "let", options: ["var", "let", "function", "define"] },
      { q: "What does typeof null return?", correct: "object", options: ["null", "undefined", "object", "number"] },
      { q: "Which method adds an item to the end of an array?", correct: "push", options: ["pop", "push", "shift", "unshift"] },
      { q: "What is the result of 2 + '2'?", correct: "22", options: ["4", "22", "NaN", "Error"] },
      { q: "Which symbol is used for strict equality?", correct: "===", options: ["==", "=", "===", "!=="] },
    ],
  },
  {
    title: "General Science",
    description: "A mix of physics, chemistry and biology questions.",
    topic: "Science",
    difficulty: "MEDIUM",
    price: 100,
    questions: [
      { q: "What is the chemical symbol for gold?", correct: "Au", options: ["Ag", "Au", "Gd", "Go"] },
      { q: "Which planet is known as the Red Planet?", correct: "Mars", options: ["Venus", "Mars", "Jupiter", "Mercury"] },
      { q: "What gas do plants absorb from the air?", correct: "Carbon dioxide", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"] },
      { q: "What is the speed of light (approx.)?", correct: "300,000 km/s", options: ["3,000 km/s", "30,000 km/s", "300,000 km/s", "3,000,000 km/s"] },
      { q: "How many bones are in the adult human body?", correct: "206", options: ["186", "206", "226", "256"] },
    ],
  },
  {
    title: "World Geography Challenge",
    description: "Hard questions about countries and capitals.",
    topic: "Geography",
    difficulty: "HARD",
    price: 150,
    questions: [
      { q: "What is the capital of Australia?", correct: "Canberra", options: ["Sydney", "Melbourne", "Canberra", "Perth"] },
      { q: "Which is the longest river in Africa?", correct: "Nile", options: ["Congo", "Niger", "Nile", "Zambezi"] },
      { q: "Which country has the most time zones?", correct: "France", options: ["Russia", "USA", "France", "China"] },
      { q: "What is the smallest country in the world?", correct: "Vatican City", options: ["Monaco", "Vatican City", "San Marino", "Malta"] },
      { q: "Mount Kilimanjaro is in which country?", correct: "Tanzania", options: ["Kenya", "Uganda", "Tanzania", "Ethiopia"] },
    ],
  },
];

async function main() {
  const email = "seed@example.com";
  let user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Quiz Admin",
        email,
        password: await bcrypt.hash("password123", 10),
      },
    });
  }

  for (const t of tests) {
    const exists = await prisma.test.findFirst({
      where: { title: t.title, userId: user.id },
    });
    if (exists) {
      console.log("skip (exists):", t.title);
      continue;
    }
    const test = await prisma.test.create({
      data: {
        title: t.title,
        description: t.description,
        topic: t.topic,
        difficulty: t.difficulty,
        price: t.price,
        questionCount: t.questions.length,
        userId: user.id,
      },
    });
    await prisma.question.createMany({
      data: t.questions.map((x) => ({
        testId: test.id,
        problemStatement: x.q,
        correctOption: x.correct,
        option: x.options,
      })),
    });
    console.log("created:", t.title);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());