import * as Subscription from "../models/subscription.model.js";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json({ success: true, data: subscription });
  } catch (e) {
    next(e);
  }
};

export const getMySubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.findByUserId(req.user._id);
    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};

export const getReminders = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.findReminders(req.user._id);
    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};

export const getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }
    if (subscription.user !== req.user._id) {
      const error = new Error("You are not the owner");
      error.statusCode = 403;
      throw error;
    }
    res.status(200).json({ success: true, data: subscription });
  } catch (e) {
    next(e);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }
    if (subscription.user !== req.user._id) {
      const error = new Error("You are not the owner");
      error.statusCode = 403;
      throw error;
    }
    const updated = await Subscription.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }
    if (subscription.user !== req.user._id) {
      const error = new Error("You are not the owner");
      error.statusCode = 403;
      throw error;
    }
    await Subscription.remove(req.params.id);
    res.status(200).json({ success: true, message: "Subscription deleted" });
  } catch (e) {
    next(e);
  }
};
