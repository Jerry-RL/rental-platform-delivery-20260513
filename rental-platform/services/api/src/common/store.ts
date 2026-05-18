import { randomUUID } from "node:crypto";
import type {
  Bill,
  BillPayment,
  Driver,
  EnterpriseAccount,
  Invoice,
  Order,
  Payment,
  Personnel,
  User,
  Vehicle
} from "./types.js";
import { normalizeDriver } from "./driver-utils.js";
import { normalizeVehicle } from "./vehicle-utils.js";

export const users = new Map<string, User>();
export const usersByPhone = new Map<string, string>();
export const enterpriseAccounts = new Map<string, EnterpriseAccount>();
export const drivers = new Map<string, Driver>();
export const personnel = new Map<string, Personnel>();
export const vehicles = new Map<string, Vehicle>();
export const orders = new Map<string, Order>();
export const payments = new Map<string, Payment>();
export const processedCallbacks = new Set<string>();
export const invoices = new Map<string, Invoice>();
export const bills = new Map<string, Bill>();
export const billPayments = new Map<string, BillPayment>();
export const financeTickets: Array<{ id: string; billId: string; reason: string; createdAt: string }> = [];

const now = "2025-05-01T00:00:00.000Z";
const in20Days = "2025-06-08";
const in45Days = "2025-06-23";
const expired = "2025-04-01";

const seedVehicles: Vehicle[] = [
  normalizeVehicle({
    id: randomUUID(),
    plateNumber: "沪A12345",
    vehicleTypeId: "SUV",
    city: "Shanghai",
    dailyPrice: 399,
    status: "AVAILABLE",
    brand: "丰田",
    model: "RAV4",
    vin: "LVHRM1828N5001234",
    mileage: 28000,
    imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce5357ab85?w=400&h=260&fit=crop",
    images: [],
    insuranceExpiryDate: in45Days,
    annualReviewExpiryDate: in45Days,
    remindBeforeDays: 30,
    createdAt: now,
    updatedAt: now
  }),
  normalizeVehicle({
    id: randomUUID(),
    plateNumber: "沪B98765",
    vehicleTypeId: "SEDAN",
    city: "Shanghai",
    dailyPrice: 299,
    status: "AVAILABLE",
    brand: "大众",
    model: "帕萨特",
    vin: "LVSHCAMB8NN045678",
    mileage: 15000,
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=260&fit=crop",
    images: [],
    insuranceExpiryDate: in20Days,
    annualReviewExpiryDate: in45Days,
    remindBeforeDays: 30,
    createdAt: now,
    updatedAt: now
  }),
  normalizeVehicle({
    id: randomUUID(),
    plateNumber: "京C66889",
    vehicleTypeId: "SUV",
    city: "Beijing",
    dailyPrice: 429,
    status: "AVAILABLE",
    brand: "本田",
    model: "CR-V",
    vin: "LVHGD1865N8009012",
    mileage: 42000,
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=260&fit=crop",
    images: [],
    insuranceExpiryDate: expired,
    annualReviewExpiryDate: in45Days,
    remindBeforeDays: 30,
    createdAt: now,
    updatedAt: now
  }),
  normalizeVehicle({
    id: randomUUID(),
    plateNumber: "沪D11223",
    vehicleTypeId: "MPV",
    city: "Shanghai",
    dailyPrice: 499,
    status: "MAINTENANCE",
    brand: "别克",
    model: "GL8",
    vin: "LVSHCAAJ8NN011223",
    mileage: 56000,
    imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=260&fit=crop",
    images: [],
    insuranceExpiryDate: in45Days,
    annualReviewExpiryDate: in20Days,
    remindBeforeDays: 30,
    createdAt: now,
    updatedAt: now
  }),
  normalizeVehicle({
    id: randomUUID(),
    plateNumber: "京E44556",
    vehicleTypeId: "SEDAN",
    city: "Beijing",
    dailyPrice: 319,
    status: "IN_USE",
    brand: "日产",
    model: "天籁",
    vin: "LVSHFFAN8NN044556",
    mileage: 33000,
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=260&fit=crop",
    images: [],
    insuranceExpiryDate: in45Days,
    annualReviewExpiryDate: in45Days,
    remindBeforeDays: 30,
    createdAt: now,
    updatedAt: now
  })
];

for (const vehicle of seedVehicles) {
  vehicles.set(vehicle.id, vehicle);
}

const licenseImg =
  "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=260&fit=crop";

