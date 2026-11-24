import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect, useCallback } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"

export const useInterview = () => {
    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = useCallback(async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            return { success: true, data: response.interviewReport }
        } catch (error) {
            console.error("Error generating report:", error)
            const message = error.response?.data?.message || error.message || "Failed to generate interview strategy."
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReport])

    const getReportById = useCallback(async (id) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(id)
            setReport(response.interviewReport)
            return { success: true, data: response.interviewReport }
        } catch (error) {
            console.error("Error fetching report:", error)
            const message = error.response?.data?.message || "Interview report not found."
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReport])

    const getReports = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports || [])
            return { success: true, data: response.interviewReports }
        } catch (error) {
            console.error("Error fetching reports:", error)
            const message = error.response?.data?.message || "Failed to load past reports."
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReports])

    const getResumePdf = useCallback(async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            return { success: true }
        }
        catch (error) {
            console.error("Error generating PDF:", error)
            const message = error.response?.data?.message || "Failed to generate resume PDF."
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }, [setLoading])

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId, getReportById, getReports ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }
}

