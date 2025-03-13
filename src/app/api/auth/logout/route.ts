import { NextRequest } from "next/server";
import { handleLogout } from "@/lib/kinde-auth";

export async function GET(request: NextRequest) {
  return handleLogout(request);
}
