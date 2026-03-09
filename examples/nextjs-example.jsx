/**
 * OpenHermit Next.js Example
 *
 * Add OpenHermit to your Next.js application
 */

// ─────────────────────────────────────────────────────────────────────────────
// Option 1: Add to Root Layout (Recommended)
// ─────────────────────────────────────────────────────────────────────────────

// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* OpenHermit Script */}
        <script
          src="https://cdn.openhermit.com/v1/openhermit.js"
          data-api-key={process.env.NEXT_PUBLIC_OPENHERMIT_KEY}
          async
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Option 2: Using next/script Component
// ─────────────────────────────────────────────────────────────────────────────

import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* OpenHermit Script */}
        <Script
          src="https://cdn.openhermit.com/v1/openhermit.js"
          data-api-key={process.env.NEXT_PUBLIC_OPENHERMIT_KEY}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Option 3: Client Component with useEffect
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useEffect } from 'react';

export function OpenHermitProvider({ children }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.openhermit.com/v1/openhermit.js';
    script.setAttribute('data-api-key', process.env.NEXT_PUBLIC_OPENHERMIT_KEY);
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return <>{children}</>;
}

// Then wrap your app:
// app/layout.js
import { OpenHermitProvider } from './components/OpenHermitProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <OpenHermitProvider>
          {children}
        </OpenHermitProvider>
      </body>
    </html>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Example Contact Form Page
// ─────────────────────────────────────────────────────────────────────────────

// app/contact/page.js
export default function ContactPage() {
  async function handleSubmit(formData) {
    'use server';

    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Your form handling logic
    console.log({ name, email, message });

    // OpenHermit automatically tracks agent interactions
  }

  return (
    <div>
      <h1>Contact Us</h1>
      <form action={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" required />

        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows="5" required />

        <button type="submit">Send Message</button>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Environment Variables
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create .env.local file:
 *
 * NEXT_PUBLIC_OPENHERMIT_KEY=your_api_key_here
 *
 * The NEXT_PUBLIC_ prefix makes it available in the browser.
 */

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Support
// ─────────────────────────────────────────────────────────────────────────────

/**
 * If using TypeScript, install types:
 *
 * npm install --save-dev @openhermit/js
 *
 * Then in your tsconfig.json:
 * {
 *   "compilerOptions": {
 *     "types": ["@openhermit/js"]
 *   }
 * }
 */
