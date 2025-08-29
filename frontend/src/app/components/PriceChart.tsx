"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { MarketHourlyData } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
interface PriceChartProps {
  marketAddress: string;
  outcomes: string[];
  timeframe: string;
  onPricesUpdate?: (prices: number[]) => void;
}

const PriceChart: React.FC<PriceChartProps> = ({ marketAddress, outcomes, timeframe }) => {
  const { data, isLoading, error } = useQuery<MarketHourlyData[]>({
    queryKey: ["chart-data", marketAddress, timeframe],
    queryFn: async () => {
      const result = await axios.get<MarketHourlyData[]>(
        `/api/get-chart-data?address=${marketAddress}&hours=${getHoursFromTimeframe(timeframe)}`,
        {
          headers: { cache: "no-store" },
        },
      );
      return result.data;
    },
  });

  // Convert timeframe to hours
  function getHoursFromTimeframe(tf: string): number {
    switch (tf) {
      case "1h":
        return 1;
      case "6h":
        return 6;
      case "1d":
        return 24;
      case "1w":
        return 168;
      case "1m":
        return 720;
      case "all":
        return 168; // Default to 1 week
      default:
        return 24;
    }
  }

  if (isLoading) {
    return (
      <div className="bg-dark-800/60 border border-dark-700/50 rounded-xl p-8 text-center">
        <div className="spinner w-8 h-8 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading price chart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-800/60 border border-dark-700/50 rounded-xl p-8 text-center">
        <p className="text-red-400 mb-2">Error loading chart</p>
        <p className="text-gray-400 text-sm">{error.message}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-dark-800/60 border border-dark-700/50 rounded-xl p-8 text-center">
        <p className="text-gray-400">No price data available</p>
      </div>
    );
  }

  // Define colors for each outcome
  const colors = ["#9D1F19", "#EF4444", "#3B82F6", "#C23B34", "#8B5CF6"];

  return (
    <div className="bg-dark-800/60 border border-dark-700/50 rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-white font-semibold mb-2">Price Chart</h3>
        <p className="text-gray-400 text-sm">{timeframe}</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="timeString"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}¢`}
              domain={[0, 1]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#F9FAFB",
              }}
              labelStyle={{ color: "#9CA3AF" }}
              formatter={(value: number, name: string) => [
                formatPrice(value),
                outcomes[parseInt(name.split("_")[1])] || name,
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Legend
              wrapperStyle={{ color: "#F9FAFB" }}
              formatter={(value, entry, index) => [
                outcomes[index] || value,
                <span
                  key={`legend-dot-${index}`}
                  style={{ color: colors[index % colors.length] }}
                ></span>,
              ]}
            />

            {outcomes.map((outcome, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={`outcome_${index}`}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                name={outcome}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;
