import { miniSearch } from "@/lib/Search/search"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const mini = await miniSearch

  const searchParams = req.nextUrl.searchParams
  const query = searchParams.get("q") ?? ""

  const results = mini?.search(query)

  return NextResponse.json({ results })
}