const seedDrivers: Driver[] = [
  normalizeDriver({
    id: "driver-sh-001",
    driverNo: "D-SH-001",
    name: "张师傅",
    phone: "13900001001",
    licenseNo: "310101199001011234",
    licenseType: "C1",
    city: "Shanghai",
    status: "AVAILABLE",
    rating: 4.9,
    joinedAt: "2024-03-15T00:00:00.000Z",
    licenseImageUrl: licenseImg,
    licenseImages: [licenseImg],
    licenseExpiryDate: in45Days,
    remindBeforeDays: 30,
    updatedAt: now
  }),
  normalizeDriver({
    id: "driver-sh-002",
    driverNo: "D-SH-002",
    name: "李师傅",
    phone: "13900001002",
    licenseNo: "310101199102021234",
    licenseType: "C1",
    city: "Shanghai",
    status: "ON_DUTY",
    rating: 4.7,
    joinedAt: "2024-06-20T00:00:00.000Z",
    licenseImageUrl: licenseImg,
    licenseImages: [licenseImg],
    licenseExpiryDate: in20Days,
    remindBeforeDays: 30,
    updatedAt: now
  }),
  normalizeDriver({
    id: "driver-bj-001",
    driverNo: "D-BJ-001",
    name: "王师傅",
    phone: "13900002001",
    licenseNo: "110101198803031234",
    licenseType: "C1",
    city: "Beijing",
    status: "AVAILABLE",
    rating: 4.8,
    joinedAt: "2023-11-08T00:00:00.000Z",
    licenseImageUrl: licenseImg,
    licenseImages: [licenseImg],
    licenseExpiryDate: expired,
    remindBeforeDays: 30,
    updatedAt: now
  }),
  normalizeDriver({
    id: "driver-sh-003",
    driverNo: "D-SH-003",
    name: "赵师傅",
    phone: "13900001003",
    licenseNo: "310101199505051234",
    licenseType: "B1",
    city: "Shanghai",
    status: "OFF_DUTY",
    rating: 4.5,
    joinedAt: "2025-01-10T00:00:00.000Z",
    licenseImageUrl: licenseImg,
    licenseImages: [licenseImg],
    licenseExpiryDate: in45Days,
    remindBeforeDays: 30,
    updatedAt: now
  })
];

const seedPersonnel: Personnel[] = [
  {
    id: "staff-001",
    employeeNo: "EMP-001",
    name: "陈运营",
    phone: "13700001001",
    email: "ops@rental.com",
    role: "OPERATOR",
    department: "运营部",
    status: "ACTIVE",
    hiredAt: "2023-05-01T00:00:00.000Z"
  },
  {
    id: "staff-002",
    employeeNo: "EMP-002",
    name: "刘财务",
    phone: "13700001002",
    email: "finance@rental.com",
    role: "FINANCE",
    department: "财务部",
    status: "ACTIVE",
    hiredAt: "2023-05-15T00:00:00.000Z"
  },
  {
    id: "staff-003",
    employeeNo: "EMP-003",
    name: "周客服",
    phone: "13700001003",
    email: "cs@rental.com",
    role: "CUSTOMER_SERVICE",
    department: "客服部",
    status: "ACTIVE",
    hiredAt: "2024-02-01T00:00:00.000Z"
  },
  {
    id: "staff-004",
    employeeNo: "EMP-004",
    name: "吴管理",
    phone: "13700001004",
    email: "admin@rental.com",
    role: "ADMIN",
    department: "管理层",
    status: "ACTIVE",
    hiredAt: "2022-12-01T00:00:00.000Z"
  },
  {
    id: "staff-005",
    employeeNo: "EMP-005",
    name: "郑实习",
    phone: "13700001005",
    role: "OPERATOR",
    department: "运营部",
    status: "INACTIVE",
    hiredAt: "2025-04-01T00:00:00.000Z"
  }
];

const seedUsers: User[] = [
  {
    id: "user-demo-001",
    phone: "13800000000",
    password: "123456",
    realName: "演示用户",
    licenseValid: true,
    status: "ACTIVE",
    registeredAt: "2024-01-10T00:00:00.000Z"
  },
  {
    id: randomUUID(),
    phone: "13800001111",
    password: "123456",
    realName: "张三",
    licenseValid: true,
    status: "ACTIVE",
    registeredAt: "2024-08-15T00:00:00.000Z"
  },
  {
    id: randomUUID(),
    phone: "13800002222",
    password: "123456",
    realName: "李四",
    licenseValid: false,
    status: "ACTIVE",
    registeredAt: "2025-02-20T00:00:00.000Z"
  },
  {
    id: randomUUID(),
    phone: "13800003333",
    password: "123456",
    realName: "王五",
    licenseValid: true,
    status: "SUSPENDED",
    registeredAt: "2025-03-01T00:00:00.000Z"
  }
];

const seedEnterpriseAccounts: EnterpriseAccount[] = [
  {
    id: "org-bg-001",
    accountNo: "ORG-BG-001",
    orgName: "上海博观汽车服务有限公司",
    accountType: "B",
    contactName: "赵经理",
    contactPhone: "13600001001",
    creditLimit: 500000,
    status: "ACTIVE",
    createdAt: "2023-06-01T00:00:00.000Z"
  },
  {
    id: "org-g-001",
    accountNo: "ORG-G-001",
    orgName: "北京市政公务用车中心",
    accountType: "G",
    contactName: "钱主任",
    contactPhone: "13600002001",
    creditLimit: 2000000,
    status: "ACTIVE",
    createdAt: "2022-11-20T00:00:00.000Z"
  },
  {
    id: "org-b-002",
    accountNo: "ORG-B-002",
    orgName: "深圳速达物流有限公司",
    accountType: "B",
    contactName: "孙主管",
    contactPhone: "13600003002",
    creditLimit: 300000,
    status: "ACTIVE",
    createdAt: "2024-04-12T00:00:00.000Z"
  },
  {
    id: "org-g-002",
    accountNo: "ORG-G-002",
    orgName: "广州高新区管委会",
    accountType: "G",
    contactName: "周科长",
    contactPhone: "13600004003",
    creditLimit: 800000,
    status: "SUSPENDED",
    createdAt: "2024-09-01T00:00:00.000Z"
  }
];

for (const driver of seedDrivers) {
  drivers.set(driver.id, driver);
}

for (const member of seedPersonnel) {
  personnel.set(member.id, member);
}

for (const user of seedUsers) {
  users.set(user.id, user);
  usersByPhone.set(user.phone, user.id);
}

for (const account of seedEnterpriseAccounts) {
  enterpriseAccounts.set(account.id, account);
}
