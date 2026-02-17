import * as User from "../models/user.model.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    res.status(200).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    next(error);
  }
};
