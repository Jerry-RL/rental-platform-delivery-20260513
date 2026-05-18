import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { fail, ok } from "./common/response.js";
import { financeRouter } from "./modules/finance/router.js";
import { orderRouter } from "./modules/order/router.js";
import { paymentRouter, refundRouter } from "./modules/payment/router.js";
import { userRouter } from "./modules/user/router.js";
import { vehicleRouter } from "./modules/vehicle/router.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  ok(req, res, { status: "ok" });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/vehicles", vehicleRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/refunds", refundRouter);
app.use("/api/v1", financeRouter);

app.use((req, res) => {
  fail(req, res, `Route not found: ${req.method} ${req.path}`, 404);
});
