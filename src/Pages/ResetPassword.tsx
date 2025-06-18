import { resetPassword } from "@/apis/masterAdminApis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Leaf, Sparkles, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

type FormData = {
  password: string;
  confirmPassword: string;
};

const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();
  const nav=useNavigate()

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = async (formData: FormData) => {
    try {
      let res = await resetPassword(formData, token);
      if (res?.status == 200) {
        Swal.fire({
          icon: "success",
          text: "Password Reset Successfully",
        });
        nav("/")
      }
    } catch (error) {
      console.error(error);
    }
  };

  const passwordValue = watch("password");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-emerald-100 flex items-center justify-center p-4 relative">
      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left */}
        <div className="text-center lg:text-left space-y-8 px-8">
          <div className="inline-flex items-center justify-center lg:justify-start space-x-3 mb-8">
            <div className="relative">
              <Leaf className="h-16 w-16 text-green-600 animate-bounce" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-green-500 animate-spin" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-7xl lg:text-8xl font-black bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-2xl tracking-tight">
              Grass
            </h1>
            <div className="space-y-2">
              <p className="text-2xl lg:text-3xl font-bold text-green-800">
                Institute of Excellence
              </p>
              <p className="text-lg text-green-700 max-w-md mx-auto lg:mx-0">
                Cultivating innovation, growing minds, and nurturing sustainable futures through cutting-edge education.
              </p>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md">
            <div className="bg-white/90 backdrop-blur-xl rounded-lg shadow-2xl border border-green-200/50 p-12 space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Set New Password
                </h2>
                <p className="text-green-700">Create a new password for your account</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-green-800 flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span>New Password</span>
                  </label>
                  <div className="relative group">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      className={`w-full pl-12 pr-12 py-5 bg-white/80 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-4 focus:ring-green-500/20 text-green-800 placeholder:text-green-400`}
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-600"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-green-800 flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span>Confirm Password</span>
                  </label>
                  <div className="relative group">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      {...register("confirmPassword", {
                        required: "Confirm password is required",
                        validate: (value) =>
                          value === passwordValue || "Passwords do not match",
                      })}
                      className={`w-full pl-12 pr-12 py-5 bg-white/80 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-4 focus:ring-green-500/20 text-green-800 placeholder:text-green-400`}
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-600"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 text-lg"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Reset Password</span>
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </span>
                </Button>

                <div className="text-right">
                  <Link
                    to="/"
                    className="text-sm text-green-600 hover:text-green-800 font-medium hover:underline"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
