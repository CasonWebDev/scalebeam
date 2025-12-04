import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFileAdmin, getPublicUrl, generateUniqueFileName } from "@/lib/supabase-storage";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.FIGMA_API_TOKEN}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { campaignId } = await params;
        const body = await request.json();
        const { name, url, format, width, height, thumbnailUrl, imageBase64 } = body;

        if (!name || !format || (!url && !imageBase64)) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        let finalUrl = url;

        if (imageBase64) {
            // Remove header if present (e.g., "data:image/png;base64,")
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");

            const fileName = generateUniqueFileName(`${name}.${format}`);
            const filePath = `creatives/${campaignId}/${fileName}`;
            const contentType = `image/${format}`;

            await uploadFileAdmin({
                bucket: "assets",
                path: filePath,
                file: buffer,
                contentType: contentType,
            });

            finalUrl = getPublicUrl("assets", filePath);
        }

        const creative = await prisma.creative.create({
            data: {
                name,
                url: finalUrl,
                format,
                width,
                height,
                thumbnailUrl,
                projectId: campaignId,
            },
        });

        return NextResponse.json(creative);
    } catch (error: any) {
        console.error("Error creating creative:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error", details: error.toString() },
            { status: 500 }
        );
    }
}
