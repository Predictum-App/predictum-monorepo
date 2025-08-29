"use server";

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAddress } from "viem";

import { BackgroundCircles } from "@/app/components/misc/BackgroundCircles";
import { MarketDetailsContent } from "@/app/components/marketDetails";

export default async function Page(props: { params: Promise<{ address: string }> }) {
  const params = await props.params;

  if (!params.address || !isAddress(params.address)) {
    redirect("/");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-sei-gradient"></div>
      <div className="absolute inset-0 bg-sei-radial"></div>
      <div className="absolute inset-0 bg-sei-overlay"></div>

      {/* Dynamic floating circles - only render on client */}
      <BackgroundCircles />

      {/* Main Content */}
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="spinner w-8 h-8 mx-auto mb-4"></div>
              <div className="text-white">Loading market...</div>
            </div>
          </div>
        }
      >
        <MarketDetailsContent address={params.address} />
      </Suspense>
    </div>
  );
}
