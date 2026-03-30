"use client";

import { useState, useEffect, useRef } from "react";
import { MdLocationOn, MdSync } from "react-icons/md";
import { cn } from "../lib/utils";
import { Input } from "./ui/Input";

export function LocationInput({ value, onChange, onLocationSelect, className }) {
  const [searchQuery, setSearchQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        // Using Nominatim API from OpenStreetMap
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(searchQuery)}&` +
          `countrycodes=in&` +
          `format=json&` +
          `limit=10&` +
          `addressdetails=1`,
          {
            headers: {
              'User-Agent': 'VedicAstroBot/1.0'
            }
          }
        );
        
        const data = await response.json();
        
        const formattedSuggestions = data.map(item => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          name: item.name,
          state: item.address?.state || "",
          country: item.address?.country || "India"
        }));
        
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchLocations, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange(newValue);
    setSelectedIndex(-1);
  };

  const handleSelectLocation = (location) => {
    const displayText = `${location.name}, ${location.state}, India`;
    setSearchQuery(displayText);
    onChange(displayText);
    setShowSuggestions(false);
    
    if (onLocationSelect) {
      onLocationSelect({
        place_name: displayText,
        lat: location.lat,
        lon: location.lon
      });
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectLocation(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className={cn("relative", className)} ref={inputRef}>
      <div className="relative">
        <Input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search Indian cities/villages..."
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <MdSync className="w-4 h-4 text-muted-foreground animate-spin" />
          ) : (
            <MdLocationOn className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          style={{ position: 'absolute', zIndex: 9999 }}
          className={cn(
            "w-full mt-2 py-1 rounded-md border-2 border-gray-200",
            "bg-white shadow-2xl max-h-60 overflow-auto"
          )}
        >
          {suggestions.map((location, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectLocation(location)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "w-full px-3 py-2.5 text-left transition-colors block",
                "hover:bg-primary-50",
                selectedIndex === index ? "bg-primary-50" : "bg-white"
              )}
            >
              <div className="flex items-start gap-2">
                <MdLocationOn className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate text-sm">{location.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {location.display_name}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
