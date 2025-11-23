import { redirect } from "next/navigation"

// Redirect old projects/new route to new campaigns/new route
export default function NewProjectRedirect() {
  redirect("/client/campaigns/new")
}
