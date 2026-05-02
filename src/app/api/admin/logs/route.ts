import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const BACKEND = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_KEY = process.env.ADMIN_API_KEY;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") || "200";
  const type = searchParams.get("type") || "";

  const url = `${BACKEND}/admin/logs?limit=${limit}${type ? `&type=${type}` : ""}`;
  const res = await fetch(url, {
    headers: { "x-admin-key": ADMIN_KEY! },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}