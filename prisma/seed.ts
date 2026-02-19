import bcrypt from "bcryptjs";
import { Prisma, SubscriptionStatus, TextSource } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { QUOTES } from "../data/quotes";
import { COMMON_WORDS } from "../data/words";

const randomBetween = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;

async function seedUsers() {
  const demoPasswordHash = await bcrypt.hash("demo123", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@enhancetyping.local" },
    update: {
      name: "Demo User",
      passwordHash: demoPasswordHash,
      isPremium: true,
      subscriptionStatus: SubscriptionStatus.active
    },
    create: {
      email: "demo@enhancetyping.local",
      name: "Demo User",
      passwordHash: demoPasswordHash,
      isPremium: true,
      subscriptionStatus: SubscriptionStatus.active
    }
  });

  const proUser = await prisma.user.upsert({
    where: { email: "pro@enhancetyping.local" },
    update: {
      name: "Pro Sprinter",
      passwordHash: demoPasswordHash,
      isPremium: true,
      subscriptionStatus: SubscriptionStatus.active
    },
    create: {
      email: "pro@enhancetyping.local",
      name: "Pro Sprinter",
      passwordHash: demoPasswordHash,
      isPremium: true,
      subscriptionStatus: SubscriptionStatus.active
    }
  });

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: demoUser.id,
        followingId: proUser.id
      }
    },
    update: {},
    create: {
      followerId: demoUser.id,
      followingId: proUser.id
    }
  });

  return { demoUser, proUser };
}

async function seedWords() {
  const values = COMMON_WORDS.map((value) => ({ value }));
  await prisma.word.createMany({ data: values, skipDuplicates: true });
}

async function seedQuotes() {
  for (const quote of QUOTES) {
    await prisma.quote.upsert({
      where: { content: quote.content },
      update: quote,
      create: quote
    });
  }
}

async function seedResults(demoUserId: string, proUserId: string) {
  const existing = await prisma.typingResult.count();
  if (existing > 80) {
    return;
  }

  const names = ["RapidRaven", "KeySage", "SwiftMint", "NeonType", "PulsePilot"];
  const durations = [15, 30, 60, 120];
  const sources: TextSource[] = ["words", "quote"];

  const payload: Prisma.TypingResultCreateManyInput[] = [];
  for (let i = 0; i < 150; i++) {
    const duration = durations[i % durations.length];
    const source = sources[i % sources.length];
    const baseWpm = source === "quote" ? 72 : 90;
    const variance = duration === 15 ? 22 : duration === 30 ? 18 : duration === 60 ? 14 : 10;
    const wpm = randomBetween(baseWpm - variance, baseWpm + variance);
    const accuracy = randomBetween(90, 99.5);
    const totalChars = Math.round((wpm * 5 * duration) / 60);
    const incorrectChars = Math.max(1, Math.round(totalChars * ((100 - accuracy) / 100)));
    const correctChars = totalChars - incorrectChars;

    payload.push({
      userId: i % 6 === 0 ? proUserId : i % 7 === 0 ? demoUserId : null,
      displayName: i % 6 === 0 ? "Pro Sprinter" : i % 7 === 0 ? "Demo User" : names[i % names.length],
      mode: "standard",
      durationSeconds: duration,
      textSource: source,
      wpm,
      rawWpm: Math.round((wpm + randomBetween(3, 15)) * 100) / 100,
      accuracy,
      errors: Math.round(incorrectChars / 2),
      correctChars,
      incorrectChars,
      totalChars,
      consistency: randomBetween(75, 98),
      inputHistory: Prisma.JsonNull,
      createdAt: new Date(Date.now() - i * 1000 * 60 * 32)
    });
  }

  await prisma.typingResult.createMany({ data: payload });
}

async function main() {
  const users = await seedUsers();
  await seedWords();
  await seedQuotes();
  await seedResults(users.demoUser.id, users.proUser.id);
  console.log(`Seeded ${COMMON_WORDS.length} words, ${QUOTES.length} quotes, and demo results.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
