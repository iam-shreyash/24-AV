import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface AirlineTicketProps {
  ticketNumber: string;
  passengerName: string;
  passengerEmail?: string;
  passengerPhone?: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  arrivalDate: string;
  seatNumber?: string;
  bookingDate: string;
  totalAmount: number;
  status: string;
  airlineName?: string;
  aircraftModel?: string;
  bookingId?: number;
}

export default function AirlineTicket({
  ticketNumber,
  passengerName,
  passengerEmail,
  passengerPhone,
  flightNumber,
  origin,
  destination,
  departureTime,
  arrivalTime,
  departureDate,
  arrivalDate,
  seatNumber,
  bookingDate,
  totalAmount,
  status,
  airlineName = "24AV",
  aircraftModel,
  bookingId
}: AirlineTicketProps) {

  const ticketRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;
    setIsGeneratingPDF(true);

    try {
      const canvas = await html2canvas(ticketRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`24AV-Ticket-${ticketNumber}.pdf`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          {isGeneratingPDF ? "Generating PDF..." : "Download Ticket"}
        </button>
      </div>

      {/* NEW 24AV TICKET DESIGN */}
      <div
        ref={ticketRef}
        className="w-full max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl border border-gray-200 overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-300 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white text-blue-600 flex items-center justify-center rounded-xl font-extrabold text-xl">
              24
            </div>
            <div>
              <h2 className="text-2xl font-bold">24AV</h2>
              <p className="text-xs opacity-80">PRIVATE CHARTER TICKET</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] opacity-90">BOOKING REF</p>
            <p className="text-xl font-bold tracking-wide">{ticketNumber}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-6 grid grid-cols-3 gap-6">
          
          {/* Left Section */}
          <div className="col-span-2">
            <p className="text-[11px] text-gray-500 tracking-wide">PASSENGER</p>
            <p className="text-xl font-bold capitalize">{passengerName}</p>

            <span className="mt-2 inline-block bg-blue-600 text-white px-4 py-1 text-xs rounded-md shadow">
              CHARTER
            </span>

            {/* Route */}
            <div className="mt-5 flex items-center gap-10">
              <div>
                <p className="text-5xl font-extrabold text-gray-900">{origin}</p>
                <p className="text-gray-500 text-sm -mt-1">{origin}</p>
              </div>

              <p className="text-4xl font-light text-gray-600">→</p>

              <div>
                <p className="text-5xl font-extrabold text-gray-900">{destination}</p>
                <p className="text-gray-500 text-sm -mt-1">{destination}</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="mt-6 flex items-center gap-16">
              <div>
                <p className="text-[11px] text-gray-500">DATE</p>
                <p className="text-md font-semibold">{departureDate}</p>
              </div>

              <div>
                <p className="text-[11px] text-gray-500">DEPARTURE</p>
                <p className="text-md font-semibold">{departureTime}</p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="border-l border-gray-300 pl-6 text-right">
            <p className="text-[11px] text-gray-500">FLIGHT NO</p>
            <p className="text-lg font-bold">{flightNumber}</p>

            <p className="text-[11px] text-gray-500 mt-4">SEAT</p>
            <p className="text-2xl font-extrabold">{seatNumber || "3"}</p>

            <div className="mt-5">
              <img
                className="w-24 h-24 mx-auto"
                src={`https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${ticketNumber}&choe=UTF-8`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-[11px] text-gray-500">
            This is an electronic private charter ticket. Please carry a valid ID at departure.
          </p>
        </div>
      </div>
    </div>
  );
}