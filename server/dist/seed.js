"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const tests = [
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const email = "seed@example.com";
        let user = yield prisma.user.findFirst({ where: { email } });
        if (!user) {
            user = yield prisma.user.create({
                data: {
                    name: "Quiz Admin",
                    email,
                    password: yield bcryptjs_1.default.hash("password123", 10),
                },
            });
        }
        for (const t of tests) {
            const exists = yield prisma.test.findFirst({
                where: { title: t.title, userId: user.id },
            });
            if (exists) {
                console.log("skip (exists):", t.title);
                continue;
            }
            const test = yield prisma.test.create({
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
            yield prisma.question.createMany({
                data: t.questions.map((x) => ({
                    testId: test.id,
                    problemStatement: x.q,
                    correctOption: x.correct,
                    option: x.options,
                })),
            });
            console.log("created:", t.title);
        }
    });
}
main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
