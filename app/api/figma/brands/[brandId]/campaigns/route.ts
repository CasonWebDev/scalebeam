import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ brandId: string }> }
) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.FIGMA_API_TOKEN}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { brandId } = await params;
        const campaigns = await prisma.project.findMany({
            where: {
                brandId: brandId,
                projectType: "CAMPAIGN",
            },
            select: {
                id: true,
                name: true,
                status: true,
                briefingContent: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(campaigns);
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
