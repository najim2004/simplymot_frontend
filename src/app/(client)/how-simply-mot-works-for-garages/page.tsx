import React from "react";
import HeroSectionReused from "@/features/client/components/Shared/HeroSectionReused";

const howItWorksData = {
  disclaimer:
    "Simply MOT is an online booking platform that connects drivers with local garages for MOT tests. Our goal is simple: help garages receive additional MOT bookings while making it easy for drivers to find and book a trusted local garage.",
  sections: [
    {
      id: 1,
      title: "How The Platform Works",
      content: [
        "1. Create a Garage Account - Sign up to create your Simply MOT account and access the garage dashboard, where you can begin setting up your garage profile.",
        "2. Activate Your Subscription - Once activated, your garage becomes visible to drivers. You can then set your MOT price, retest price, availability, and add any additional services your garage offers.",
        "3. Drivers Book Your Available Slots - Drivers select an available time slot and confirm their booking.",
        "4. Booking Confirmation - Both the garage and driver receive confirmation emails with the appointment details. Bookings will also appear in your garage dashboard, where you can view and manage your upcoming appointments.",
        "5. Driver Attends Appointment - The driver attends the appointment and pays the garage directly.",
        "",
        "Booking Cancellations - Occasionally drivers may cancel or reschedule bookings, which is normal within the trade. Simply MOT does not charge cancellation fees and aims to keep the system fair and straightforward for both garages and drivers.",
      ],
    },
    {
      id: 2,
      title: "Subscription Pricing",
      content: [
        "Simply MOT operates on a flat monthly subscription fee. There are no commissions, no per-booking charges, and no limits on how many bookings you can receive.",
        "Our goal is to keep Simply MOT simple, affordable, and accessible for independent garages. By operating as an online-based service without sales representatives or call centres, we keep costs low and maintain a low monthly subscription fee.",
      ],
    },
    {
      id: 3,
      title: "Subscription Cancellation",
      content: [
        "Garages can cancel their subscription at any time from the garage dashboard under 'Subscription'. Your listing remains active until the end of the current billing period, after which no further charges are made. You can reactivate your subscription at any time.",
      ],
    },
    {
      id: 4,
      title: "Contact & Support",
      content: [
        "Simply MOT is an online-based platform, so all communication and support is handled via email. By operating without a traditional call centre, we keep operating costs low and pass those savings directly on to garages through our low monthly subscription.",
        "Our support hours are Monday to Friday, from 9:00am to 5:00pm.",
        "For assistance, please submit a request through our contact form, which can be found in the contact us section on the homepage or within your garage dashboard.",
        "Alternatively, you can email us at: info@simplymot.co.uk",
      ],
    },
  ],
};

export default function HowSimplyMotWorksForGarages() {
  return (
    <div>
      <HeroSectionReused title="How Simply MOT Works for Garages" />

      {/* content section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              What We Do
            </h2>
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              {howItWorksData.disclaimer}
            </p>
          </div>

          {howItWorksData.sections.map((section) => (
            <div key={section.id} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.content.map((paragraph, index) => {
                  if (paragraph === "") return <br key={index} />;
                  
                  if (paragraph.includes(" - ")) {
                    const parts = paragraph.split(" - ");
                    return (
                      <p key={index} className="text-gray-700 leading-relaxed">
                        <span className="font-semibold">{parts[0]}</span> - {parts.slice(1).join(" - ")}
                      </p>
                    );
                  }

                  return (
                    <p key={index} className="text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
