# Add Amadeus API Credentials

## Your Amadeus Credentials

**API Key (Client ID):**
```
IVSeqiSIHPdvR3FCE50DamZS5LrTfAOT
```

**API Secret:**
```
zLqckaX3lLm4mTy5
```

## Quick Setup Steps

### Step 1: Go to Admin Portal

1. Open your application
2. Log in as **Admin**
3. Navigate to **Admin Portal → API Keys**

### Step 2: Add AMADEUS_API_KEY

1. Find or create `AMADEUS_API_KEY`
2. Enter the value: `IVSeqiSIHPdvR3FCE50DamZS5LrTfAOT`
3. Description: "Amadeus API Key (Client ID) - Test Environment"
4. Click **Save**

### Step 3: Add AMADEUS_API_SECRET

1. Find or create `AMADEUS_API_SECRET`
2. Enter the value: `zLqckaX3lLm4mTy5`
3. Description: "Amadeus API Secret - Test Environment"
4. Click **Save**

### Step 4: Verify Setup

1. Go to **Admin Portal → External Flights**
2. Check the status card - it should show:
   - ✅ Amadeus API is configured and ready
   - Badge showing "✅ Amadeus"

### Step 5: Test Flight Search

1. In **External Flights** section:
   - Origin: `BOM` (Mumbai)
   - Destination: `DXB` (Dubai)
   - Date: (optional, defaults to tomorrow)
2. Click **Search Flights**

## Important Notes

⚠️ **Activation Delay**: New Amadeus credentials sometimes take 1-2 minutes to activate after creation. If you get authentication errors immediately, wait a moment and try again.

✅ **Test Environment**: These credentials are for the test environment (`test.api.amadeus.com`), which is perfect for development and free tier usage.

✅ **No Restart Needed**: Once added, the credentials are loaded dynamically - no server restart required!

## Troubleshooting

### "Failed to authenticate with Amadeus API"
- Wait 1-2 minutes after adding credentials (activation delay)
- Verify both keys are saved correctly
- Check for any extra spaces when copying

### "No flights found"
- Try different airport codes (BOM, DEL, DXB, JFK, etc.)
- Use future dates (tomorrow or later)
- Some routes may not have flights in test environment

### Still having issues?
- Check Amadeus dashboard to ensure app is active
- Verify credentials are for Test environment (not Production)
- Check backend logs for detailed error messages

## Next Steps

Once credentials are added:
1. ✅ Test in External Flights section
2. ✅ Monitor usage in Amadeus dashboard
3. ✅ Enjoy free tier flight search! 🎉

