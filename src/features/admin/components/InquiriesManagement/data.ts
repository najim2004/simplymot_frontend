import type { ContactInquiry } from "./types";

export const INITIAL_INQUIRIES: ContactInquiry[] = [
  {
    id: "MSG-101",
    name: "Zahir Ahmed",
    email: "zahir.ahmed@gmail.com",
    phone: "+44 7700 900112",
    subject: "MOT Booking Confirmation for Reg: AB12 CDE",
    message:
      "Hello, I booked an MOT for my Vauxhall Corsa (AB12 CDE) at AutoCare Leeds next Tuesday. Could you please confirm the slot time and let me know what documents I need to bring on the day?",
    date: "10 mins ago",
    status: "Unread",
  },
  {
    id: "MSG-102",
    name: "Sarah Parker",
    email: "sparker@innovatech.io",
    subject: "Corporate Fleet MOT & Service Packages",
    message:
      "We manage a fleet of 40 vans for our logistics operation. Do you offer corporate fleet MOT and servicing packages with scheduled maintenance windows and consolidated invoicing?",
    date: "1 hour ago",
    status: "Unread",
  },
  {
    id: "MSG-103",
    name: "Tanvir Hasan",
    email: "tanvir.hasan@yahoo.com",
    phone: "+44 7700 900223",
    subject: "Brake Inspection Appointment",
    message:
      "My Ford Transit is due a brake inspection and MOT in the next two weeks. Can you book both at the same garage and provide an estimate for the brake work before we confirm?",
    date: "Yesterday",
    status: "In Progress",
    replySent:
      "Hi Tanvir, your combined brake inspection and MOT has been booked at MOT Centre Manchester for next Thursday at 10:00. We'll email the brake estimate within 24 hours.",
    repliedAt: "Yesterday at 4:30 PM",
  },
  {
    id: "MSG-104",
    name: "Emily Watson",
    email: "emily.watson@gmail.com",
    subject: "MOT Reminder for Vehicle Reg: KL34 MNH",
    message:
      "I received an MOT reminder for my Toyota Yaris (KL34 MNH) but I think the date is wrong — I actually had the MOT done last month. Can you check and update the reminder record?",
    date: "Sep 09, 2026",
    status: "Resolved",
    replySent:
      "Hi Emily, thank you for flagging that. We've verified your recent MOT certificate and corrected the reminder record — you'll now receive the next reminder 30 days before the actual due date.",
    repliedAt: "Sep 09, 2026",
  },
  {
    id: "MSG-105",
    name: "Rafiqul Islam",
    email: "rafiq.islam@hotmail.com",
    phone: "+44 7700 900334",
    subject: "Rescheduling MOT Due to Holiday",
    message:
      "I have a booking at garage #G-112 for my Honda Civic but I'll be away on holiday that week. Can I move it to the following week without a rescheduling fee?",
    date: "Sep 08, 2026",
    status: "Resolved",
    replySent:
      "Yes Rafiqul! We've moved your MOT to the same slot one week later at no extra charge. You'll get a confirmation email shortly.",
    repliedAt: "Sep 08, 2026",
  },
  {
    id: "MSG-106",
    name: "Global Deals Marketing",
    email: "promo@seo-backlinks-fast.biz",
    subject: "Boost Your Garage Listings 10x",
    message:
      "We can provide 5,000 contextual backlinks to your SimplyMot garage listings to improve search rankings. Interested?",
    date: "Sep 05, 2026",
    status: "Spam",
  },
];