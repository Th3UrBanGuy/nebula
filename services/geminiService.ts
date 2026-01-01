// AI Integration has been removed.
// This file is kept as a placeholder to prevent import errors during transition,
// but it no longer contains active logic.

import { Channel } from "../types";

export const getChannelRecommendation = async (
  query: string, 
  channels: Channel[]
): Promise<{ channelId: string; reason: string } | null> => {
  return null;
};

export const chatWithAssistant = async (history: any[], userMessage: string) => {
    return "AI features are currently disabled.";
}