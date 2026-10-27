export type ModuleSlug = "reading" | "listening" | "writing" | "speaking";

export interface LearningModule {
  slug: ModuleSlug;
  title: string;
  eyebrow: string;
  description: string;
  phase: number;
  color: string;
  facts: { value: string; label: string }[];
  focus: { title: string; description: string }[];
  preparation: string;
  note: string;
}

export const learningModules: LearningModule[] = [
  {
    slug: "reading",
    title: "Read with purpose.",
    eyebrow: "Academic Reading",
    description:
      "Build the habits to follow an argument, find the detail, and understand what a passage is really saying.",
    phase: 2,
    color: "sage",
    facts: [
      { value: "3", label: "passages per full mock" },
      { value: "40", label: "questions per full mock" },
      { value: "60 min", label: "full mock duration" },
    ],
    focus: [
      { title: "Find the main idea", description: "Planned practice with passage structure, headings, and the writer’s purpose." },
      { title: "Notice the detail", description: "Planned question-type practice with explanations after submission." },
      { title: "Manage your time", description: "A future timed player with highlighting, flags, and saved answers." },
    ],
    preparation: "Reading practice will open after the exam engine and approved passages are ready.",
    note: "No passages or question sets have been published. The figures above describe the planned mock format, not your activity.",
  },
  {
    slug: "listening",
    title: "Find your listening rhythm.",
    eyebrow: "Academic Listening",
    description:
      "Make space for focused listening, from catching important details to following a longer conversation.",
    phase: 2,
    color: "peach",
    facts: [
      { value: "4", label: "parts per full mock" },
      { value: "40", label: "questions per full mock" },
      { value: "~30 min", label: "audio, plus review time" },
    ],
    focus: [
      { title: "Listen for meaning", description: "Planned practice for conversations, talks, and different question formats." },
      { title: "Replay and reflect", description: "Practice mode will offer playback controls and post-attempt transcripts." },
      { title: "Build exam confidence", description: "Mock mode will use once-play audio and a configurable review window." },
    ],
    preparation: "Listening practice will open when the player, approved recordings, and transcripts are ready.",
    note: "No audio is loaded or playing. Exact review timing will be configurable to match the selected practice format.",
  },
  {
    slug: "writing",
    title: "Give your ideas a clear shape.",
    eyebrow: "Academic Writing",
    description:
      "A considered workspace for describing visual information, developing an argument, and finding your own writing voice.",
    phase: 3,
    color: "lavender",
    facts: [
      { value: "2", label: "tasks per full mock" },
      { value: "60 min", label: "shared writing time" },
      { value: "150 / 250", label: "instructed minimum words" },
    ],
    focus: [
      { title: "Task 1 · Describe", description: "A future workspace for charts, maps, processes, and their key features." },
      { title: "Task 2 · Develop", description: "A future essay editor with word counts and saved drafts." },
      { title: "Choose your medium", description: "Typed submissions and paper writing with a separate upload-only window are planned." },
    ],
    preparation: "The editor and paper-upload flow are planned for Phase 3. OCR and feedback come in later phases.",
    note: "No writing is collected here. AI evaluation is not connected, and no band estimates are generated in this foundation release.",
  },
  {
    slug: "speaking",
    title: "Make room for your voice.",
    eyebrow: "Academic Speaking",
    description:
      "A calm place to practise expressing your ideas, extending your answers, and speaking with greater confidence.",
    phase: 6,
    color: "sky",
    facts: [
      { value: "3", label: "parts in the planned mock" },
      { value: "11–14 min", label: "approximate mock duration" },
      { value: "1 min", label: "Part 2 preparation" },
    ],
    focus: [
      { title: "Start a conversation", description: "Planned topic practice for personal experiences and familiar subjects." },
      { title: "Develop a longer turn", description: "Future cue cards, preparation notes, and timed speaking practice." },
      { title: "Listen and reflect", description: "Recorded practice will come first; live AI interviewing requires separate validation." },
    ],
    preparation: "Speaking practice is planned for Phase 6, starting with a reliable recording experience.",
    note: "Your microphone is not accessed. No recording, transcription, pronunciation scoring, or AI interviewer is active.",
  },
];

export function getLearningModule(slug: ModuleSlug): LearningModule {
  const learningModule = learningModules.find((item) => item.slug === slug);
  if (!learningModule) throw new Error(`Unknown learning module: ${slug}`);
  return learningModule;
}
