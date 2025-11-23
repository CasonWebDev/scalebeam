import { redirect } from "next/navigation"

// Redirect old projects route to new campaigns route
export default function ClientProjectsRedirect() {
  redirect("/client/campaigns")
}
