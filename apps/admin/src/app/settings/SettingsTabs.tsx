"use client";

import { useState } from "react";
import ProfileSettingsForm from "./ProfileSettingsForm";
import DomainSettingsForm from "./DomainSettingsForm";
import PoliciesSettingsForm from "./PoliciesSettingsForm";
import RazorpaySettingsForm from "./RazorpaySettingsForm";
import DeliverySettingsForm from "./DeliverySettingsForm";
import StoreTimingsForm from "./StoreTimingsForm";
import TaxSettingsForm from "./TaxSettingsForm";
import ReturnsSettingsForm from "./ReturnsSettingsForm";
import ExtraChargesForm from "./ExtraChargesForm";
import SupportSocialSettingsForm from "./SupportSocialSettingsForm";
import SeoSettingsForm from "./SeoSettingsForm";
import NotificationsSettingsForm from "./NotificationsSettingsForm";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "domain", label: "Domain" },
  { id: "delivery", label: "Delivery" },
  { id: "timings", label: "Store timings" },
  { id: "tax", label: "Tax" },
  { id: "returns", label: "Returns" },
  { id: "extra-charges", label: "Extra charges" },
  { id: "support-social", label: "Support & Social" },
  { id: "seo", label: "SEO" },
  { id: "notifications", label: "Notifications" },
  { id: "policies", label: "Policies" },
  { id: "payments", label: "Payments" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsTabs() {
  const [active, setActive] = useState<TabId>("profile");

  return (
    <div className="max-w-xl">
      <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              active === tab.id
                ? "border-b-2 border-brand-600 text-brand-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "profile" && <ProfileSettingsForm />}
      {active === "domain" && <DomainSettingsForm />}
      {active === "delivery" && <DeliverySettingsForm />}
      {active === "timings" && <StoreTimingsForm />}
      {active === "tax" && <TaxSettingsForm />}
      {active === "returns" && <ReturnsSettingsForm />}
      {active === "extra-charges" && <ExtraChargesForm />}
      {active === "support-social" && <SupportSocialSettingsForm />}
      {active === "seo" && <SeoSettingsForm />}
      {active === "notifications" && <NotificationsSettingsForm />}
      {active === "policies" && <PoliciesSettingsForm />}
      {active === "payments" && <RazorpaySettingsForm />}
    </div>
  );
}
