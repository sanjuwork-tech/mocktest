import { DashboardClient } from "./dashboard-client";
import { products } from "@/data/catalog";
import { databaseConfigured } from "@/db/client";

export default function AdminDashboardPage() { return <DashboardClient products={products} databaseReady={databaseConfigured} />; }
