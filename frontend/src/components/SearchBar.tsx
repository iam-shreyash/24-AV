import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, MapPin, Search as SearchIcon, Users, ArrowRightLeft } from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { getStoredAuth } from "./auth/Login";

export default function SearchBar() {
  const navigate = useNavigate();
  const auth = getStoredAuth();
  const location = useLocation();

  // Redirect vendors away from search
  useEffect(() => {
    if (auth?.role === "vendor") {
      // Only redirect vendors when they are on dedicated search or booking routes,
      // not when the shared SearchBar is rendered on the home page.
      if (location.pathname === "/search" || location.pathname === "/book") {
        navigate("/vendor/dashboard", { replace: true });
      }
    }
  }, [auth, navigate, location.pathname]);
  // Start with empty fields so passengers can freely choose any cities.
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departure, setDeparture] = useState("");
  const [passengers, setPassengers] = useState("1");

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = () => {
    if (from && to && departure) {
      const params = new URLSearchParams({ 
        from: from.replace(/ \(.*\)/, ""), 
        to: to.replace(/ \(.*\)/, ""), 
        date: departure 
      });
      navigate(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Origin */}
          <div className="relative flex-1 min-w-[140px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="From city"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="h-14 pl-10 pr-4 text-base border-gray-300 focus:border-blue-600 focus:ring-blue-600"
            />
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-md"
            aria-label="Swap origin and destination"
          >
            <ArrowRightLeft className="h-5 w-5" />
          </button>

          {/* Destination */}
          <div className="relative flex-1 min-w-[140px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="To city"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="h-14 pl-10 pr-4 text-base border-gray-300 focus:border-blue-600 focus:ring-blue-600"
            />
          </div>

          {/* Departure Date */}
          <div className="relative flex-1 min-w-[140px]">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="date"
              placeholder="Departure"
              value={departure}
              onChange={(event) => setDeparture(event.target.value)}
              className="h-14 pl-10 pr-4 text-base border-gray-300 focus:border-blue-600 focus:ring-blue-600"
            />
          </div>

          {/* Passengers */}
          <div className="relative flex-1 min-w-[140px]">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="number"
              placeholder="Passengers"
              value={passengers}
              onChange={(event) => setPassengers(event.target.value)}
              min="1"
              className="h-14 pl-10 pr-4 text-base border-gray-300 focus:border-blue-600 focus:ring-blue-600"
            />
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="h-14 bg-blue-600 px-8 font-semibold text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <SearchIcon className="h-5 w-5" />
            Search Flights
          </Button>
        </div>
      </div>
    </div>
  );
}
