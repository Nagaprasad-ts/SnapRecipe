# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Environment Setup

This project uses Firebase for authentication and database services. You need to configure your Firebase project credentials.

1.  **Create a Firebase Project:**
    If you haven't already, create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).

2.  **Get Firebase Configuration:**
    In your Firebase project console, go to Project settings (click the gear icon).
    Under the "General" tab, scroll down to "Your apps".
    If you don't have a web app, click the web icon (`</>`) to "Add app" and follow the instructions to register your web app.
    Once your web app is registered, Firebase will provide you with a `firebaseConfig` object. It looks like this:
    ```javascript
    const firebaseConfig = {
      apiKey: "AIzaSy...",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:abcdef123456",
      measurementId: "G-ABCDEFGHIJ" // Optional
    };
    ```
    You will need these values.

3.  **Create `.env` file:**
    This project uses a `.env` file to store environment variables.
    If it doesn't exist, copy the `.env.example` file to a new file named `.env` in the root of the project:
    ```bash
    cp .env.example .env
    ```

4.  **Populate `.env` file:**
    Open the newly created `.env` file and fill in the values from your Firebase project's configuration:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
    ```
    Replace `YOUR_API_KEY`, `YOUR_AUTH_DOMAIN`, etc., with the actual values from your Firebase project. The example values in the `firebaseConfig` object in step 2 correspond to these environment variable names.

    **Important:** The `NEXT_PUBLIC_` prefix is necessary for Next.js to expose these variables to the browser-side client code.

5.  **Restart your development server:**
    If your development server (`npm run dev` or `yarn dev`) was running, you'll need to restart it for the new environment variables to be loaded.

Now your application should be able to connect to Firebase.
