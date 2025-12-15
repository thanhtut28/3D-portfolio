import { Message } from "@/components/conversation/types";
import { atom } from "jotai";

export const talkingAtom = atom(false);
export const thinkingAtom = atom(false);
export const messagesAtom = atom<Message[]>([]);
export const messageIndexAtom = atom(0);
export const isSubmittingAtom = atom(false);
export const isCameraSettledAtom = atom(false);

export const messageCountAtom = atom(get => get(messagesAtom).length);

export const currentMessageAtom = atom(get => {
   const messages = get(messagesAtom);
   const index = get(messageIndexAtom);
   return messages[index] ?? null;
});

export const hasMultipleMessagesAtom = atom(get => get(messagesAtom).length > 1);

export const canGoPrevAtom = atom(get => get(messageIndexAtom) > 0);

export const canGoNextAtom = atom(get => {
   const index = get(messageIndexAtom);
   const count = get(messageCountAtom);
   return index < count - 1;
});

// ACTION Atoms
export const goToPrevMessageAtom = atom(null, (get, set) => {
   const currentIndex = get(messageIndexAtom);
   if (currentIndex > 0) {
      set(messageIndexAtom, currentIndex - 1);
   }
});

export const goToNextMessageAtom = atom(null, (get, set) => {
   const currentIndex = get(messageIndexAtom);
   const messageCount = get(messageCountAtom);
   if (currentIndex < messageCount - 1) {
      set(messageIndexAtom, currentIndex + 1);
   }
});

export const resetConversationAtom = atom(null, (_get, set) => {
   set(messagesAtom, []);
   set(messageIndexAtom, 0);
   set(thinkingAtom, false);
   set(talkingAtom, false);
});

export const setChatResponseAtom = atom(null, (_get, set, messages: Message[]) => {
   set(messagesAtom, messages);
   set(messageIndexAtom, 0);
   set(thinkingAtom, false);
});

export const setErrorStateAtom = atom(null, (_get, set, errorText?: string) => {
   set(thinkingAtom, false);
   set(talkingAtom, false);
   set(messagesAtom, [
      {
         id: "error-text",
         type: "text",
         content: { text: errorText ?? "Oops! Something went wrong. Please try again." },
      },
   ]);
});
