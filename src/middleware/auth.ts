//make sure user is logged in befroe allowing access to certain routes
import { Request, Response, NextFunction } from "express";

//middleware function to check if user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.user) {
    res.redirect("/auth/login");
    return;
  }

  next();
}
