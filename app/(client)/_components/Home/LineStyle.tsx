import React from "react";
import lineBg from "@/public/Image/linebg.png";

export default function LineStyle() {
  return (
    <>
      {/* <div className='w-full bg-cover bg-center bg-no-repeat h-10' style={{ backgroundImage: `url(${lineBg.src})` }}>

            </div> */}
      <div
        className="w-full bg-cover bg-center bg-no-repeat min-h-10 -mt-1"
        style={{ backgroundImage: `url(${lineBg.src})` }}
      >
        <div className="container px-5 2xl:px-0 py-16">
          <p className="text-white/90 text-center text-lg">
            Simply MOT helps UK drivers find and book MOT tests online with
            trusted local garages. Compare MOT centres, choose a convenient
            date, and get free MOT reminders. No upfront payment, quick booking,
            and reliable MOT services to keep your car road-legal, safe, and
            compliant across the UK.
          </p>
        </div>
      </div>
    </>
  );
}
