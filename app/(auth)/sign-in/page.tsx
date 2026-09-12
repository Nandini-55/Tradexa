'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, Play, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signInWithEmail } from '@/lib/actions/auth.actions';
import GoogleSignInButton from '@/components/forms/GoogleSignInButton';

const SignIn = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onBlur',
    });

    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await signInWithEmail(data);
            if (result.success) {
                toast.success('Welcome back!');
                router.push('/');
            } else {
                toast.error('Sign in failed', {
                    description: result.error || 'Invalid email or password.'
                });
            }
        } catch (e) {
            console.error(e);
            toast.error('Sign in failed', {
                description: e instanceof Error ? e.message : 'Failed to sign in.'
            });
        }
    };

    return (
        <div className="w-full max-w-4xl bg-[#111216] rounded-[2.5rem] shadow-[0_35px_80px_-15px_rgba(25,15,50,0.65)] border border-white/5 p-3 sm:p-4 lg:p-5 flex flex-col md:flex-row items-stretch gap-4 sm:gap-6 overflow-hidden transition-all duration-300">
            {/* Left Column: Login Form */}
            <div className="w-full md:w-[50%] p-5 sm:p-7 lg:p-8 flex flex-col justify-center">
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        Welcome back <span className="inline-block hover:animate-bounce">👋</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-[#8E8A9F] mt-1.5 font-normal">
                        Sign in to access your portfolio and trade in real time.
                    </p>
                </div>

                {/* Google Sign-In */}
                <div className="space-y-4 mb-4">
                    <GoogleSignInButton
                        text="Continue with Google"
                        className="!bg-[#1D1E24] !border-[#2E303B] hover:!bg-[#262832] !text-white !rounded-2xl !h-12 !font-medium"
                    />

                    <div className="relative flex items-center justify-center my-3">
                        <div className="border-t border-[#2B2C36] w-full" />
                        <span className="bg-[#111216] px-3 text-[11px] uppercase tracking-wider text-[#79768B] absolute font-medium">
                            or continue with email
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-1">
                        <div className="relative flex items-center bg-[#1D1E24] border border-[#2E303B] focus-within:border-[#793AF5] focus-within:ring-2 focus-within:ring-[#793AF5]/20 rounded-2xl h-[52px] px-4 transition-all">
                            <Mail className="h-5 w-5 text-[#7E7A91] shrink-0 mr-3" />
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full bg-transparent text-white placeholder-[#6C687D] text-sm sm:text-base outline-none font-medium"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: { value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, message: 'Valid email required' }
                                })}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-rose-400 pl-2">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                        <div className="relative flex items-center bg-[#1D1E24] border border-[#2E303B] focus-within:border-[#793AF5] focus-within:ring-2 focus-within:ring-[#793AF5]/20 rounded-2xl h-[52px] px-4 transition-all">
                            <Lock className="h-5 w-5 text-[#7E7A91] shrink-0 mr-3" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full bg-transparent text-white placeholder-[#6C687D] text-sm sm:text-base outline-none font-medium"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Minimum 6 characters' }
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-[#7E7A91] hover:text-white transition-colors ml-2 focus:outline-none cursor-pointer"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-rose-400 pl-2">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end pt-0.5">
                        <button
                            type="button"
                            onClick={() => toast.info('Password reset instructions will be sent to your email')}
                            className="text-xs text-[#8E8A9F] hover:text-[#B692F6] transition-colors cursor-pointer"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    {/* Log In Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-[52px] mt-2 rounded-2xl bg-gradient-to-r from-[#6231F5] via-[#753DF7] to-[#8749FA] hover:from-[#5424E3] hover:to-[#7737EB] text-white font-bold text-base shadow-[0_10px_25px_-5px_rgba(110,45,245,0.5)] hover:shadow-[0_12px_30px_-5px_rgba(110,45,245,0.7)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Logging in...</span>
                            </>
                        ) : (
                            <>
                                <span>Log In</span>
                                <Play className="h-3.5 w-3.5 fill-white text-white ml-0.5" />
                            </>
                        )}
                    </button>

                    {/* Sign Up Link */}
                    <div className="text-center pt-2">
                        <p className="text-xs sm:text-sm text-[#8E8A9F]">
                            Don't have an account?{' '}
                            <Link href="/sign-up" className="text-white hover:text-[#B692F6] font-semibold underline underline-offset-4 transition-colors">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </form>
            </div>

            {/* Right Column: Scenic Artwork (as shown in reference image) */}
            <div className="hidden md:flex md:w-[50%] relative min-h-[460px] lg:min-h-[520px] rounded-[2rem] overflow-hidden shadow-2xl border border-white/5">
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

export default SignIn;
