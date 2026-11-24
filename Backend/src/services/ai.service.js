const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

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

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    try {
        const page = await browser.newPage()
        await page.setContent(htmlContent, { waitUntil: "networkidle0" })
        return await page.pdf({ format: "A4", margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" } })
    } finally {
        await browser.close()
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const schema = z.object({ html: z.string() })
    const content = await requestJson({
        schema,
        prompt: `Generate a professional, ATS-friendly 1-2 page HTML resume. Return one JSON object with an html field. Keep the design simple, readable, and human-written.\nResume: ${resume}\nSelf Description: ${selfDescription}\nJob Description: ${jobDescription}`
    })
    return generatePdfFromHtml(content.html)
}

module.exports = { generateInterviewReport, generateResumePdf }
