"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function IssuesCreateRedirect() {
	const router = useRouter()
	useEffect(() => {
		// Redirect to the citizen create page
		router.replace("/citizen/create")
	}, [router])
	return null
}
