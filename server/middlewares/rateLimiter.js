import rateLimit from 'express-rate-limit';

// Limit intensive AI API calls (OpenAI/Deployments) to prevent credit exhaustion
export const aiEndpointLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 AI requests per windowMs
  message: { 
    success: false, 
    message: "Security Flag: Too many AI requests from this IP. Please try again after an hour to protect system credits." 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// A slightly more lenient limiter for general API routes like profile updates
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { 
    success: false, 
    message: "Too many requests, please try again later." 
  },
  standardHeaders: true,
  legacyHeaders: false,
});
