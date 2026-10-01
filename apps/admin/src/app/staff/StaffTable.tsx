"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface StaffMember {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "STORE_OWNER" | "STORE_STAFF";
  isActive: boolean;
  createdAt: string;
}

export default function StaffTable({
  staff,
  currentUserId,
}: {
  staff: StaffMember[];
  currentUserId: number;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function toggleActive(member: StaffMember) {
    setLoadingId(member.id);
    try {
      const action = member.isActive ? "deactivate" : "reactivate";
      await apiFetch(`/store/staff/${member.id}/${action}`, { method: "PATCH" });
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-5 py-3">Name</th>
            <th className="px-5 py-3">Email</th>
            <th className="px-5 py-3">Role</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => (
            <tr key={member.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <td className="px-5 py-3 font-medium text-slate-900">
                {member.firstName} {member.lastName}
              </td>
              <td className="px-5 py-3 text-slate-600">{member.email}</td>
              <td className="px-5 py-3 text-slate-600">{member.role.replace(/_/g, " ")}</td>
              <td className="px-5 py-3">
                <Badge tone={member.isActive ? "green" : "slate"}>
                  {member.isActive ? "Active" : "Deactivated"}
                </Badge>
              </td>
              <td className="px-5 py-3 text-right">
                {member.role === "STORE_STAFF" && member.id !== currentUserId && (
                  <Button
                    variant="ghost"
                    onClick={() => toggleActive(member)}
                    disabled={loadingId === member.id}
                  >
                    {member.isActive ? "Deactivate" : "Reactivate"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
