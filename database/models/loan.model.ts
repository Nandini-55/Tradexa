import { Schema, model, models, Document } from "mongoose";

export interface ILoan extends Document {
    userId: string;
    loanTier: string;
    principalAmount: number;
    interestRate: number; // in percentage e.g. 5
    interestAmount: number;
    totalRepaymentAmount: number;
    amountPaid: number;
    status: 'ACTIVE' | 'REPAID' | 'DEFAULTED';
    durationDays: number;
    dueDate: Date;
    disbursedAt: Date;
    repaidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    loanTier: {
        type: String,
        default: 'CUSTOM',
    },
    principalAmount: {
        type: Number,
        required: true,
        min: 100,
    },
    interestRate: {
        type: Number,
        required: true,
        default: 5,
    },
    interestAmount: {
        type: Number,
        required: true,
    },
    totalRepaymentAmount: {
        type: Number,
        required: true,
    },
    amountPaid: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'REPAID', 'DEFAULTED'],
        default: 'ACTIVE',
        index: true,
    },
    durationDays: {
        type: Number,
        default: 14,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    disbursedAt: {
        type: Date,
        default: Date.now,
    },
    repaidAt: {
        type: Date,
    },
}, { timestamps: true });

const Loan = models.Loan || model<ILoan>("Loan", LoanSchema);

export default Loan;
