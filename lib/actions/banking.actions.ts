'use server';

import { connectToDatabase } from "@/database/mongoose";
import Loan, { ILoan } from "@/database/models/loan.model";
import Portfolio from "@/database/models/portfolio.model";
import Transaction from "@/database/models/transaction.model";
import { revalidatePath } from "next/cache";

export interface BankingOverview {
    walletBalance: number;
    totalActiveDebt: number;
    totalBorrowedLifetime: number;
    activeLoansCount: number;
    repaidLoansCount: number;
    creditScore: number;
    tierRating: string;
    maxCreditLimit: number;
    availableCredit: number;
    activeLoans: any[];
    repaidLoans: any[];
}

export async function getBankingOverview(userId: string): Promise<BankingOverview> {
    try {
        await connectToDatabase();

        // Get or initialize user portfolio
        let portfolio = await Portfolio.findOne({ userId });
        if (!portfolio) {
            portfolio = await Portfolio.create({
                userId,
                balance: 10000,
                holdings: [],
            });
        }

        const activeLoans = await Loan.find({ userId, status: 'ACTIVE' }).sort({ createdAt: -1 }).lean();
        const repaidLoans = await Loan.find({ userId, status: 'REPAID' }).sort({ repaidAt: -1 }).limit(10).lean();

        const totalActiveDebt = activeLoans.reduce(
            (sum: number, loan: any) => sum + (loan.totalRepaymentAmount - (loan.amountPaid || 0)),
            0
        );

        const totalBorrowedLifetime = [...activeLoans, ...repaidLoans].reduce(
            (sum: number, loan: any) => sum + (loan.principalAmount || 0),
            0
        );

        const repaidCount = repaidLoans.length;
        const activeCount = activeLoans.length;

        // Dynamic credit scoring algorithm
        let creditScore = 750 + (repaidCount * 25) - (activeCount > 2 ? 15 : 0);
        if (creditScore > 850) creditScore = 850;
        if (creditScore < 500) creditScore = 500;

        let tierRating = 'AAA (Prime Kuber)';
        let maxCreditLimit = 250000;

        if (creditScore >= 800) {
            tierRating = 'AAA (Prime Kuber)';
            maxCreditLimit = 500000;
        } else if (creditScore >= 740) {
            tierRating = 'AA (Kuber Gold)';
            maxCreditLimit = 250000;
        } else if (creditScore >= 670) {
            tierRating = 'A (Kuber Silver)';
            maxCreditLimit = 150000;
        } else {
            tierRating = 'B (Standard)';
            maxCreditLimit = 75000;
        }

        const availableCredit = Math.max(0, maxCreditLimit - totalActiveDebt);

        return {
            walletBalance: portfolio.balance,
            totalActiveDebt,
            totalBorrowedLifetime,
            activeLoansCount: activeCount,
            repaidLoansCount: repaidCount,
            creditScore,
            tierRating,
            maxCreditLimit,
            availableCredit,
            activeLoans: JSON.parse(JSON.stringify(activeLoans)),
            repaidLoans: JSON.parse(JSON.stringify(repaidLoans)),
        };
    } catch (error) {
        console.error("Error in getBankingOverview:", error);
        return {
            walletBalance: 0,
            totalActiveDebt: 0,
            totalBorrowedLifetime: 0,
            activeLoansCount: 0,
            repaidLoansCount: 0,
            creditScore: 750,
            tierRating: 'AAA (Prime Kuber)',
            maxCreditLimit: 250000,
            availableCredit: 250000,
            activeLoans: [],
            repaidLoans: [],
        };
    }
}

