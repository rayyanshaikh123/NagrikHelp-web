"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function IssuesIndexPage() {
	const router = useRouter()
	useEffect(() => {
		// Redirect to the public feed — keeps this route functional for now.
		router.replace("/citizen/public")
	}, [router])
	return null
}
