import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";


const BACKEND = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_KEY = process.env.ADMIN_API_KEY;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const res = await fetch(`${BACKEND}/admin/skills`, {
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
  const { id, action } = await req.json(); // action: 'approve' or 'reject'
  let endpoint = `${BACKEND}/admin/skills/${id}/${action}`;
  const res = await fetch(endpoint, {
    method: "PATCH",
    headers: { "x-admin-key": ADMIN_KEY! },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  const res = await fetch(`${BACKEND}/admin/skills/${id}`, {
    method: "DELETE",
    headers: { "x-admin-key": ADMIN_KEY! },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}