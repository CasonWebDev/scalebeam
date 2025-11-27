import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.FIGMA_API_TOKEN}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
