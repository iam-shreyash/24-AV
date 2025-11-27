# Scripts Directory

This directory contains utility scripts for the PracCRM project.

## Available Scripts

### `create_ticket_template.py`

Generates the DOCX boarding pass template based on the SKYLINE AIRWAYS design.

**Usage**:
```bash
# Make sure python-docx is installed first
pip install python-docx

# Run the script
python scripts/create_ticket_template.py
```

**Output**: 
Creates `backend/templates/tickets/boarding_pass_template.docx` with all placeholders configured.

**What it does**:
- Creates a DOCX document matching the SKYLINE AIRWAYS boarding pass design
- Adds all required placeholders ({{PASSENGER_NAME}}, {{TICKET_NUMBER}}, etc.)
- Sets up proper formatting, colors, and layout
- Includes QR code placeholder

**Requirements**:
- Python 3.9+
- python-docx library installed

