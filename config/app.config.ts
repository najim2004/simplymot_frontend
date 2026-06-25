// server base url
export const URL =
  process.env.NEXT_PUBLIC_API_ENDPOINT || "http://127.0.0.1:4000";
// app config
export const AppConfig = () => ({
  app: {
    // server endpoint
    url: URL,
    name: "Simplymot.co.uk",
    slogan: "Simplymot.co.uk",
    meta: {
      title: "Simply MOT – Easy MOT Booking, Free Reminders & Local Garages",
      description:
        "MOT bookings at trusted garages. Enter your reg & postcode, choose a date, book online and get free 	MOT reminders — all in one place.",
      keywords: [
        "MOT booking",
        "Book MOT online",
        "Cheap MOT UK",
        "MOT test centre",
        "Car service and MOT",
        "Vehicle inspection",
        "DVSA approved garage",
        "MOT checklist",
        "MOT reminder service",
        "Same day MOT",
        "Car repair",
        "Vehicle testing station",
        "MOT cost",
        "MOT history check",
        "MOT near me",
        "Local garages",
        "Trusted mechanics",
        "Vehicle maintenance",
        "Car servicing",
        "MOT discounts",
      ],
    },

    // api endpoint
    apiUrl: `${URL}/api`,
  },
});
