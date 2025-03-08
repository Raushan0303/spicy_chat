import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { isAuthenticated, getUser } = getKindeServerSession();

  if (!isAuthenticated) {
    redirect("/api/auth/login");
  }

  const user = await getUser();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.given_name}</h1>
      {/* Dashboard content */}
    </div>
  );
}
