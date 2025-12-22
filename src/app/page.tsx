
import { redirect } from "next/navigation";

export default function RootPage() {
  // Immediately redirect to dashboard
  // Since we are "offline", we don't need a landing page or login page.
  redirect("/dashboard");
}
