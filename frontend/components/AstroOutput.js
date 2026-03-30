"use client";

import { cn } from "../lib/utils";
import { MdCheckCircle, MdCalendarToday, MdStars, MdPerson, MdBolt, MdCheck, MdInfo } from "react-icons/md";

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

  const { date, sign, user_id, content, cached } = parsedData;

  // Handle profile save response
  if (!content && parsedData.status === "success") {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
            <MdCheckCircle size={22} />
          </div>
          <h3 className="text-lg font-semibold text-green-800">
            Profile Saved Successfully! / प्रोफ़ाइल सफलतापूर्वक सहेजी गई!
          </h3>
        </div>
        <div className="bg-white rounded-lg p-4 mt-3 border border-green-200">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
            {JSON.stringify(parsedData, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // Handle response with no content
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
      <div className="flex flex-wrap gap-3 items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-3">
          {date && (
            <div className="flex items-center gap-1.5 bg-primary-50 px-3 py-1.5 rounded-lg">
              <MdCalendarToday size={14} className="text-primary-600" />
              <span className="text-xs font-semibold text-primary-700">Date:</span>
              <span className="text-sm font-medium text-primary-900">{date}</span>
            </div>
          )}
          {sign && (
            <div className="flex items-center gap-1.5 bg-secondary-50 px-3 py-1.5 rounded-lg">
              <MdStars size={14} className="text-secondary-600" />
              <span className="text-xs font-semibold text-secondary-700">Sign:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{sign}</span>
            </div>
          )}
          {user_id && (
            <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-lg">
              <MdPerson size={14} className="text-purple-600" />
              <span className="text-xs font-semibold text-purple-700">User:</span>
              <span className="text-sm font-medium text-purple-900">{user_id}</span>
            </div>
          )}
        </div>
        {cached !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
              cached ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
            )}
          >
            {cached ? <MdCheck size={14} /> : <MdBolt size={14} />}
            {cached ? "Cached" : "Fresh"}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              EN
            </div>
            <h3 className="font-semibold text-gray-800">English</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{content}</p>
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
              HI
            </div>
            <h3 className="font-semibold text-gray-800">हिंदी</h3>
          </div>
          <p className="text-gray-700 leading-relaxed" style={{ fontFamily: "system-ui" }}>
            {translateToHindi(content, sign)}
          </p>
        </div>
      </div>

      {content && content.includes("MVP") && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-2">
          <MdInfo size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Note:</span> This is an MVP template. Full natal chart
            calculations will be added in future updates.
            <br />
            यह एक MVP टेम्पलेट है। पूर्ण कुंडली गणना भविष्य के अपडेट में जोड़ी जाएगी।
          </p>
        </div>
      )}
    </div>
  );
}

function translateToHindi(content, sign) {
  if (!content) return "";

  const signTranslations = {
    aries: "आज पहल करने के लिए अनुकूल है। संवाद स्पष्ट रखें और जल्दबाजी में निर्णय लेने से बचें।",
    taurus: "स्थिरता पर ध्यान दें और लंबित कार्यों को पूरा करें। अत्यधिक भोग से बचें।",
    gemini: "सीखने और नेटवर्किंग के लिए बढ़िया दिन। विवरणों की दोबारा जांच करें।",
    cancer: "घर और भावनात्मक संतुलन को प्राथमिकता दें। सौम्य दिनचर्या मदद करती है।",
    leo: "आत्मविश्वास उच्च है—दयालुता से नेतृत्व करें। अहंकार की टकराव से बचें।",
    virgo: "आयोजन और स्वास्थ्य दिनचर्या के लिए अच्छा। अधिक न सोचें।",
    libra: "सामंजस्य महत्वपूर्ण है। कूटनीति चुनें और विनम्रता से सीमाएं निर्धारित करें।",
    scorpio: "गहरा ध्यान मदद करता है। अनावश्यक टकराव से बचें।",
    sagittarius: "नए विचारों का अन्वेषण करें। प्रतिबद्धताओं को यथार्थवादी रखें।",
    capricorn: "करियर योजना के लिए मजबूत। एक व्यावहारिक कदम उठाएं।",
    aquarius: "नवाचार प्रवाहित होता है। सहयोग करें और खुले दिमाग रहें।",
    pisces: "रचनात्मकता और अंतर्ज्ञान उच्च हैं। संरचना के साथ खुद को स्थिर रखें।",
  };

  if (sign && signTranslations[sign.toLowerCase()]) {
    const hi = signTranslations[sign.toLowerCase()];
    const dateMatch = content.match(/Date: ([\d-]+)/);
    return dateMatch ? `${hi}\n\n(टेम्पलेट MVP • तारीख: ${dateMatch[1]})` : hi;
  }

  if (content.includes("Based on your profile")) {
    const dobMatch = content.match(/\(([^,]+),/);
    const dob = dobMatch ? dobMatch[1] : "";
    return `आपकी प्रोफ़ाइल के आधार पर (${dob}), आज स्थिर प्रगति के लिए सबसे अच्छा है। 1-2 प्राथमिकताओं पर ध्यान दें, आवेगपूर्ण विकल्पों से बचें, और दिनचर्या को सुसंगत रखें।\n\n(MVP: स्विस एफेमेरिस से जन्म+ट्रांजिट गणना के साथ बदलें।)`;
  }

  return "अधिक विस्तृत हिंदी अनुवाद जल्द ही उपलब्ध होगा।";
}
