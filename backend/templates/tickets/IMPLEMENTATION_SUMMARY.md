# DOCX-Based Boarding Pass Generator - Implementation Summary

## ✅ What Was Implemented

A complete DOCX template-based boarding pass generation system that:

1. ✅ Loads DOCX templates with placeholders
2. ✅ Replaces placeholders with dynamic booking data
3. ✅ Inserts QR code images
4. ✅ Converts DOCX to PDF (with fallback to DOCX)
5. ✅ Maintains exact layout, fonts, and styling from template

## 📁 Files Created

### Backend Service
- `backend/app/services/ticket_generator.py` - Main ticket generation service

### API Endpoint
- `backend/app/routers/bookings.py` - New endpoint `/api/bookings/{booking_id}/ticket-docx`

### Template Directory
- `backend/templates/tickets/` - Directory for DOCX templates
- `backend/templates/tickets/README.md` - Quick reference guide
- `backend/templates/tickets/TEMPLATE_GUIDE.md` - Complete template guide

### Dependencies
- `backend/requirements.txt` - Added `python-docx` and `docx2pdf`

## 🔧 How It Works

### 1. Template Loading
- System looks for `boarding_pass_template.docx` in `backend/templates/tickets/`
- Can use custom template path via `TicketGenerator(template_path="...")`

### 2. Placeholder Replacement
All placeholders are replaced in:
- Document body text
- Tables
- Headers
- Footers

### 3. QR Code Generation
- Generates QR code with booking data
- Inserts image where `{{QR_CODE_IMAGE}}` placeholder is located
- Image size: 1 inch wide (adjustable)

### 4. PDF Conversion
**Primary Method**: LibreOffice headless conversion
- Automatically detects LibreOffice installation
- Converts DOCX → PDF with font embedding

**Fallback Methods**:
1. docx2pdf library (Windows with Microsoft Word)
2. Returns DOCX if PDF conversion fails

## 📝 Available Placeholders

### Passenger & Ticket
- `{{PASSENGER_NAME}}` - Passenger full name (UPPERCASE)
- `{{TICKET_NUMBER}}` - Unique ticket number (PVT-YYYY-XXXXXX)

### Departure
- `{{DEPARTURE_AIRPORT}}` - Airport name
- `{{DEPARTURE_AIRPORT_CODE}}` - Airport IATA code (BOM, DEL, etc.)
- `{{DEPARTURE_DATE}}` - Date (DD MMM YYYY format)
- `{{DEPARTURE_TIME}}` - Time (HH:MM format)
- `{{GATE}}` - Gate number
- `{{BOARDING_TIME}}` - Boarding time (30 min before departure)

### Flight Details
- `{{FLIGHT_NUMBER}}` - Flight number
- `{{CLASS}}` - Class type (FIRST CLASS, BUSINESS, etc.)
- `{{AIRCRAFT_TYPE}}` - Aircraft model
- `{{SEAT}}` - Seat number or "CHARTER"

### Arrival
- `{{ARRIVAL_AIRPORT}}` - Airport name
- `{{ARRIVAL_AIRPORT_CODE}}` - Airport IATA code
- `{{ARRIVAL_DATE}}` - Date (DD MMM YYYY format)
- `{{ARRIVAL_TIME}}` - Expected arrival time

### QR Code
- `{{QR_CODE_IMAGE}}` - QR code image (inserted automatically)

## 🚀 Usage

### API Endpoint

```bash
GET /api/bookings/{booking_id}/ticket-docx
```

**Query Parameters**:
- `use_template` (optional, default: `true`) - Use DOCX template

**Example**:
```bash
curl -X GET "http://localhost:8000/api/bookings/123/ticket-docx" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output boarding-pass.pdf
```

### Python Code

```python
from app.services.ticket_generator import TicketGenerator

# Initialize generator (uses default template)
generator = TicketGenerator()

# Or use custom template
generator = TicketGenerator(template_path="/path/to/custom/template.docx")

# Generate ticket
buffer, media_type = generator.generate_ticket_pdf(
    booking=booking,
    flight=flight,
    passenger=passenger,
    plane=plane,
    prefer_pdf=True
)

# buffer contains PDF or DOCX bytes
# media_type is "application/pdf" or "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
```

## 📋 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs:
- `python-docx>=1.1.0` - For DOCX manipulation
- `docx2pdf>=0.1.8` - For PDF conversion (optional, Windows only)

### 2. Install LibreOffice (Recommended for PDF conversion)

**Windows**:
1. Download from: https://www.libreoffice.org/download/
2. Install with default settings
3. System will auto-detect it

**Linux**:
```bash
sudo apt-get install libreoffice
```

**macOS**:
```bash
brew install --cask libreoffice
```

### 3. Create Template

1. Open Microsoft Word or LibreOffice Writer
2. Design your boarding pass with placeholders
3. Save as `boarding_pass_template.docx`
4. Place in `backend/templates/tickets/` directory

### 4. Test

1. Create a booking in the system
2. Call the endpoint: `GET /api/bookings/{booking_id}/ticket-docx`
3. Verify output matches your template design

## 🔄 Fallback Behavior

The system has intelligent fallback:

1. **First**: Try DOCX template → PDF
2. **Second**: Try DOCX template → DOCX (if PDF conversion fails)
3. **Third**: Fall back to existing ReportLab-based endpoint

## ✨ Key Features

- ✅ **Exact Layout Preservation**: All fonts, colors, sizes, alignment maintained
- ✅ **Multiple Placeholder Support**: Works in body, tables, headers, footers
- ✅ **QR Code Integration**: Automatic QR code generation and insertion
- ✅ **Font Embedding**: PDFs include fonts for cross-platform compatibility
- ✅ **Error Handling**: Graceful fallback if template unavailable
- ✅ **Flexible**: Custom template paths supported

## 📚 Documentation

- `README.md` - Quick reference with all placeholders
- `TEMPLATE_GUIDE.md` - Complete guide with examples and troubleshooting
- `IMPLEMENTATION_SUMMARY.md` - This file

## 🎯 Next Steps

1. **Create Your Template**: Design the "SKYLINE AIRWAYS" boarding pass template
2. **Add Placeholders**: Replace static text with placeholders
3. **Place QR Code**: Add `{{QR_CODE_IMAGE}}` where needed
4. **Save Template**: Save as `boarding_pass_template.docx`
5. **Test**: Generate a ticket and verify output

## 🔍 Example Template Structure

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

## 📝 Notes

- All placeholders are **case-sensitive**: `{{PASSENGER_NAME}}` not `{{passenger_name}}`
- Placeholders use **double curly braces**: `{{PLACEHOLDER}}`
- QR code is automatically generated with booking data
- PDF conversion requires LibreOffice or Microsoft Word (Windows)
- If PDF conversion fails, DOCX is returned as fallback

## ⚠️ Important

**You still need to create the actual DOCX template file!**

The system is ready to use, but you need to:
1. Design your template in Word/LibreOffice
2. Save it as `boarding_pass_template.docx`
3. Place it in `backend/templates/tickets/`

Once the template file is in place, the system will automatically use it for ticket generation!

