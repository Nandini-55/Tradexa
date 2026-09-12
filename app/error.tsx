'use client';

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
            <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border/50 shadow-2xl flex flex-col items-center text-center space-y-6">
                <Logo />

                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                    <AlertTriangle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
                    <p className="text-sm text-muted-foreground">
                        {error?.message?.includes("MongoDB") || error?.message?.includes("MONGODB")
                            ? "Database connection is currently unavailable. Please verify Atlas network access."
                            : "A temporary server error occurred. Please try reloading or check back in a moment."}
                    </p>
                    {error?.digest && (
                        <p className="text-xs text-muted-foreground/60 font-mono">
                            Error Code: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full">
                    <Button
                        onClick={() => reset()}
                        className="flex-1 yellow-btn flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>

                    <Link href="/" className="flex-1">
                        <Button variant="outline" className="w-full">
                            Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
