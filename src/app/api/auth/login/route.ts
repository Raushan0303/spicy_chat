import { NextRequest } from "next/server";
import { handleLogin } from "@/lib/kinde-auth";

export async function GET(request: NextRequest) {
  return handleLogin(request);
}
