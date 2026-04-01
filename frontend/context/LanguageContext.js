"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext(null);

export const translations = {
  en: {
    // Dashboard
    namaste: "Namaste",
    welcomeMsg: "What would you like to explore today?",
    dailyAstrology: "Daily Astrology",
    dailyDesc: "Today's cosmic insights by sun sign or birth chart",
    monthlyAstrology: "Monthly Astrology",
    monthlyDesc: "Plan the month ahead with celestial guidance",
    savedProfiles: "Saved Profiles",
    profilesDesc: "profile",
    profilesDescPlural: "profiles saved",
    sunTimings: "Sun Timings",
    sunrise: "Sunrise",
    sunset: "Sunset",
    loadingSunTimings: "Loading sun timings...",
    explore: "Explore",
    todaysPanchang: "Today's Panchang",
    vedicDailyElements: "Vedic daily elements for",
    loadingPanchangData: "Loading panchang data...",
    tithi: "Tithi",
    nakshatra: "Nakshatra",
    yoga: "Yoga",
    karana: "Karana",
    elapsed: "elapsed",
    no: "No.",
    loading: "Loading...",
    // Sidebar
    dashboard: "Dashboard",
    dailyHoroscope: "Daily Horoscope",
    weeklyHoroscope: "Weekly Horoscope",
    monthlyHoroscope: "Monthly Horoscope",
    panchang: "Panchang",
    vedicPanchang: "Vedic Panchang",
    logout: "Log out",
    yourCosmicGuide: "Your cosmic guide",
    // Mobile Nav
    home: "Home",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    profiles: "Profiles",
    // Language selector
    selectLanguage: "Select Language",
    language: "Language",
  },
  hi: {
    // Dashboard
    namaste: "नमस्ते",
    welcomeMsg: "आज आप क्या खोजना चाहेंगे?",
    dailyAstrology: "दैनिक ज्योतिष",
    dailyDesc: "सूर्य राशि या जन्म कुंडली द्वारा आज की ब्रह्मांडीय अंतर्दृष्टि",
    monthlyAstrology: "मासिक ज्योतिष",
    monthlyDesc: "खगोलीय मार्गदर्शन के साथ आगे महीने की योजना बनाएं",
    savedProfiles: "सहेजी गई प्रोफ़ाइलें",
    profilesDesc: "प्रोफ़ाइल",
    profilesDescPlural: "प्रोफ़ाइलें सहेजी गईं",
    sunTimings: "सूर्य समय",
    sunrise: "सूर्योदय",
    sunset: "सूर्यास्त",
    loadingSunTimings: "सूर्य समय लोड हो रहा है...",
    explore: "अन्वेषण करें",
    todaysPanchang: "आज का पंचांग",
    vedicDailyElements: "वैदिक दैनिक तत्व",
    loadingPanchangData: "पंचांग डेटा लोड हो रहा है...",
    tithi: "तिथि",
    nakshatra: "नक्षत्र",
    yoga: "योग",
    karana: "करण",
    elapsed: "बीत चुका",
    no: "नं.",
    loading: "लोड हो रहा है...",
    // Sidebar
    dashboard: "डैशबोर्ड",
    dailyHoroscope: "दैनिक राशिफल",
    weeklyHoroscope: "साप्ताहिक राशिफल",
    monthlyHoroscope: "मासिक राशिफल",
    panchang: "पंचांग",
    vedicPanchang: "वैदिक पंचांग",
    logout: "लॉग आउट",
    yourCosmicGuide: "आपका ब्रह्मांडीय मार्गदर्शक",
    // Mobile Nav
    home: "होम",
    daily: "दैनिक",
    weekly: "साप्ताहिक",
    monthly: "मासिक",
    profiles: "प्रोफाइल",
    // Language selector
    selectLanguage: "भाषा चुनें",
    language: "भाषा",
  },
  gu: {
    // Dashboard
    namaste: "નમસ્તે",
    welcomeMsg: "આજે તમે શું શોધવા માંગો છો?",
    dailyAstrology: "દૈનિક જ્યોતિષ",
    dailyDesc: "સૂર્ય રાશિ અથવા જન્મ ચાર્ટ દ્વારા આજની બ્રહ્માંડીય આંતરદૃષ્ટિ",
    monthlyAstrology: "માસિક જ્યોતિષ",
    monthlyDesc: "આકાશીય માર્ગદર્શન સાથે આગામી મહિનાની યોજના બનાવો",
    savedProfiles: "સાચવેલી પ્રોફાઇલ્સ",
    profilesDesc: "પ્રોફાઇલ",
    profilesDescPlural: "પ્રોફાઇલ્સ સાચવી",
    sunTimings: "સૂર્ય સમય",
    sunrise: "સૂર્યોદય",
    sunset: "સૂર્યાસ્ત",
    loadingSunTimings: "સૂર્ય સમય લોડ થઈ રહ્યો છે...",
    explore: "અન્વેષણ કરો",
    todaysPanchang: "આજનું પંચાંગ",
    vedicDailyElements: "વૈદિક દૈનિક તત્વો",
    loadingPanchangData: "પંચાંગ ડેટા લોડ થઈ રહ્યો છે...",
    tithi: "તિથિ",
    nakshatra: "નક્ષત્ર",
    yoga: "યોગ",
    karana: "કરણ",
    elapsed: "વીતી ગયેલી",
    no: "નં.",
    loading: "લોડ થઈ રહ્યું છે...",
    // Sidebar
    dashboard: "ડેશબોર્ડ",
    dailyHoroscope: "દૈનિક રાશિફળ",
    weeklyHoroscope: "સાપ્તાહિક રાશિફળ",
    monthlyHoroscope: "માસિક રાશિફળ",
    panchang: "પંચાંગ",
    vedicPanchang: "વૈદિક પંચાંગ",
    logout: "લોગ આઉટ",
    yourCosmicGuide: "તમારા બ્રહ્માંડીય માર્ગદર્શક",
    // Mobile Nav
    home: "હોમ",
    daily: "દૈનિક",
    weekly: "સાપ્તાહિક",
    monthly: "માસિક",
    profiles: "પ્રોફાઇલ્સ",
    // Language selector
    selectLanguage: "ભાષા પસંદ કરો",
    language: "ભાષા",
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved && translations[saved]) {
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem("language", lang);
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
