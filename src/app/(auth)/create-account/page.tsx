import Footer from "@/features/client/components/Shared/Footer";
import Navbar from "@/features/client/components/Shared/Navbar";
import DriverIcon from "@/components/Icons/Login/Driver";
import GarageIcon from "@/components/Icons/Login/Grage";
import bgImg from "@/public/Image/home/bannerImage.png";
import Link from "next/link";

export default function CreateAccountPage() {
  const data = [
    {
      id: 1,
      icon: <DriverIcon />,
      title: "Customer Sign Up",
      href: "/create-account/driver",
    },
    {
      id: 2,
      icon: <GarageIcon />,
      title: "Garage Sign Up",
      href: "/create-account/pricing",
    },
  ];
  return (
    <>
      <Navbar />
      <div
        style={{ backgroundImage: `url(${bgImg.src})` }}
        className="w-full min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center pt-24 pb-10"
      >
        <div className="container px-5 2xl:px-0">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-medium font-inder text-center mb-8 md:mb-12">
            Create a <span className="font-semibold">simplymot.co.uk</span>{" "}
            Account
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 pt-10 max-w-4xl mx-auto">
            {data.map((item) => (
              <Link
                key={item.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-150 ease-out touch-manipulation select-none cursor-pointer hover:scale-105 active:scale-[0.97] active:duration-75 active:shadow-inner p-8 md:p-10 flex flex-col items-center justify-center w-full h-full min-h-[200px]"
                href={item.href}
              >
                <div className="mb-4 md:mb-6 flex items-center justify-center">
                  {item.icon}
                </div>
                <h2 className="text-gray-800 text-lg md:text-xl lg:text-2xl font-semibold text-center">
                  {item.title}
                </h2>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
