"use client";

import { cn } from "../lib/utils";
import {
  MdCheckCircle,
  MdCalendarToday,
  MdStars,
  MdBolt,
  MdCheck,
  MdPerson,
} from "react-icons/md";

export function AstroOutput({ data }) {
  if (!data) return null;

  let parsedData = data;
  if (typeof data === "string") {
    try {
      parsedData = JSON.parse(data);
    } catch {
      return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words font-mono overflow-x-auto">
            {data}
          </pre>
        </div>
      );
    }
  }

  const { date, sign, period, user_id, content, cached } = parsedData;

  // Handle profile save success response
  if (!content && parsedData.status === "success") {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
            <MdCheckCircle size={22} />
          </div>
          <h3 className="text-lg font-semibold text-green-800">
            Profile Saved Successfully!
          </h3>
        </div>
      </div>
    );
  }

  // Fallback: no content field at all
  if (!content) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words font-mono overflow-x-auto">
          {JSON.stringify(parsedData, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Metadata row */}
      <div className="flex flex-wrap gap-2 items-center pb-4 border-b border-gray-200">
        {date && (
          <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg">
            <MdCalendarToday size={14} className="text-indigo-500" />
            <span className="text-xs font-semibold text-indigo-600">Date</span>
            <span className="text-sm font-medium text-indigo-900">{date}</span>
          </div>
        )}
        {sign && (
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg">
            <MdStars size={14} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-600">Sign</span>
            <span className="text-sm font-medium text-amber-900 capitalize">{sign}</span>
          </div>
        )}
        {period && (
          <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-semibold text-purple-600">Period</span>
            <span className="text-sm font-medium text-purple-900 capitalize">{period}</span>
          </div>
        )}
        {user_id && (
          <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
            <MdPerson size={14} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{user_id}</span>
          </div>
        )}
        {cached !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ml-auto",
              cached ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
            )}
          >
            {cached ? <MdCheck size={14} /> : <MdBolt size={14} />}
            {cached ? "Cached" : "Fresh"}
          </div>
        )}
      </div>

      {/* Horoscope text */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <p className="text-gray-800 leading-relaxed text-base">{content}</p>
      </div>
    </div>
  );
}