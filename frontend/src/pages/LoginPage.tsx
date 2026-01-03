import React, { useState } from 'react';
import { AuthService, LoginRequest, RegisterRequest } from '../services/authService';


const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [loginData, setLoginData] = useState<LoginRequest>({
    username: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await AuthService.login(loginData);
      setSuccess('Login successful! Redirecting...');
      
      // Redirect to timer page
      setTimeout(() => {
        window.location.href = '/timer';
      }, 1000);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await AuthService.register(registerData);
      if (response.success) {
        setSuccess('Registration successful! Please login.');
        setIsLogin(true);
        setRegisterData({
          username: '',
          email: '',
          password: '',
          firstName: '',
          lastName: ''
        });
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      await AuthService.demoLogin();
      setSuccess('Demo login successful! Redirecting...');
      
      setTimeout(() => {
        window.location.href = '/timer';
      }, 1000);
    } catch (err) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-adaptive-secondary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-adaptive-primary mb-2">
          rubiX
        </h1>
        <h2 className="text-center text-xl text-adaptive-secondary">
          Speedcubing Practice Platform
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-adaptive-secondary py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-adaptive-primary">
          {error && (
            <div className="mb-4 px-4 py-3 rounded border bg-red-100 text-red-800 border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 px-4 py-3 rounded border bg-green-100 text-green-800 border-green-200">
              {success}
            </div>
          )}

          <div className="mb-6">
            <div className="flex">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 text-center rounded-l-md ${
                  isLogin
                    ? 'bg-primary-600 text-on-primary'
                    : 'bg-adaptive-tertiary text-adaptive-primary hover:bg-adaptive-secondary'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 text-center rounded-r-md ${
                  !isLogin
                    ? 'bg-primary-600 text-on-primary'
                    : 'bg-adaptive-tertiary text-adaptive-primary hover:bg-adaptive-secondary'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-adaptive-primary">
                  Username or Email
                </label>
                <input
                  type="text"
                  required
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className="form-input"
                  placeholder="Enter username or email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-adaptive-primary">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="form-input"
                  placeholder="Enter password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-on-primary bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-adaptive-primary">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  className="form-input"
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-adaptive-primary">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="form-input"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-adaptive-primary">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="form-input"
                  placeholder="Choose a password (min 6 chars)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-adaptive-primary">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                    className="form-input"
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-adaptive-primary">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                    className="form-input"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-on-primary bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}

          <div className="mt-6">
                          <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-adaptive-primary" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-adaptive-secondary text-adaptive-tertiary">For Development</span>
                </div>
              </div>

            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="mt-3 w-full flex justify-center py-2 px-4 border border-adaptive-primary rounded-md shadow-sm text-sm font-medium text-adaptive-primary bg-adaptive-tertiary hover:bg-adaptive-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              Demo Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
