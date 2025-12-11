import z from "zod";

export type MessageType = "text" | "project";

export const normalConversationSchema = z.object({
   text: z.string(),
});

export const projectDataSchema = z.object({
   title: z.string(),
   description: z.string(),
   link: z.string(),
   tags: z.array(z.string()).optional(),
   image: z.string().optional(),
});

export const experienceDataSchema = z.object({
   company: z.string(),
   role: z.string(),
   period: z.string(),
   jobDescription: z.string(),
});

export const messageSchema = z.object({
   id: z.string(),
   type: z.enum(["text", "project"]),
   content: z
      .json()
      .describe(
         "The content of the message, should be a normalConversationSchema object, ProjectData object, or ExperienceData object."
      ),
   timestamp: z.number(),
   voiceOutput: z.string(),
   emote: z
      .enum(["happy", "sad", "angry", "surprised", "confused"])
      .describe("The emote of the avatar"),
});

export type Message = z.infer<typeof messageSchema>;
export type ProjectData = z.infer<typeof projectDataSchema>;
export type ExperienceData = z.infer<typeof experienceDataSchema>;
