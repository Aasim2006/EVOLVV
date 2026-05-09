import { NextResponse } from "next/server";

export async function POST(request) {
  const { items = [] } = await request.json();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return NextResponse.json({ subtotal, shipping: subtotal ? 12 : 0, total: subtotal ? subtotal + 12 : 0 });
}
