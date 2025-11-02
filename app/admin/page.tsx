import dynamic from "next/dynamic"

const AdminPageClient = dynamic(() => import("@/components/admin-page-client"), { ssr: false })

export default function Page() {
  return <AdminPageClient />
}
