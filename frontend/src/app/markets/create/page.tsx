import { FC } from "react";
import { CreateMarketForm } from "@/app/components/forms/CreateMarketForm";
import { BackgroundCircles } from "@/app/components/misc/BackgroundCircles";

const Page: FC = async (props: { searchParams?: Promise<{ question?: string }> }) => {
  const searchParams = await props.searchParams;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-sei-gradient"></div>
      <div className="absolute inset-0 bg-sei-radial"></div>
      <div className="absolute inset-0 bg-sei-overlay"></div>

      {/* Dynamic floating circles - only render on client */}
      <BackgroundCircles />

      {/* Main Content */}
      <div className="relative max-w-4xl mx-auto px-8">
        {/* Page Title Section */}
        <div className="text-center pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Create Market
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
              Start a new prediction market and let the community trade on outcomes
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-2xl mx-auto pb-12">
          <div className="bg-gray-900/90 backdrop-blur-sm glow-border rounded-2xl p-8 shadow-2xl">
            <CreateMarketForm question={searchParams?.question} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
