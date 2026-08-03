import rateLimit from 'express-rate-limit'

// Applied to login/adminlogin: slows down credential-guessing attempts
// without locking out users who just mistype a password a couple of times.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
})

// OTP endpoints are tighter: each request can trigger an email send,
// and OTP codes are short enough to be brute-forceable if unthrottled.
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many OTP requests. Please try again in 15 minutes.' },
})
