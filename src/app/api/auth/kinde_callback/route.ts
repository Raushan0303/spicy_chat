import { NextRequest } from "next/server";
import { handleCallback } from "@/lib/kinde-auth";

export async function GET(request: NextRequest) {
  return handleCallback(request);
}
