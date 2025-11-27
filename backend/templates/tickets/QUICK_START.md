# Quick Start: Create Your Boarding Pass Template

## 🚀 Fastest Way (Recommended)

### Step 1: Install Dependencies

```bash
cd backend
pip install python-docx
```

### Step 2: Run Template Generator

```bash
python scripts/create_ticket_template.py
```

✅ **Done!** Template will be created at: `backend/templates/tickets/boarding_pass_template.docx`

---

## 📝 Manual Method (If Script Doesn't Work)

1. Open Microsoft Word or LibreOffice Writer
2. Create a new document
3. Design your boarding pass matching your React component
4. Replace static text with placeholders like `{{PASSENGER_NAME}}`
5. Add `{{QR_CODE_IMAGE}}` where you want the QR code
6. Save as `boarding_pass_template.docx` in `backend/templates/tickets/`

---

## 📋 All Placeholders You Need

Copy-paste these into your template:

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

---

## ✅ Test It

1. Make sure template is at: `backend/templates/tickets/boarding_pass_template.docx`
2. Create a booking in your system
3. Call: `GET /api/bookings/{booking_id}/ticket-docx`
4. Download and verify!

---

## 📚 More Help

- **Quick Reference**: See `README.md`
- **Detailed Guide**: See `TEMPLATE_GUIDE.md`
- **Create Template Guide**: See `CREATE_TEMPLATE_GUIDE.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

