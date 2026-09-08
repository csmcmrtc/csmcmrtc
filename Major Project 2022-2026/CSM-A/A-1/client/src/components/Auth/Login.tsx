import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, clearError } from '../../store/slices/authSlice';

interface LoginProps {
  setOpenAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setAuthOption: React.Dispatch<React.SetStateAction<'login' | 'signup'>>;
}

const Login: React.FC<LoginProps> = ({ setOpenAuth, setAuthOption }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error: authError } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState<string>('');

  // Clear auth error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle auth error
  useEffect(() => {
    if (authError) {
      setErrors({ general: authError });
    }
  }, [authError]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setErrors({});
    setSuccess('');

    try {
      await dispatch(login({
        email: formData.email,
        password: formData.password
      })).unwrap();
      
      toast.success('Login successful! Welcome Back.');
      setSuccess('Login successful! Welcome back!');
      
      setTimeout(() => {
        setOpenAuth(false);
      }, 1000);
      
    } catch (error: any) {
      toast.error(error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <img src="/JS_logo.jpg" alt="JS" className='w-10 h-10 rounded-full' />
              <h2 className="text-xl font-bold text-gray-900">
                Welcome Back!
              </h2>
            </div>
            <button
              onClick={() => setOpenAuth(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <p className="text-gray-600 mb-6 text-center">
              Sign in to your account to start saving money
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.general && (
                <div className="bg-error-50 border border-error-200 rounded-lg p-3 flex items-center">
                  <AlertCircle className="w-4 h-4 text-error-500 mr-2 flex-shrink-0" />
                  <span className="text-error-700 text-sm">{errors.general}</span>
                </div>
              )}

              {success && (
                <div className="bg-success-50 border border-success-200 rounded-lg p-3 flex items-center">
                  <CheckCircle className="w-4 h-4 text-success-500 mr-2 flex-shrink-0" />
                  <span className="text-success-700 text-sm">{success}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm ${
                      errors.email 
                        ? 'border-error-500 focus:border-error-500' 
                        : 'border-gray-300 focus:border-brand'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-error-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm ${
                      errors.password 
                        ? 'border-error-500 focus:border-error-500' 
                        : 'border-gray-300 focus:border-brand'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-error-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                
                <button
                  type="button"
                  className="text-sm text-brand hover:text-blue-600 font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-medium text-sm font-medium text-white transition-all ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-brand hover:bg-blue-600  cursor-pointer transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Social Login Options */}
            {/* <div className="mt-5">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-soft bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                  <span>Google</span>
                </button>
                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-soft bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                  <span>Twitter</span>
                </button>
              </div>
            </div> */}

            {/* Sign Up Link */}
            <div className="mt-5 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setAuthOption('signup')
                  }}
                  className="font-medium text-brand hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
    </>
  );
};

export default Login;