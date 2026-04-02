import { Router } from "express";

const router = Router();
//home route
router.get("/", (_request, response) => {
  response.redirect("/auth/login");
});

export default router;
