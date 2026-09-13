import { Inngest } from "inngest";

export const inngest = new Inngest({
    id: 'tradexa',
    ai: { gemini: { apiKey: process.env.DEEPQUANT_API_KEY! } }
})
