# DOCX Template Guide for Boarding Pass Generation

## Overview

This system generates boarding passes from Microsoft Word (DOCX) templates. The template contains placeholders that are replaced with actual booking data at runtime.

## Quick Start

1. **Create your template** in Microsoft Word or LibreOffice Writer
2. **Save it as** `boarding_pass_template.docx` in the `backend/templates/tickets/` directory
3. **Use placeholders** like `{{PASSENGER_NAME}}` anywhere in the document
4. **Place QR code** using `{{QR_CODE_IMAGE}}` placeholder

## All Available Placeholders

### Passenger Information
| Placeholder | Description | Example Output |
|------------|-------------|----------------|
| `{{PASSENGER_NAME}}` | Full passenger name (uppercase) | JOHN DOE |

### Ticket Information
| Placeholder | Description | Example Output |
|------------|-------------|----------------|
| `{{TICKET_NUMBER}}` | Unique ticket number | PVT-2024-000123 |

### Departure Information
| Placeholder | Description | Example Output |
|------------|-------------|----------------|
| `{{DEPARTURE_AIRPORT}}` | Full airport name (uppercase) | MUMBAI |
| `{{DEPARTURE_AIRPORT_CODE}}` | Airport IATA code | BOM |
| `{{DEPARTURE_DATE}}` | Departure date | 21 NOV 2024 |
| `{{DEPARTURE_TIME}}` | Departure time (24hr format) | 12:00 |
| `{{GATE}}` | Gate number | G4 |
| `{{BOARDING_TIME}}` | Boarding time (30 min before departure) | 11:30 |

### Flight Information
| Placeholder | Description | Example Output |
|------------|-------------|----------------|
| `{{FLIGHT_NUMBER}}` | Flight number | PJ-1 |
| `{{CLASS}}` | Class type | FIRST CLASS |
| `{{AIRCRAFT_TYPE}}` | Aircraft model | Gulfstream G650 |
| `{{SEAT}}` | Seat number or "CHARTER" | 1A or CHARTER |

### Arrival Information
| Placeholder | Description | Example Output |
|------------|-------------|----------------|
| `{{ARRIVAL_AIRPORT}}` | Full airport name (uppercase) | DUBAI |
| `{{ARRIVAL_AIRPORT_CODE}}` | Airport IATA code | DXB |
| `{{ARRIVAL_DATE}}` | Arrival date | 21 NOV 2024 |
| `{{ARRIVAL_TIME}}` | Expected arrival time | 14:30 |

### QR Code
| Placeholder | Description | Output |
|------------|-------------|--------|
| `{{QR_CODE_IMAGE}}` | QR code image (1 inch wide) | PNG image embedded |

## Template Structure Example

Here's a sample template structure matching the "SKYLINE AIRWAYS" boarding pass format:

```
┌──────────────────────────────────────────────┐
│                                              │
│          SKYLINE AIRWAYS                     │
│                                              │
│ TICKET NUMBER: {{TICKET_NUMBER}}            │
│                                              │
│ PASSENGER: {{PASSENGER_NAME}}               │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ DEPARTURE                                    │
│                                              │
│ {{DEPARTURE_AIRPORT_CODE}}                  │
│ {{DEPARTURE_AIRPORT}}                        │
│                                              │
│ DATE: {{DEPARTURE_DATE}}                     │
│ TIME: {{DEPARTURE_TIME}}                     │
│ GATE: {{GATE}}                               │
│ BOARDING: {{BOARDING_TIME}}                  │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ FLIGHT: {{FLIGHT_NUMBER}}                    │
│ CLASS: {{CLASS}}                             │
│ AIRCRAFT: {{AIRCRAFT_TYPE}}                  │
│ SEAT: {{SEAT}}                               │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ ARRIVAL                                      │
│                                              │
│ {{ARRIVAL_AIRPORT_CODE}}                     │
│ {{ARRIVAL_AIRPORT}}                          │
│                                              │
│ DATE: {{ARRIVAL_DATE}}                       │
│ TIME: {{ARRIVAL_TIME}}                       │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│              {{QR_CODE_IMAGE}}               │
│                                              │
└──────────────────────────────────────────────┘
```

## Tips for Creating Templates

### 1. Preserve Formatting
- All fonts, colors, sizes, and alignment will be preserved
- Use Word's built-in styles for consistency
- The system maintains paragraph and table formatting

### 2. Using Tables
Placeholders work in tables too:
```
┌─────────────┬─────────────┐
│ Airport     │ {{ORIGIN}}  │
│ Code        │ {{CODE}}    │
└─────────────┴─────────────┘
```

### 3. Headers and Footers
Placeholders also work in document headers and footers:
- Go to Insert → Header/Footer
- Add placeholders like `{{TICKET_NUMBER}}`

### 4. QR Code Placement
- Place `{{QR_CODE_IMAGE}}` where you want the QR code
- The image will be 1 inch wide automatically
- It works in the body, tables, headers, or footers

### 5. Multiple Placeholders
You can use the same placeholder multiple times in the document:
```
Header: {{TICKET_NUMBER}}
Body: Your ticket number is {{TICKET_NUMBER}}
Footer: Ref: {{TICKET_NUMBER}}
```

## Font Embedding

When converting to PDF:
- **LibreOffice**: Embeds fonts automatically
- **docx2pdf**: Uses system fonts (ensure fonts are available)
- **Fallback**: If PDF conversion fails, DOCX is returned

## Testing Your Template

1. Create a test booking in the system
2. Call the endpoint: `GET /api/bookings/{booking_id}/ticket-docx`
3. Download and check the output
4. Adjust template as needed

## Troubleshooting

### Template Not Found
**Error**: `Template not found: backend/templates/tickets/boarding_pass_template.docx`

**Solution**:
1. Ensure file exists at the correct path
2. Check file name is exactly: `boarding_pass_template.docx`
3. Verify file permissions

### Placeholders Not Replaced
**Issue**: Placeholders appear as `{{PLACEHOLDER}}` in output

**Solution**:
1. Check placeholder spelling (case-sensitive)
2. Ensure double curly braces: `{{` and `}}`
3. No spaces inside braces: `{{PASSENGER_NAME}}` not `{{ PASSENGER_NAME }}`

### PDF Conversion Fails
**Issue**: Receiving DOCX instead of PDF

**Solution**:
1. Install LibreOffice (recommended for best results)
2. Or install docx2pdf library (Windows: requires Microsoft Word)
3. Check conversion logs for specific errors

### QR Code Not Appearing
**Issue**: QR code placeholder not replaced

**Solution**:
1. Ensure placeholder is exactly: `{{QR_CODE_IMAGE}}`
2. Check image insertion permissions
3. Verify QR code generation is working

## Custom Template Path

To use a custom template:

```python
from app.services.ticket_generator import TicketGenerator

generator = TicketGenerator(
    template_path="/path/to/custom/template.docx"
)
```

## API Endpoint

**Endpoint**: `GET /api/bookings/{booking_id}/ticket-docx`

**Query Parameters**:
- `use_template` (optional, default: true): Whether to use DOCX template

**Response**:
- Success: PDF or DOCX file download
- Error: JSON error message

**Example**:
```bash
curl -X GET "http://localhost:8000/api/bookings/123/ticket-docx" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output boarding-pass.pdf
```

## Next Steps

1. Create your template file
2. Save it as `boarding_pass_template.docx`
3. Test with a real booking
4. Customize layout and styling as needed
5. Deploy!

