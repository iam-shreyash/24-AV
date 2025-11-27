# How to Create the SKYLINE AIRWAYS Boarding Pass Template

This guide shows you exactly how to create the DOCX template based on your React component design.

## Step 1: Install Dependencies First

```bash
cd backend
pip install python-docx
```

Or install all requirements:
```bash
pip install -r requirements.txt
```

## Step 2: Run the Template Generator Script

```bash
python scripts/create_ticket_template.py
```

This will automatically create the template at: `backend/templates/tickets/boarding_pass_template.docx`

## Step 3: Manual Template Creation (Alternative)

If you prefer to create it manually in Microsoft Word or LibreOffice:

### Template Structure

Follow this exact layout:

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│              SKYLINE AIRWAYS                            │
│                                                          │
│        skylineairways.com | 222 555 7777                │
│                                                          │
│ ═══════════════════════════════════════════════════════ │
│                                                          │
│  PASSENGER INFORMATION                                  │
│                                                          │
│  ┌────────────────────┬────────────────────┐           │
│  │ Passenger Name     │ Ticket Number      │           │
│  │ {{PASSENGER_NAME}} │ #{{TICKET_NUMBER}} │           │
│  └────────────────────┴────────────────────┘           │
│                                                          │
│ ═══════════════════════════════════════════════════════ │
│                                                          │
│  DEPARTURE                                              │
│                                                          │
│  ┌────────────────────┬────────────────────┐           │
│  │ Airport            │ Date               │           │
│  │ {{DEPARTURE_AIRPORT}}│ {{DEPARTURE_DATE}}│           │
│  ├────────────────────┼────────────────────┤           │
│  │ Gate               │ Departure Time     │           │
│  │ {{GATE}}           │ {{DEPARTURE_TIME}} │           │
│  ├────────────────────┴────────────────────┤           │
│  │ Boarding Time                           │           │
│  │ {{BOARDING_TIME}}                       │           │
│  └────────────────────────────────────────┘           │
│                                                          │
│ ═══════════════════════════════════════════════════════ │
│                                                          │
│  ARRIVAL                                                │
│                                                          │
│  ┌────────────────────┬────────────────────┐           │
│  │ Airport            │ Date               │           │
│  │ {{ARRIVAL_AIRPORT}} │ {{ARRIVAL_DATE}}   │           │
│  ├────────────────────┼────────────────────┤           │
│  │ Expected Arrival Time                   │           │
│  │ {{ARRIVAL_TIME}}                        │           │
│  └────────────────────────────────────────┘           │
│                                                          │
│ ═══════════════════════════════════════════════════════ │
│                                                          │
│  FLIGHT INFORMATION                                     │
│                                                          │
│  ┌────────────────────┬────────────────────┐           │
│  │ Flight Number      │ Class              │           │
│  │ {{FLIGHT_NUMBER}}  │ {{CLASS}}          │           │
│  ├────────────────────┼────────────────────┤           │
│  │ Aircraft Type      │ Seat               │           │
│  │ {{AIRCRAFT_TYPE}}  │ {{SEAT}}           │           │
│  └────────────────────┴────────────────────┘           │
│                                                          │
│ ═══════════════════════════════════════════════════════ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐│
│  │  BOARDING PASS SECTION (Blue Background)           ││
│  │  ┌─────────┬─────────┬─────────┬─────────┐        ││
│  │  │ Flight  │ Gate    │ Seat    │ Boarding│        ││
│  │  │{{FLIGHT │{{GATE}} │{{SEAT}} │{{BOARDING│        ││
│  │  │_NUMBER}}│         │         │_TIME}}  │        ││
│  │  └─────────┴─────────┴─────────┴─────────┘        ││
│  │                                                      ││
│  │           BOARDING PASS                             ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│              QR CODE                                     │
│              {{QR_CODE_IMAGE}}                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Placeholder Mapping

Match these placeholders from your React component to the DOCX template:

| React Component Field | DOCX Placeholder | Example Value |
|----------------------|------------------|---------------|
| `passengerName` | `{{PASSENGER_NAME}}` | Marybeth Jones |
| `ticketNumber` | `{{TICKET_NUMBER}}` | 400251A |
| `departureAirport` | `{{DEPARTURE_AIRPORT}}` | JFK International Airport, New York |
| `departureDate` | `{{DEPARTURE_DATE}}` | October 30, 2060 |
| `departureGate` | `{{GATE}}` | B12 |
| `departureTime` | `{{DEPARTURE_TIME}}` | 10:15 AM |
| `boardingTime` | `{{BOARDING_TIME}}` | 09:30 AM |
| `arrivalAirport` | `{{ARRIVAL_AIRPORT}}` | Heathrow Airport, London |
| `arrivalDate` | `{{ARRIVAL_DATE}}` | October 30, 2060 |
| `arrivalTime` | `{{ARRIVAL_TIME}}` | 10:00 PM (local time) |
| `flightNumber` | `{{FLIGHT_NUMBER}}` | SKY555 |
| `flightClass` | `{{CLASS}}` | Business |
| `aircraftType` | `{{AIRCRAFT_TYPE}}` | Boeing 777 |
| `seat` | `{{SEAT}}` | 2A |

## Color Scheme

Use these colors (matching your React component):

- **Primary Blue**: `#094F8E` (HSL: 214 100% 35%)
- **Accent Orange**: `#FB923C` (HSL: 25 95% 53%)
- **Gray Text**: `#6B7280` (for labels)
- **Dark Text**: `#262A33` (for content)
- **White**: `#FFFFFF` (for boarding pass section text)

## Font Sizes

- **Header "SKYLINE AIRWAYS"**: 32pt, Bold, Blue
- **Contact Info**: 10pt, Gray
- **Section Headers**: 18pt, Bold, Blue/Orange
- **Labels**: 11pt, Bold, Gray
- **Values**: 14-24pt depending on importance
- **Gate/Seat (emphasized)**: 24pt, Bold, Blue
- **BOARDING PASS text**: 24pt, Bold, White

## Important Notes

1. **Placeholders must be exact**: `{{PASSENGER_NAME}}` not `{{PASSENGER_NAME }}` (no spaces inside braces)
2. **Case-sensitive**: `{{PASSENGER_NAME}}` not `{{passenger_name}}`
3. **QR Code**: Place `{{QR_CODE_IMAGE}}` on its own line/paragraph where you want the QR code
4. **Boarding Pass Section**: Use table with blue background (primary blue color)
5. **Layout**: Match the spacing and structure from your React component

## Quick Reference: All Placeholders

Copy and paste these placeholders into your template:

```
{{PASSENGER_NAME}}
{{TICKET_NUMBER}}
{{DEPARTURE_AIRPORT}}
{{DEPARTURE_DATE}}
{{DEPARTURE_TIME}}
{{GATE}}
{{BOARDING_TIME}}
{{ARRIVAL_AIRPORT}}
{{ARRIVAL_DATE}}
{{ARRIVAL_TIME}}
{{FLIGHT_NUMBER}}
{{CLASS}}
{{AIRCRAFT_TYPE}}
{{SEAT}}
{{QR_CODE_IMAGE}}
```

## Testing Your Template

1. Save the template as `boarding_pass_template.docx`
2. Place it in `backend/templates/tickets/` directory
3. Create a test booking in your system
4. Call the API: `GET /api/bookings/{booking_id}/ticket-docx`
5. Download and verify the output matches your design

## Need Help?

- Check `README.md` for quick reference
- See `TEMPLATE_GUIDE.md` for detailed documentation
- Review `IMPLEMENTATION_SUMMARY.md` for technical details

