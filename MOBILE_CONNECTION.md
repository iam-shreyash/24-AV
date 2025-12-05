# Mobile App Connection Guide

To connect your Android or iOS application to the backend, you do **not** need to copy any database files. Your mobile app connects to the backend API, which handles all database interactions.

## 1. API Base URL

Update your mobile app's API client configuration (e.g., `api.ts`, `.env`, or `config.js`) with the following Base URL depending on where you are running the app:

| Environment | Base URL |
|-------------|----------|
| **Android Emulator** | `http://10.0.2.2:8000` |
| **iOS Simulator** | `http://localhost:8000` |
| **Physical Device (Your Wi-Fi)** | `http://192.168.31.64:8000` |

**Note:** For physical devices, your phone must be connected to the same Wi-Fi network as your computer (`192.168.31.64`).

## 2. Troubleshooting Connection

If the app cannot connect:
1.  **Ensure Backend is Running:**
    Run the backend server on your computer:
    ```bash
    cd backend
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ```
    *Note: Using `--host 0.0.0.0` is crucial for allowing external connections (like from your phone).*

2.  **Firewall:**
    Ensure your Windows Firewall allows incoming connections on port `8000` for Python/Uvicorn.

3.  **CORS:**
    We have already configured the backend to allow connections from all origins (`*`).

## 3. Firebase & Third-Party Keys

If your app uses Firebase (e.g., for Google Login or Notifications), you need to download the configuration files directly from the [Firebase Console](https://console.firebase.google.com/):
*   **Android:** `google-services.json` (Place in `android/app/`)
*   **iOS:** `GoogleService-Info.plist` (Place in `ios/Runner/`)

These files contain secret credentials specific to your Firebase project and cannot be generated from the backend code.
