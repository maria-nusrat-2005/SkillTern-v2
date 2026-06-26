const express = require('express');
const router = express.Router();
const yup = require('yup');
const {
  register,
  login,
  logout,
  getMe,
  refresh,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// Validation Schemas
const registerSchema = yup.object({
  name: yup.string().required('Name is required').min(2).max(50),
  email: yup.string().required('Email is required').email('Invalid email format'),
  password: yup.string().required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain an uppercase letter')
    .matches(/[0-9]/, 'Password must contain a number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain a special character'),
  role: yup.string().required('Role is required').oneOf(['student', 'recruiter'], 'Invalid role selection'),
});

const loginSchema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email format'),
  password: yup.string().required('Password is required'),
});

const forgotPasswordSchema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email format'),
});

const resetPasswordSchema = yup.object({
  token: yup.string().required('Token is required'),
  password: yup.string().required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain an uppercase letter')
    .matches(/[0-9]/, 'Password must contain a number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain a special character'),
});

// Routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/refresh', refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

module.exports = router;
