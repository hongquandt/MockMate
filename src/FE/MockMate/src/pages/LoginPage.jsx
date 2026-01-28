import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/img/z7430605225117_544001c3f21b8fc1cb5af11cb46703c0.jpg';
import { authService } from '../services/api';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Load Facebook SDK
    useEffect(() => {
        // Initialize Facebook SDK
        window.fbAsyncInit = function() {
            window.FB.init({
                appId      : import.meta.env.VITE_FACEBOOK_APP_ID,
                cookie     : true,
                xfbml      : true,
                version    : 'v18.0'
            });
            console.log('Facebook SDK Initialized');
        };

        // Load SDK Script
        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authService.login(formData.email, formData.password);
            navigate('/'); // Redirect to home
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                // Fetch user info from Google
                const userInfo = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
                );

                await authService.socialLogin({
                    provider: 'Google',
                    token: tokenResponse.access_token,
                    email: userInfo.data.email,
                    name: userInfo.data.name,
                    avatarUrl: userInfo.data.picture
                });
                navigate('/');
            } catch (err) {
                console.error(err);
                setError('Google login failed. Please try again.');
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError('Google login failed. Please try again.'),
    });

    const handleFacebookLogin = () => {
        if (!window.FB) {
            setError('Facebook SDK is loading. Please wait a moment...');
            return;
        }

        setLoading(true);
        window.FB.login((response) => {
            console.log("FB Login Response:", response);
            if (response.authResponse) {
                // Get user info
                window.FB.api('/me', { fields: 'name,email,picture' }, async (userInfo) => {
                    console.log("FB User Info:", userInfo);
                    
                    let userEmail = userInfo.email;
                    if (!userEmail) {
                        // Fallback: Generate a placeholder email using Facebook User ID
                        // This allows users registered with Phone Number to still login
                        userEmail = `${userInfo.id}@facebook.fallback.com`;
                        console.log("No email provided by Facebook. Using fallback:", userEmail);
                    }

                    try {
                        const loginData = {
                            provider: 'Facebook',
                            token: response.authResponse.accessToken,
                            email: userEmail,
                            name: userInfo.name,
                            avatarUrl: userInfo.picture?.data?.url
                        };
                        console.log("Sending to Backend:", loginData);

                        await authService.socialLogin(loginData);
                        navigate('/');
                    } catch (err) {
                        console.error("Backend Login Error:", err);
                        // Show detailed error from backend
                        const errorMsg = err.response?.data?.message || err.message || 'Facebook login failed at server.';
                        setError(`Login failed: ${errorMsg}`);
                    } finally {
                        setLoading(false);
                    }
                });
            } else {
                setLoading(false);
                console.log('User cancelled login or did not fully authorize.');
            }
        }, { scope: 'public_profile,email' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 md:p-10">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <img src={logoImg} alt="MockMate Logo" className="h-16 w-16 object-contain rounded-2xl mb-4" />
                        <h1 className="text-3xl font-black text-[#0d141b] dark:text-white">MockMate</h1>
                        <p className="text-[#4c719a] dark:text-slate-400 text-center mt-2">
                            Nền tảng luyện tập phỏng vấn thông minh
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-[#0d141b] dark:text-white mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c719a] material-symbols-outlined text-xl">
                                    mail
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@gmail.com"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#cfdbe7] dark:border-slate-600 bg-white dark:bg-slate-700 text-[#0d141b] dark:text-white placeholder:text-[#4c719a]/50 focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-[#0d141b] dark:text-white">
                                    Mật khẩu
                                </label>
                                <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                                    Quên mật khẩu?
                                </Link>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c719a] material-symbols-outlined text-xl">
                                    lock
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-[#cfdbe7] dark:border-slate-600 bg-white dark:bg-slate-700 text-[#0d141b] dark:text-white placeholder:text-[#4c719a]/50 focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4c719a] hover:text-primary"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang đăng nhập...' : 'Log In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-[#cfdbe7] dark:bg-slate-700"></div>
                        <span className="text-sm text-[#4c719a] dark:text-slate-400">Hoặc tiếp tục với</span>
                        <div className="flex-1 h-px bg-[#cfdbe7] dark:bg-slate-700"></div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleGoogleLogin()}
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#cfdbe7] dark:border-slate-600 bg-white dark:bg-slate-700 text-[#0d141b] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-sm font-medium">Google</span>
                        </button>

                        <button 
                            type="button"
                            onClick={handleFacebookLogin}
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#cfdbe7] dark:border-slate-600 bg-white dark:bg-slate-700 text-[#0d141b] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          <span className="text-sm font-medium">Facebook</span>
                        </button>
                    </div>

                    {/* Register Link */}
                    <p className="text-center mt-6 text-sm text-[#4c719a] dark:text-slate-400">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-primary font-semibold hover:underline">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>

                {/* Footer Text */}
                <p className="text-center mt-6 text-xs text-[#4c719a] dark:text-slate-500">
                    Bằng việc đăng nhập, bạn đồng ý với{' '}
                    <a href="#" className="text-primary hover:underline">Điều khoản dịch vụ</a>
                    {' '}và{' '}
                    <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
