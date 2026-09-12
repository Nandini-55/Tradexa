import { getAuth } from "@/lib/better-auth/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
    try {
        const auth = await getAuth();
        return await toNextJsHandler(auth).GET(req);
    } catch (err: any) {
        console.error("Auth handler GET error:", err);
        return NextResponse.json(
            { error: "Auth service unavailable", details: err?.message },
            { status: 503 }
        );
    }
}

export const POST = async (req: Request) => {
    try {
        const auth = await getAuth();
        return await toNextJsHandler(auth).POST(req);
    } catch (err: any) {
        console.error("Auth handler POST error:", err);
        return NextResponse.json(
            { error: "Auth service unavailable", details: err?.message },
            { status: 503 }
        );
    }
}