export async function takeLoan(
    userId: string,
    data: {
        principalAmount: number;
        durationDays?: number;
        loanTier?: string;
    }
) {
    try {
        await connectToDatabase();

        const { principalAmount, durationDays = 14, loanTier = 'CUSTOM' } = data;

        if (!userId) {
            return { success: false, error: "User ID is required." };
        }

        if (!principalAmount || principalAmount < 100) {
            return { success: false, error: "Minimum loan amount is 100 Coins." };
        }

        // Check active loans limit
        const activeLoans = await Loan.find({ userId, status: 'ACTIVE' });
        if (activeLoans.length >= 8) {
            return {
                success: false,
                error: "You have reached the maximum limit of active loans. Please repay an existing loan to borrow more.",
            };
        }

        const overview = await getBankingOverview(userId);
        if (principalAmount > overview.availableCredit) {
            return {
                success: false,
                error: `Requested amount (🪙 ${principalAmount.toLocaleString()}) exceeds your available Kuber Credit Limit of 🪙 ${overview.availableCredit.toLocaleString()}.`,
            };
        }

        // Determine interest rate based on tier
        let interestRate = 5;
        if (loanTier === 'STARTER') interestRate = 3;
        else if (loanTier === 'TRADER') interestRate = 5;
        else if (loanTier === 'VAULT') interestRate = 8;
        else {
            interestRate = durationDays <= 7 ? 3 : durationDays <= 14 ? 5 : 8;
        }

        const interestAmount = Math.round((principalAmount * (interestRate / 100)) * 100) / 100;
        const totalRepaymentAmount = principalAmount + interestAmount;
        const dueDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

        // Create loan
        const loan = await Loan.create({
            userId,
            loanTier,
            principalAmount,
            interestRate,
            interestAmount,
            totalRepaymentAmount,
            amountPaid: 0,
            status: 'ACTIVE',
            durationDays,
            dueDate,
            disbursedAt: new Date(),
        });

        // Credit to user portfolio
        let portfolio = await Portfolio.findOne({ userId });
        if (!portfolio) {
            portfolio = await Portfolio.create({
                userId,
                balance: 10000 + principalAmount,
                holdings: [],
            });
        } else {
            portfolio.balance += principalAmount;
            await portfolio.save();
        }

        // Record transaction
        await Transaction.create({
            userId,
            symbol: 'KUBERX',
            type: 'LOAN_DISBURSED',
            quantity: 1,
            price: principalAmount,
            totalAmount: principalAmount,
            date: new Date(),
        });

        revalidatePath('/kuberx');
        revalidatePath('/trading');
        revalidatePath('/');

        const updatedOverview = await getBankingOverview(userId);

        return {
            success: true,
            message: `Disbursed 🪙 ${principalAmount.toLocaleString()} to your wallet successfully!`,
            loan: JSON.parse(JSON.stringify(loan)),
            newBalance: portfolio.balance,
            overview: updatedOverview,
        };
    } catch (error: any) {
        console.error("Error in takeLoan:", error);
        return {
            success: false,
            error: error.message || "Failed to process loan request.",
        };
    }
}

export async function repayLoan(userId: string, loanId: string) {
    try {
        await connectToDatabase();

        if (!userId || !loanId) {
            return { success: false, error: "Missing required parameters." };
        }

        const loan = await Loan.findById(loanId);
        if (!loan || loan.userId !== userId) {
            return { success: false, error: "Loan record not found." };
        }

        if (loan.status !== 'ACTIVE') {
            return { success: false, error: "This loan has already been settled." };
        }

        const remainingAmount = loan.totalRepaymentAmount - (loan.amountPaid || 0);

        const portfolio = await Portfolio.findOne({ userId });
        if (!portfolio) {
            return { success: false, error: "Portfolio not found." };
        }

        if (portfolio.balance < remainingAmount) {
            return {
                success: false,
                error: `Insufficient wallet balance to repay. You need 🪙 ${remainingAmount.toFixed(2)}, but only have 🪙 ${portfolio.balance.toFixed(2)} in your wallet.`,
            };
        }

        // Deduct from wallet
        portfolio.balance -= remainingAmount;
        await portfolio.save();

        // Mark loan as repaid
        loan.amountPaid = loan.totalRepaymentAmount;
        loan.status = 'REPAID';
        loan.repaidAt = new Date();
        await loan.save();

        // Record repayment transaction
        await Transaction.create({
            userId,
            symbol: 'KUBERX',
            type: 'LOAN_REPAID',
            quantity: 1,
            price: remainingAmount,
            totalAmount: remainingAmount,
            date: new Date(),
        });

        revalidatePath('/kuberx');
        revalidatePath('/trading');
        revalidatePath('/');

        const updatedOverview = await getBankingOverview(userId);

        return {
            success: true,
            message: `Successfully repaid loan of 🪙 ${remainingAmount.toFixed(2)}! Your Kuber Credit Score has improved.`,
            newBalance: portfolio.balance,
            overview: updatedOverview,
        };
    } catch (error: any) {
        console.error("Error in repayLoan:", error);
        return {
            success: false,
            error: error.message || "Failed to repay loan.",
        };
    }
}

export async function quickTopUpWallet(userId: string, amount: number = 10000) {
    try {
        await connectToDatabase();
        let portfolio = await Portfolio.findOne({ userId });
        if (!portfolio) {
            portfolio = await Portfolio.create({ userId, balance: 10000 + amount, holdings: [] });
        } else {
            portfolio.balance += amount;
            await portfolio.save();
        }

        await Transaction.create({
            userId,
            symbol: 'KUBERX_GRANT',
            type: 'DEPOSIT',
            quantity: 1,
            price: amount,
            totalAmount: amount,
            date: new Date(),
        });

        revalidatePath('/kuberx');
        revalidatePath('/trading');
        revalidatePath('/');

        const updatedOverview = await getBankingOverview(userId);
        return {
            success: true,
            message: `Instantly added 🪙 ${amount.toLocaleString()} Virtual Coins to your wallet!`,
            newBalance: portfolio.balance,
            overview: updatedOverview,
        };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to top up wallet." };
    }
}
