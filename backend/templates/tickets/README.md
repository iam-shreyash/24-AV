# Ticket Templates Directory

This directory contains DOCX templates for boarding pass generation.

## Template File

Place your DOCX template file here with the name: `boarding_pass_template.docx`

## Placeholders

The following placeholders can be used in your DOCX template:

### Passenger Information
- `{{PASSENGER_NAME}}` - Full name of the passenger (UPPERCASE)

### Ticket Information
- `{{TICKET_NUMBER}}` - Unique ticket number (format: PVT-YYYY-XXXXXX)

### Departure Information
- `{{DEPARTURE_AIRPORT}}` - Full departure airport name (UPPERCASE)
- `{{DEPARTURE_AIRPORT_CODE}}` - Departure airport code (e.g., BOM, DEL)
- `{{DEPARTURE_DATE}}` - Departure date (format: DD MMM YYYY, e.g., 21 NOV 2024)
- `{{DEPARTURE_TIME}}` - Departure time (format: HH:MM, e.g., 12:00)
- `{{GATE}}` - Gate number (e.g., G4)
- `{{BOARDING_TIME}}` - Boarding time (format: HH:MM)

### Flight Information
- `{{FLIGHT_NUMBER}}` - Flight number (e.g., PJ-1)
- `{{CLASS}}` - Class type (e.g., FIRST CLASS, BUSINESS)
- `{{AIRCRAFT_TYPE}}` - Aircraft model/type
- `{{SEAT}}` - Seat number or "CHARTER" for full charter bookings

### Arrival Information
- `{{ARRIVAL_AIRPORT}}` - Full arrival airport name (UPPERCASE)
- `{{ARRIVAL_AIRPORT_CODE}}` - Arrival airport code (e.g., DXB, JFK)
- `{{ARRIVAL_DATE}}` - Arrival date (format: DD MMM YYYY)
- `{{ARRIVAL_TIME}}` - Expected arrival time (format: HH:MM)

### QR Code
- `{{QR_CODE_IMAGE}}` - Placeholder for QR code image (will be inserted as 1-inch wide image)

## Usage in Template

1. Create your template in Microsoft Word or LibreOffice
2. Use placeholders anywhere in the document (headers, body, footers, tables)
3. Place `{{QR_CODE_IMAGE}}` where you want the QR code to appear
4. Save as `boarding_pass_template.docx` in this directory
5. The system will automatically replace all placeholders with actual data

## Example Template Structure

```
┌─────────────────────────────────────────┐
│          SKYLINE AIRWAYS                │
│                                         │
│ TICKET NUMBER: {{TICKET_NUMBER}}       │
│                                         │
│ PASSENGER: {{PASSENGER_NAME}}          │
│                                         │
│ DEPARTURE                               │
│ {{DEPARTURE_AIRPORT_CODE}}              │
│ {{DEPARTURE_AIRPORT}}                   │
│ DATE: {{DEPARTURE_DATE}}                │
│ TIME: {{DEPARTURE_TIME}}                │
│ GATE: {{GATE}}                          │
│ BOARDING: {{BOARDING_TIME}}             │
│                                         │
│ FLIGHT: {{FLIGHT_NUMBER}}               │
│ CLASS: {{CLASS}}                        │
│ AIRCRAFT: {{AIRCRAFT_TYPE}}             │
│ SEAT: {{SEAT}}                          │
│                                         │
│ ARRIVAL                                 │
│ {{ARRIVAL_AIRPORT_CODE}}                │
│ {{ARRIVAL_AIRPORT}}                     │
│ DATE: {{ARRIVAL_DATE}}                  │
│ TIME: {{ARRIVAL_TIME}}                  │
│                                         │
│              {{QR_CODE_IMAGE}}          │
└─────────────────────────────────────────┘
```

## Custom Template Path

You can also specify a custom template path when initializing the TicketGenerator:

```python
from app.services.ticket_generator import TicketGenerator

generator = TicketGenerator(template_path="/path/to/custom/template.docx")
```

## Notes

- All placeholders are case-sensitive: `{{PASSENGER_NAME}}` not `{{passenger_name}}`
- Placeholders can be used in tables, headers, footers, and body text
- The QR code image will be 1 inch wide by default
- Template layout, fonts, and styling will be preserved in the output

