import { redirect } from "next/navigation"

// Redirect old projects route to new campaigns route
export default async function ClientProjectDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/client/campaigns/${id}`)
}
