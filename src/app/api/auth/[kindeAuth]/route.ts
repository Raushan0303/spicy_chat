import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { authConfig } from "@/lib/auth.config";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { kindeAuth: string } }
) {
  return handleAuth(request, params.kindeAuth, authConfig);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { kindeAuth: string } }
) {
  return handleAuth(request, params.kindeAuth, authConfig);
}
