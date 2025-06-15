
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, Leaf, Sparkles, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-emerald-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-96 h-96 bg-green-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-200/30 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left section - Brand */}
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
          
          {/* Decorative elements */}
          <div className="hidden lg:flex items-center space-x-4 text-green-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Innovation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse delay-300"></div>
              <span className="text-sm">Growth</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-600 rounded-full animate-pulse delay-700"></div>
              <span className="text-sm">Excellence</span>
            </div>
          </div>
        </div>
        
        {/* Right section - Login form */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md">
            <div className="bg-white/90 backdrop-blur-xl rounded-lg shadow-2xl border border-green-200/50 p-12 space-y-8 transform hover:scale-[1.02] transition-all duration-300">
              
              {/* Form header */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Welcome Back
                </h2>
                <p className="text-green-700">Sign in to your account</p>
              </div>
              
              {/* Login form */}
              <div className="space-y-6">
                
                {/* Email field */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-green-800 flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-green-600" />
                    <span>Email Address</span>
                  </label>
                  <div className="relative group">
                    <Input
                      type="email"
                      placeholder="your.email@krunal.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-5 bg-white/80 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 text-green-800 placeholder:text-green-400"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400 group-focus-within:text-green-600 transition-colors" />
                  </div>
                </div>
                
                {/* Password field */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-green-800 flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span>Password</span>
                  </label>
                  <div className="relative group">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-5 bg-white/80 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 text-green-800 placeholder:text-green-400"
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400 group-focus-within:text-green-600 transition-colors" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-600 transition-colors"
                    >
                      {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                {/* Forgot password */}
                <div className="text-right">
                  <Link to='/forgetpassword' className="text-sm text-green-600 hover:text-green-800 transition-colors font-medium">
                    Forgot your password?
                  </Link>
                </div>
                
                {/* Login button */}
                <Button className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 text-lg">
                  <span className="flex items-center justify-center space-x-2">
                    <span>regeste</span>
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </span>
                </Button>
                
              </div>
              
              {/* Sign up link */}
              {/* <div className="text-center pt-4">
                <p className="text-green-700">
                  New to krunal Institute?{" "}
                  <a href="#" className="font-semibold text-green-600 hover:text-green-800 transition-colors hover:underline">
                    Create an account
                  </a>
                </p>
              </div> */}
              
            </div>
            
      
            
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default Login