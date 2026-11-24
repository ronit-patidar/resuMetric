const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY,
    httpOptions: { apiVersion: "v1beta" }
})

const interviewReportSchema = z.object({
    matchScore: z.number(),
    technicalQuestions: z.array(z.object({ question: z.string(), intention: z.string(), answer: z.string() })),
    behavioralQuestions: z.array(z.object({ question: z.string(), intention: z.string(), answer: z.string() })),
    skillGaps: z.array(z.object({ skill: z.string(), severity: z.enum(["low", "medium", "high"]) })),
    preparationPlan: z.array(z.object({ day: z.number(), focus: z.string(), tasks: z.array(z.string()) })),
    title: z.string()
})

const model = () => process.env.GEMINI_MODEL || "gemini-3.5-flash"

async function requestJson({ schema, prompt }) {
    const response = await ai.models.generateContent({
        model: model(),
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(schema)
        }
    })
    return JSON.parse(response.text)
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    return requestJson({
        schema: interviewReportSchema,
        prompt: `Generate an interview report for a candidate.\nResume: ${resume}\nSelf Description: ${selfDescription}\nJob Description: ${jobDescription}`
    })
}

module.exports = { generateInterviewReport }
