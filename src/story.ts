import type { StoryStage } from "./progression";
export const priestName = "High Priest of Zeus";
export const opening: Record<
  Exclude<StoryStage, "complete">,
  { title: string; text: string; answer: string }
> = {
  awakening: {
    title: "A breath beneath the ruins",
    text: "Easy. Do not try to stand yet. I found you on the old road, barely breathing. You are safe here, in what remains of the sanctuary of Zeus.",
    answer: "Where am I?",
  },
  world: {
    title: "The world beyond",
    text: "Monsters roam the roads now. Our temples lie broken, and false Gods have taken the place of our Gods in the hearts of many. But the Gods have not abandoned us.",
    answer: "Why did you save me?",
  },
  calling: {
    title: "A path still open",
    text: "Because you were alive. What you do with that life is yours to decide. Rest here. When your strength returns, help me restore this sanctuary. It can become a beginning for us both.",
    answer: "I will help.",
  },
  familiar: {
    title: "You will not walk alone",
    text: "Before you go, I grant you a Familiar. A companion to share the road and stand beside you in the unknown. Give your Familiar a name, and care for the life entrusted to you.",
    answer: "Welcome, {familiar}.",
  },
  supplies: {
    title: "A place to begin",
    text: "The small cabin is yours. Take these drachmae and bread. Gather wood, stone and fiber for the old altar, and return to me when you are ready. We will take the first step together.",
    answer: "Begin my journey",
  },
};
