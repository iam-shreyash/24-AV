# Adding Your AviationStack API Key

## Your New API Key
```
cc2918f8cbb76d56d4b4483625175a4d
```

## Steps to Add the Key

### Method 1: Via Admin Portal (Recommended)

1. **Start your backend server** (if not running):
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload
   ```

2. **Open your frontend** and log in as admin

3. **Go to Admin Portal → API Keys**

4. **Find or create `AVIATIONSTACK_API_KEY`**:
   - If it exists, click to edit
   - If it doesn't exist, you'll see an "Add" option

5. **Enter your API key**:
   - Key Name: `AVIATIONSTACK_API_KEY`
   - Value: `cc2918f8cbb76d56d4b4483625175a4d`
   - Description: "AviationStack API key for external flight data"

6. **Click Save**

7. **Verify it's saved** - you should see a success message

### Method 2: Via Environment Variable (Alternative)

If you prefer to use `.env` file:

1. **Open `backend/.env`** (or create it)

2. **Add these lines**:
   ```env
   AVIATIONSTACK_API_KEY=cc2918f8cbb76d56d4b4483625175a4d
   ENABLE_EXTERNAL_FLIGHT_API=true
   ```

3. **Restart your backend server**

## Important Notes

⚠️ **API Key Activation**: New API keys sometimes take a few minutes to activate. If you get 401/403 errors immediately after adding:
- Wait 2-5 minutes
- Try again
- Check AviationStack dashboard to ensure key is active

## Testing the Key

### Option 1: Test in Admin Portal
1. Go to **Admin Portal → External Flights**
2. Enter search criteria:
   - Origin: `BOM` (Mumbai)
   - Destination: `DXB` (Dubai)
   - Date: (optional)
3. Click **Search Flights**

### Option 2: Test with Script
```bash
cd backend
python test_aviationstack_key.py cc2918f8cbb76d56d4b4483625175a4d
```

### Option 3: Test with curl
```bash
curl "https://api.aviationstack.com/v1/flights?access_key=cc2918f8cbb76d56d4b4483625175a4d&limit=1"
```

## Troubleshooting

### If you get 401 Unauthorized:
- ✅ Key might need a few minutes to activate (wait 2-5 minutes)
- ✅ Check AviationStack dashboard - is key active?
- ✅ Verify you copied the key correctly (no extra spaces)

### If you get 403 Forbidden:
- ✅ Check your AviationStack plan - does it include flights endpoint?
- ✅ Free tier may have restrictions
- ✅ Some endpoints require paid plans

### If flights don't show:
- ✅ Make sure `ENABLE_EXTERNAL_FLIGHT_API=true` in `.env`
- ✅ Check backend logs for errors
- ✅ Try different airport codes (BOM, DEL, DXB, JFK, etc.)

## Next Steps

1. ✅ Add the key via Admin Portal
2. ✅ Wait 2-5 minutes for activation
3. ✅ Test in External Flights section
4. ✅ If still not working, check AviationStack dashboard

