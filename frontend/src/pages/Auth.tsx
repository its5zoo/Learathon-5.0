import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Auth.css';

type AuthMode = 'login' | 'signup' | 'forgot';

const Auth: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine initial mode based on URL route
  const getModeFromPath = (): AuthMode => {
    if (location.pathname === '/register' || location.search.includes('mode=signup')) return 'signup';
    if (location.pathname === '/forgot-password' || location.search.includes('mode=forgot')) return 'forgot';
    return 'login';
  };

  const [mode, setMode] = useState<AuthMode>(getModeFromPath());

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form states - Signup
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states - Forgot Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Status/Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMode(getModeFromPath());
    setErrorMessage(null);
  }, [location.pathname, location.search]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
    if (newMode === 'login') navigate('/login');
    else if (newMode === 'signup') navigate('/register');
    else if (newMode === 'forgot') navigate('/forgot-password');
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setToastMessage('Signed in successfully! Redirecting to Dashboard...');
      setTimeout(() => {
        navigate('/');
      }, 1200);
    }, 800);
  };

  // Quick 1-Click Demo Login
  const handleQuickDemoLogin = () => {
    setLoginEmail('demo.user@soulspace.ai');
    setLoginPassword('DemoPassword123!');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setToastMessage('Demo Account Authenticated! Welcome to SoulSpace.');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }, 600);
  };

  // Handle Signup Submit
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Please provide both your First Name and Last Name.');
      return;
    }

    if (!signupEmail.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }

    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      setErrorMessage('Please provide a valid phone number (at least 8 digits).');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your confirm password.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('You must accept the Terms of Service & Privacy Policy to create an account.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setToastMessage(`Account created successfully for ${firstName}! You can now sign in.`);
      setTimeout(() => {
        switchMode('login');
      }, 1500);
    }, 1000);
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotSubmitted(true);
      setToastMessage(`Password recovery link sent to ${forgotEmail}`);
    }, 900);
  };

  return (
    <div className="auth-split-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="auth-toast-success">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="auth-split-wrapper">
        
        {/* ====================================================================
            LEFT SIDE: ARTWORK & MENTAL WELLNESS BRANDING
            ==================================================================== */}
        <div className="auth-side-showcase">
          <div className="auth-showcase-bg-img" style={{ backgroundImage: `url('/auth_side_art.jpg')` }}></div>
          <div className="auth-showcase-overlay"></div>

          <div className="auth-showcase-content">
            {/* Clean, Bold, Short Content (No Boxes, No Icons, Clean Paragraph) */}
            <div className="auth-clean-hero-text">
              <h2 className="auth-bold-headline">
                Empower Your Mind.<br />
                <span className="headline-highlight">Heal Your Life.</span>
              </h2>

              <p className="auth-showcase-paragraph">
                SoulSpace AI is your safe, confidential sanctuary for mental wellness and inner peace. Connect with empathetic AI therapy companions, consult licensed clinical psychologists, and understand your emotional trends in a safe, judgment-free space.
              </p>
            </div>

            {/* Bottom Clean Reassurance */}
            <div className="auth-clean-footer-note">
              <p>Safe, private & always here for you.</p>
            </div>
          </div>
        </div>

        {/* ====================================================================
            RIGHT SIDE: INTERACTIVE FORM WORKSPACE
            ==================================================================== */}
        <div className="auth-side-form">
          <div className="auth-form-container">

            {/* Top Mode Header / Switcher */}
            <div className="auth-form-header">
              {mode === 'login' && (
                <>
                  <h1 className="auth-header-title">Welcome Back</h1>
                  <p className="auth-header-sub">
                    Sign in to access your assessments, AI therapy chats, and mood records.
                  </p>
                </>
              )}

              {mode === 'signup' && (
                <>
                  <h1 className="auth-header-title">Create an Account</h1>
                  <p className="auth-header-sub">
                    Start your confidential journey to mental wellness with SoulSpace today.
                  </p>
                </>
              )}

              {mode === 'forgot' && (
                <>
                  <h1 className="auth-header-title">Reset Password</h1>
                  <p className="auth-header-sub">
                    Enter your registered email address to receive a secure recovery link.
                  </p>
                </>
              )}
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="auth-error-banner">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ef4444" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ================================================================
                FORM: LOGIN (SIGN IN)
                ================================================================ */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="auth-main-form">
                
                {/* Email Field */}
                <div className="form-group-block">
                  <label className="form-label-text">Email Address</label>
                  <div className="input-with-icon-wrapper">
                    <span className="input-field-icon">✉️</span>
                    <input 
                      type="email" 
                      className="auth-input-field" 
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="form-group-block">
                  <div className="label-with-link-row">
                    <label className="form-label-text">Password</label>
                    <button 
                      type="button" 
                      className="forgot-pass-link-btn"
                      onClick={() => switchMode('forgot')}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="input-with-icon-wrapper">
                    <span className="input-field-icon">🔒</span>
                    <input 
                      type={showLoginPassword ? 'text' : 'password'} 
                      className="auth-input-field" 
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle-btn"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      title={showLoginPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showLoginPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="remember-me-row">
                  <label className="checkbox-custom-label">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="checkbox-text">Remember this device for 30 days</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                  {isLoading ? 'Authenticating...' : 'Sign In'}
                </button>

                {/* Divider */}
                <div className="auth-divider-line">
                  <span>or explore with demo</span>
                </div>

                {/* Quick 1-Click Demo Login */}
                <button 
                  type="button" 
                  className="btn-demo-quick-login"
                  onClick={handleQuickDemoLogin}
                  disabled={isLoading}
                >
                  ⚡ Quick 1-Click Demo Login
                </button>

                {/* Toggle to Sign Up */}
                <div className="auth-switch-mode-prompt">
                  <span>Don't have an account yet?</span>
                  <button 
                    type="button" 
                    className="auth-switch-btn"
                    onClick={() => switchMode('signup')}
                  >
                    Sign Up
                  </button>
                </div>

              </form>
            )}

            {/* ================================================================
                FORM: SIGN UP (REGISTRATION)
                ================================================================ */}
            {mode === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="auth-main-form">
                
                {/* First Name & Last Name (2 Column) */}
                <div className="form-two-col-row">
                  <div className="form-group-block">
                    <label className="form-label-text">First Name <span className="req-star">*</span></label>
                    <input 
                      type="text" 
                      className="auth-input-field" 
                      placeholder="e.g. Rahul"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-block">
                    <label className="form-label-text">Last Name <span className="req-star">*</span></label>
                    <input 
                      type="text" 
                      className="auth-input-field" 
                      placeholder="e.g. Sharma"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="form-group-block">
                  <label className="form-label-text">Email Address <span className="req-star">*</span></label>
                  <div className="input-with-icon-wrapper">
                    <span className="input-field-icon">✉️</span>
                    <input 
                      type="email" 
                      className="auth-input-field" 
                      placeholder="rahul.sharma@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Phone Number with Country Code */}
                <div className="form-group-block">
                  <label className="form-label-text">Phone Number <span className="req-star">*</span></label>
                  <div className="phone-input-combined">
                    <select 
                      className="country-code-select"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      <option value="+91">🇮🇳 +91 (India)</option>
                      <option value="+1">🇺🇸 +1 (USA)</option>
                      <option value="+44">🇬🇧 +44 (UK)</option>
                      <option value="+971">🇦🇪 +971 (UAE)</option>
                      <option value="+61">🇦🇺 +61 (Aus)</option>
                      <option value="+65">🇸🇬 +65 (SGP)</option>
                    </select>
                    <input 
                      type="tel" 
                      className="auth-input-field phone-field" 
                      placeholder="98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password & Confirm Password (2 Column) */}
                <div className="form-two-col-row">
                  <div className="form-group-block">
                    <label className="form-label-text">Password <span className="req-star">*</span></label>
                    <div className="input-with-icon-wrapper">
                      <input 
                        type={showSignupPassword ? 'text' : 'password'} 
                        className="auth-input-field" 
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                      >
                        {showSignupPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div className="form-group-block">
                    <label className="form-label-text">Confirm Password <span className="req-star">*</span></label>
                    <div className="input-with-icon-wrapper">
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        className="auth-input-field" 
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="terms-checkbox-row">
                  <label className="checkbox-custom-label">
                    <input 
                      type="checkbox" 
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      required
                    />
                    <span className="checkbox-text">
                      I agree to the <a href="#terms" className="auth-inline-link">Terms of Service</a>, <a href="#privacy" className="auth-inline-link">Privacy Policy</a> and clinical data handling.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                {/* Toggle to Sign In */}
                <div className="auth-switch-mode-prompt">
                  <span>Already have an account?</span>
                  <button 
                    type="button" 
                    className="auth-switch-btn"
                    onClick={() => switchMode('login')}
                  >
                    Sign In
                  </button>
                </div>

              </form>
            )}

            {/* ================================================================
                FORM: FORGOT PASSWORD
                ================================================================ */}
            {mode === 'forgot' && (
              <div className="auth-forgot-wrapper">
                {forgotSubmitted ? (
                  <div className="forgot-success-card">
                    <div className="forgot-success-icon">📬</div>
                    <h3 className="forgot-success-title">Recovery Link Dispatched</h3>
                    <p className="forgot-success-text">
                      We have sent password reset instructions to <strong>{forgotEmail}</strong>. Please check your inbox and spam folder.
                    </p>
                    <button 
                      type="button" 
                      className="btn-auth-submit"
                      onClick={() => {
                        setForgotSubmitted(false);
                        switchMode('login');
                      }}
                    >
                      Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="auth-main-form">
                    <div className="form-group-block">
                      <label className="form-label-text">Registered Email Address</label>
                      <div className="input-with-icon-wrapper">
                        <span className="input-field-icon">✉️</span>
                        <input 
                          type="email" 
                          className="auth-input-field" 
                          placeholder="name@example.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                      {isLoading ? 'Sending Link...' : 'Send Recovery Link'}
                    </button>

                    <div className="auth-switch-mode-prompt">
                      <span>Remembered your password?</span>
                      <button 
                        type="button" 
                        className="auth-switch-btn"
                        onClick={() => switchMode('login')}
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;
