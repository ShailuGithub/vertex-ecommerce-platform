"use client";

import Button from "@/components/ui/Button";

interface CustomerRow {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  city: string | null;
  orderCount: number;
  lifetimeSpend: number;
  createdAt: string;
}

function toCsvValue(value: string | number) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export default function ExportCustomersButton({ customers }: { customers: CustomerRow[] }) {
  function handleExport() {
    const header = ["Name", "Email", "Phone", "City", "Total Orders", "Total Sales", "Joined"];
    const rows = customers.map((c) => [
      `${c.firstName} ${c.lastName}`,
      c.email,
      c.phone ?? "",
      c.city ?? "",
      c.orderCount,
      c.lifetimeSpend,
      new Date(c.createdAt).toLocaleDateString(),
    ]);
    const csv = [header, ...rows].map((row) => row.map(toCsvValue).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="secondary" onClick={handleExport}>
      Export
    </Button>
  );
}
