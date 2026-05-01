// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";


const BACKEND = process.env.NEXT_PUBLIC_API_URL; // e.g. http://localhost:5000/api
const ADMIN_KEY = process.env.ADMIN_API_KEY;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${BACKEND}/admin/users`, {
    headers: { "x-admin-key": ADMIN_KEY! },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { userId, role } = await req.json();
  const res = await fetch(`${BACKEND}/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": ADMIN_KEY!,
    },
    body: JSON.stringify({ role }),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");
  if (!userId) {
    return NextResponse.json({ message: "Missing user ID" }, { status: 400 });
  }

  const res = await fetch(`${BACKEND}/admin/users/${userId}`, {
    method: "DELETE",
    headers: { "x-admin-key": ADMIN_KEY! },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}