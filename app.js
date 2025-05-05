import express from "express";
import cookieParser from "cookie-parser";
import { PORT } from "./config/env.js";
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import authRouter from "./routes/auth.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";

const app = express();

//express's default middleware
app.use(express.json()); //allows to parse json data from request body
app.use(express.urlencoded({ extended: false })); //allows to parse url-encoded data from html
app.use(cookieParser()); //store user data in cookies
app.use(arcjetMiddleware);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Welcome to the Subscription Service API");
});

app.listen(PORT, async () => {
  console.log(`The API is running on http://localhost:${PORT}`);
  await connectToDatabase();
});

export default app;
