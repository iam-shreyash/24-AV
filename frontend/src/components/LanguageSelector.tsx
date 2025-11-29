import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // All languages from your folder list
  const languages: Language[] = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "ar", name: "Arabic", flag: "🇦🇪" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
  ];

  const currentLanguage =
    languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = (code: string): void => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-blue-50 transition"
      >
        <span className="text-gray-700">{currentLanguage.flag}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200 overflow-hidden z-50 animate-fadeIn">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                  currentLanguage.code === language.code
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <span className="text-base">{language.flag}</span>
                <span>{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
