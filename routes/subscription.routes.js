import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  createSubscription,
  getUserSubscriptions,
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/", (req, res) => {
  res.send({
    title: "Get all subscriptions",
  });
});

subscriptionRouter.get("/:id", (req, res) => {
  res.send({
    title: "Get details",
  });
});

subscriptionRouter.post("/", authorize, createSubscription);
//the authorize function which is in auth.middleware.js  will be called
//basically if they are not logged in they wont be able to create a subscription

subscriptionRouter.put("/:id", (req, res) => {
  res.send({
    title: "Update a subscriptions",
  });
});

subscriptionRouter.delete("/:id", (req, res) => {
  res.send({
    title: "Delete a subscriptions",
  });
});

subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);

subscriptionRouter.put("/:id/cancel", (req, res) => {
  res.send({
    title: "Cancel subscriptions",
  });
});

subscriptionRouter.get("/upcoming-renewals", (req, res) => {
  res.send({
    title: "Get upcoming renewals",
  });
});

export default subscriptionRouter;
