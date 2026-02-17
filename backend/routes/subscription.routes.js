import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  createSubscription,
  getMySubscriptions,
  getReminders,
  getSubscription,
  updateSubscription,
  deleteSubscription,
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

// All routes require auth except we could have public docs. All below use authorize.
subscriptionRouter.get("/", authorize, getMySubscriptions);
subscriptionRouter.get("/reminders", authorize, getReminders);
subscriptionRouter.post("/", authorize, createSubscription);
subscriptionRouter.get("/:id", authorize, getSubscription);
subscriptionRouter.put("/:id", authorize, updateSubscription);
subscriptionRouter.delete("/:id", authorize, deleteSubscription);

export default subscriptionRouter;
