'use server';

import { getAuth } from "@/lib/better-auth/auth";
import { inngest } from "@/lib/inngest/client";
import { headers } from "next/headers";

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry }: SignUpFormData) => {
    if (!process.env.MONGODB_URI) {
        return {
            success: false,
            error: 'Database connection string (MONGODB_URI) is missing in your .env file. Please configure your MongoDB Atlas URI.'
        };
    }

    try {
        const auth = await getAuth();
        const response = await auth.api.signUpEmail({ body: { email, password, name: fullName } })

        if (response) {
            try {
                await inngest.send({
                    name: 'app/user.created',
                    data: { email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry }
                });
            } catch (inngestErr) {
                console.warn("Inngest send error (non-fatal):", inngestErr);
            }
        }

        return { success: true, data: response }
    } catch (e: any) {
        console.error('Sign up failed:', e);
        let errorMsg = e?.message || 'Sign up failed';
        if (errorMsg.includes('MONGODB_URI')) {
            errorMsg = 'Database connection string (MONGODB_URI) is missing in your .env file.';
        } else if (errorMsg.includes('IP Whitelist') || errorMsg.includes('MongooseServerSelectionError')) {
            errorMsg = 'Cannot reach MongoDB Atlas. Please ensure your current IP is whitelisted in MongoDB Atlas.';
        }
        return { success: false, error: errorMsg };
    }
}

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    if (!process.env.MONGODB_URI) {
        return {
            success: false,
            error: 'Database connection string (MONGODB_URI) is missing in your .env file. Please configure your MongoDB Atlas URI.'
        };
    }

    try {
        const auth = await getAuth();
        const response = await auth.api.signInEmail({ body: { email, password } })

        return { success: true, data: response }
    } catch (e: any) {
        console.error('Sign in failed:', e);
        let errorMsg = e?.message || 'Sign in failed';
        if (errorMsg.includes('MONGODB_URI')) {
            errorMsg = 'Database connection string (MONGODB_URI) is missing in your .env file.';
        } else if (errorMsg.includes('IP Whitelist') || errorMsg.includes('MongooseServerSelectionError')) {
            errorMsg = 'Cannot reach MongoDB Atlas. Please ensure your current IP is whitelisted in MongoDB Atlas.';
        }
        return { success: false, error: errorMsg };
    }
}

export const signOut = async () => {
    try {
        const auth = await getAuth();
        await auth.api.signOut({ headers: await headers() });
        return { success: true }
    } catch (e: any) {
        console.error('Sign out failed:', e)
        return { success: false, error: e?.message || 'Sign out failed' }
    }
}
