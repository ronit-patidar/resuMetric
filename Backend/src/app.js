const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

app.use((err, req, res, next) => {
    console.error(err)
    if (err?.code === "credit_balance_exhausted" || err?.error?.code === "credit_balance_exhausted") {
        return res.status(503).json({
            message: "AI generation is temporarily unavailable because provider credits are exhausted. Check your Gemini API quota and billing settings, then try again."
        })
    }
    if (err?.status === 429 || err?.statusCode === 429) {
        return res.status(429).json({
            message: "The free Gemini quota is temporarily exhausted. Please wait and try again later, or use a different Gemini API key."
        })
    }
    const status = err.status || err.statusCode || 500
    res.status(status).json({
        message: status === 500
            ? "Something went wrong while processing your request. Please try again."
            : err?.error?.message || err.message || "Request failed."
    })
})



module.exports = app
