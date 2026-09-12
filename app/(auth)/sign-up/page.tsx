'use client';

import {useForm} from "react-hook-form";
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import SelectField from "@/components/forms/SelectField";
import {INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS} from "@/lib/constants";
import {CountrySelectField} from "@/components/forms/CountrySelectField";
import FooterLink from "@/components/forms/FooterLink";
import {signUpWithEmail} from "@/lib/actions/auth.actions";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import GoogleSignInButton from "@/components/forms/GoogleSignInButton";

const SignUp = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            country: 'US',
            investmentGoals: 'Growth',
            riskTolerance: 'Medium',
            preferredIndustry: 'Technology'
        },
        mode: 'onBlur'
    });

    const onSubmit = async (data: SignUpFormData) => {
        try {
            const result = await signUpWithEmail(data);
            if (result.success) {
                router.push('/');
            } else {
                toast.error('Sign up failed', {
                    description: result.error || 'Failed to create an account.'
                });
            }
        } catch (e) {
            console.error(e);
            toast.error('Sign up failed', {
                description: e instanceof Error ? e.message : 'Failed to create an account.'
            });
        }
    };

    return (
        <div className="w-full max-w-4xl bg-[#111216] rounded-[2.5rem] shadow-[0_35px_80px_-15px_rgba(25,15,50,0.65)] border border-white/5 p-3 sm:p-4 lg:p-5 flex flex-col md:flex-row items-stretch gap-4 sm:gap-6 overflow-hidden transition-all duration-300">
            {/* Left Column: Sign Up Form */}
            <div className="w-full md:w-[52%] p-5 sm:p-7 lg:p-8 flex flex-col justify-center max-h-[85vh] overflow-y-auto scrollbar-hide-default">
                <div className="mb-5">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        Create Account <span className="inline-block">🚀</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-[#8E8A9F] mt-1 font-normal">
                        Sign up to get 10,000 Virtual Coins & real-time trading
                    </p>
                </div>

                <div className="space-y-4 mb-4">
                    <GoogleSignInButton
                        text="Sign up with Google"
                        className="!bg-[#1D1E24] !border-[#2E303B] hover:!bg-[#262832] !text-white !rounded-2xl !h-12 !font-medium"
                    />

                    <div className="relative flex items-center justify-center my-2">
                        <div className="border-t border-[#2B2C36] w-full" />
                        <span className="bg-[#111216] px-3 text-[11px] uppercase tracking-wider text-[#79768B] absolute font-medium">
                            or register with email
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <InputField
                        name="fullName"
                        label="Full Name"
                        placeholder="John Doe"
                        register={register}
                        error={errors.fullName}
                        validation={{ required: 'Full name is required', minLength: 2 }}
                    />

                    <InputField
                        name="email"
                        label="Email"
                        placeholder="contact@jsmastery.com"
                        register={register}
                        error={errors.email}
                        validation={{ required: 'Email is required', pattern: /^\w+@\w+\.\w+$/, message: 'Email address is required' }}
                    />

                    <InputField
                        name="password"
                        label="Password"
                        placeholder="Enter a strong password"
                        type="password"
                        register={register}
                        error={errors.password}
                        validation={{ required: 'Password is required', minLength: 8 }}
                    />

                    <CountrySelectField
                        name="country"
                        label="Country"
                        control={control}
                        error={errors.country}
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SelectField
                            name="investmentGoals"
                            label="Investment Goals"
                            placeholder="Goal"
                            options={INVESTMENT_GOALS}
                            control={control}
                            error={errors.investmentGoals}
                            required
                        />

                        <SelectField
                            name="riskTolerance"
                            label="Risk Tolerance"
                            placeholder="Risk"
                            options={RISK_TOLERANCE_OPTIONS}
                            control={control}
                            error={errors.riskTolerance}
                            required
                        />
                    </div>

                    <SelectField
                        name="preferredIndustry"
                        label="Preferred Industry"
                        placeholder="Select preferred industry"
                        options={PREFERRED_INDUSTRIES}
                        control={control}
                        error={errors.preferredIndustry}
                        required
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-[52px] mt-2 rounded-2xl bg-gradient-to-r from-[#6231F5] via-[#753DF7] to-[#8749FA] hover:from-[#5424E3] hover:to-[#7737EB] text-white font-bold text-base shadow-[0_10px_25px_-5px_rgba(110,45,245,0.5)] hover:shadow-[0_12px_30px_-5px_rgba(110,45,245,0.7)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                    >
                        {isSubmitting ? 'Creating Account...' : 'Sign Up ▶'}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-xs sm:text-sm text-[#8E8A9F]">
                            Already have an account?{' '}
                            <Link href="/sign-in" className="text-white hover:text-[#B692F6] font-semibold underline underline-offset-4 transition-colors">
                                Log In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>

            {/* Right Column: Scenic Artwork */}
            <div className="hidden md:flex md:w-[48%] relative min-h-[500px] rounded-[2rem] overflow-hidden shadow-2xl border border-white/5">
                <Image
                    src="/assets/images/login-scenery.jpg"
                    alt="Scenic landscape art"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700 ease-out"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111216]/40 via-transparent to-transparent pointer-events-none" />
            </div>
        </div>
    );
};
export default SignUp;
