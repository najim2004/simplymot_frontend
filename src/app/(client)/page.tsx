import HomeBanner from "@/features/client/components/Home/Banner";
import CustomersSay from "@/features/client/components/Home/CustomersSay";
import Frequently from "@/features/client/components/Home/Frequently";
import HowToBook from "@/features/client/components/Home/HowToBook";
import LineStyle from "@/features/client/components/Home/LineStyle";
import ReadytoBook from "@/features/client/components/Home/ReadytoBook ";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <HomeBanner />
      <HowToBook />
      <ReadytoBook />
      <CustomersSay />
      <LineStyle />
      <Frequently />
    </div>
  );
}
