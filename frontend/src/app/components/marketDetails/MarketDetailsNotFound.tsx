import { FC } from "react";
import Link from "next/link";

type Props = {
  address: string;
};

export const MarketDetailsNotFound: FC<Props> = ({ address }) => {
  return (
    <div className="relative min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md mx-4">
        <div className="text-center">
          <div className="text-white text-xl font-semibold mb-2">Market not found</div>
          <div className="text-gray-400 mb-6">The requested market could not be loaded.</div>
          <div className="text-sm text-gray-500 mb-4">
            <div>Market Address: {address}</div>
            <div>This might be because:</div>
            <ul className="text-left mt-2 space-y-1">
              <li>• No markets have been created yet</li>
              <li>• The market address is invalid</li>
              <li>• There&apos;s a connection issue</li>
            </ul>
          </div>
          <Link
            href={"/markets"}
            className="px-6 py-2 bg-sei-400 text-dark-950 rounded-lg font-medium hover:bg-sei-300 transition-colors"
          >
            Go to Markets
          </Link>
        </div>
      </div>
    </div>
  );
};
