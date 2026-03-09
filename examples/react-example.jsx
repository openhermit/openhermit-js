import { useEffect } from 'react';

/**
 * OpenHermit React Example
 *
 * This component demonstrates how to integrate OpenHermit
 * into a React application.
 */

function ContactForm() {
  useEffect(() => {
    // Load OpenHermit script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.openhermit.com/v1/openhermit.js';
    script.setAttribute('data-api-key', process.env.REACT_APP_OPENHERMIT_KEY || 'YOUR_API_KEY');
    script.async = true;

    document.head.appendChild(script);

    // Cleanup
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log('Form submitted:', Object.fromEntries(formData));

    // Your form submission logic here
    // OpenHermit will automatically track agent interactions
  };

  return (
    <div className="contact-form">
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
          />
        </div>

        <div>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            required
          />
        </div>

        <button type="submit">Send Message</button>
      </form>
    </div>
  );
}

export default ContactForm;

/**
 * Usage in your app:
 *
 * import ContactForm from './components/ContactForm';
 *
 * function App() {
 *   return (
 *     <div>
 *       <h1>My Website</h1>
 *       <ContactForm />
 *     </div>
 *   );
 * }
 *
 * Environment variables:
 * Create .env file with:
 * REACT_APP_OPENHERMIT_KEY=your_api_key_here
 */
