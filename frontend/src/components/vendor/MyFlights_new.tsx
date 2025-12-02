import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * MyFlights component displays a list of flights managed by the vendor.
 * It provides an overview of upcoming flights and their status.
 */
const MyFlights = () => {
  const [activeTab, setActiveTab] = useState<string>('upcoming');

  // Mock data - replace with actual API call
  const flights = [
    {
      id: 'FL001',
      flightNumber: 'BA123',
      origin: 'New York (JFK)',
      destination: 'London (LHR)',
      departure: '2023-06-15T14:30:00',
      arrival: '2023-06-16T02:15:00',
      status: 'scheduled',
      aircraft: 'Boeing 787-9',
      availableSeats: 42,
      totalSeats: 250,
    },
    {
      id: 'FL002',
      flightNumber: 'BA456',
      origin: 'London (LHR)',
      destination: 'New York (JFK)',
      departure: '2023-06-16T10:15:00',
      arrival: '2023-06-16T13:45:00',
      status: 'scheduled',
      aircraft: 'Airbus A380',
      availableSeats: 128,
      totalSeats: 450,
    },
    {
      id: 'FL003',
      flightNumber: 'BA789',
      origin: 'London (LHR)',
      destination: 'Tokyo (HND)',
      departure: '2023-06-17T09:00:00',
      arrival: '2023-06-18T05:30:00',
      status: 'delayed',
      aircraft: 'Boeing 777-300ER',
      availableSeats: 12,
      totalSeats: 320,
      delayReason: 'Technical check',
    },
  ];

  const filteredFlights = flights.filter((flight) => {
    if (activeTab === 'upcoming') return true;
    if (activeTab === 'delayed') return flight.status === 'delayed';
    return flight.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      scheduled: 'bg-blue-100 text-blue-800',
      delayed: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Flights</h1>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <Link
            to="../vendor"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Back to Dashboard
          </Link>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
            Add New Flight
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['upcoming', 'delayed', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'delayed' && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {flights.filter((f) => f.status === 'delayed').length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Flights List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {filteredFlights.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredFlights.map((flight) => (
              <li key={flight.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-lg font-medium text-blue-600 truncate mr-3">
                        {flight.flightNumber}
                      </p>
                      {getStatusBadge(flight.status)}
                      {flight.status === 'delayed' && flight.delayReason && (
                        <p className="ml-3 text-sm text-yellow-600">
                          {flight.delayReason}
                        </p>
                      )}
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <button className="mr-3 text-sm font-medium text-blue-600 hover:text-blue-500">
                        View Details
                      </button>
                      <button className="text-sm font-medium text-gray-500 hover:text-gray-700">
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {flight.origin} → {flight.destination}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6H8a1 1 0 010-2h1V3a1 1 0 011-1zm0 4a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H8a1 1 0 110-2h1V7a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {formatDate(flight.departure)} - {formatDate(flight.arrival)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0116 8H4a5 5 0 014.5 3.67A6.97 6.97 0 007 16c0 .34.024.673.07 1h5.86z" />
                      </svg>
                      {flight.availableSeats} of {flight.totalSeats} seats available
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: `${((flight.totalSeats - flight.availableSeats) / flight.totalSeats) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No flights</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'upcoming'
                ? 'Get started by creating a new flight.'
                : `You don't have any ${activeTab} flights.`}
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                New Flight
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFlights;
