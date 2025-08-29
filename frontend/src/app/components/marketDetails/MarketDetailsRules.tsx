"use client";

import { useState } from "react";

export const MarketDetailsRules = () => {
  const [rulesExpanded, setRulesExpanded] = useState(true);

  return (
    <div className="bg-dark-800/60 border border-dark-700/50 rounded-xl p-6">
      <div className={`flex items-center justify-between ${rulesExpanded ? "mb-4" : "py-2"}`}>
        <h3 className="text-white font-semibold">Rules</h3>
        <button
          onClick={() => setRulesExpanded(!rulesExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg
            className={`w-5 h-5 transform transition-transform ${rulesExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {rulesExpanded && (
        <ul className="space-y-2 text-gray-300 text-sm">
          <li className="flex items-start">
            <span className="text-sei-400 mr-2">•</span>
            Market resolves based on official announcements
          </li>
          <li className="flex items-start">
            <span className="text-sei-400 mr-2">•</span>
            All trades must be settled before expiration
          </li>
          <li className="flex items-start">
            <span className="text-sei-400 mr-2">•</span>
            Disputes will be resolved by community vote
          </li>
        </ul>
      )}
    </div>
  );
};
