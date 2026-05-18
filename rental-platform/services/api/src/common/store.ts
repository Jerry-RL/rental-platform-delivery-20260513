import { randomUUID } from "node:crypto";
import type { Bill, BillPayment, Invoice, Order, Payment, User, Vehicle } from "./types.js";

export const users = new Map<string, User>();
export const usersByPhone = new Map<string, string>();
export const vehicles = new Map<string, Vehicle>();
export const orders = new Map<string, Order>();
export const payments = new Map<string, Payment>();
export const processedCallbacks = new Set<string>();
export const invoices = new Map<string, Invoice>();
export const bills = new Map<string, Bill>();
export const billPayments = new Map<string, BillPayment>();
export const financeTickets: Array<{ id: string; billId: string; reason: string; createdAt: string }> = [];

const seedVehicles: Vehicle[] = [
  {
    id: randomUUID(),
    plateNumber: "沪A12345",
    vehicleTypeId: "SUV",
    city: "Shanghai",
    dailyPrice: 399,
    status: "AVAILABLE"
  },
  {
    id: randomUUID(),
    plateNumber: "沪B98765",
    vehicleTypeId: "SEDAN",
    city: "Shanghai",
    dailyPrice: 299,
    status: "AVAILABLE"
  },
  {
    id: randomUUID(),
    plateNumber: "京C66889",
    vehicleTypeId: "SUV",
    city: "Beijing",
    dailyPrice: 429,
    status: "AVAILABLE"
  }
];

for (const vehicle of seedVehicles) {
  vehicles.set(vehicle.id, vehicle);
}
