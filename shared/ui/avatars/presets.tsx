import type { AvatarKey } from "@/entities/user";

type AvatarDef = {
  key: AvatarKey;
  label: string;
  bg: string;        // background color (hex)
  emoji: string;     // unicode glyph used as the face
};

export const AVATAR_PRESETS: AvatarDef[] = [
  { key: "robot",   label: "Robot",   bg: "#94A3B8", emoji: "🤖" },
  { key: "koala",   label: "Koala",   bg: "#A8B5C8", emoji: "🐨" },
  { key: "fox",     label: "Lis",     bg: "#FB923C", emoji: "🦊" },
  { key: "panda",   label: "Panda",   bg: "#E5E7EB", emoji: "🐼" },
  { key: "cat",     label: "Kot",     bg: "#FBBF24", emoji: "🐱" },
  { key: "dog",     label: "Pies",    bg: "#D2A56B", emoji: "🐶" },
  { key: "ghost",   label: "Duszek",  bg: "#C7D2FE", emoji: "👻" },
  { key: "alien",   label: "Kosmita", bg: "#86EFAC", emoji: "👽" },
  { key: "dino",    label: "Dinozaur",bg: "#6EE7B7", emoji: "🦖" },
  { key: "bear",    label: "Miś",     bg: "#92400E", emoji: "🐻" },
  { key: "penguin", label: "Pingwin", bg: "#475569", emoji: "🐧" },
  { key: "owl",     label: "Sowa",    bg: "#78350F", emoji: "🦉" },
];

export const AVATAR_MAP: Record<AvatarKey, AvatarDef> =
  AVATAR_PRESETS.reduce((acc, def) => {
    acc[def.key] = def;
    return acc;
  }, {} as Record<AvatarKey, AvatarDef>);
