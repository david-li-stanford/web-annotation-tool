import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  isAuthenticated?: boolean;
}

// Simple development auth - accepts any credentials
export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  // For development: accept any non-empty credentials
  if (username && password) {
    res.json({ 
      success: true, 
      message: 'Login successful',
      token: 'dev-token-' + Date.now() 
    });
  } else {
    res.status(400).json({ 
      success: false, 
      message: 'Username and password required' 
    });
  }
};

// Simple middleware to check if user is authenticated
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  // For development: accept any token that starts with 'dev-token-'
  if (authHeader && authHeader.startsWith('Bearer dev-token-')) {
    req.isAuthenticated = true;
    next();
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
};