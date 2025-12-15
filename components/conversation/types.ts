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
   type: z
      .enum(["text", "project", "experience", "education"])
      .describe(
         "The type of the message, should be either 'text' or 'project' or 'experience' or 'education'."
      ),
   content: z
      .json()
      .describe(
         "The content of the message, should be a normalConversationSchema object, ProjectData object, or ExperienceData object."
      ),
});

export const chatResponseSchema = z
   .object({
      messages: z.array(messageSchema),
      voiceOutput: z.string(),
      timestamp: z.number(),
      emote: z
         .enum(["happy", "sad", "angry", "surprised", "confused"])
         .describe("The emote of the avatar"),
   })
   .describe(
      `The response of the chat, should be a ChatResponse object, with the following format: { messages: [MessageSchema]: ${messageSchema.description}, voiceOutput: string }.`
   );

export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Project = z.infer<typeof projectDataSchema>;
export type Experience = z.infer<typeof experienceDataSchema>;
