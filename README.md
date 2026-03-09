<div align="center">
  <img src="logo.png" alt="OpenHermit" width="200" />

# OpenHermit.js

**Make any website discoverable and actionable by AI agents.**
</div>

OpenHermit automatically injects [WebMCP](https://webmcp.org) attributes into your website's forms and actions, making them instantly discoverable by AI agents like ChatGPT, Claude, and custom AI tools.

Like a hermit crab finding the perfect shell — instant, automatic, perfect.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/%40openhermit%2Fjs.svg)](https://www.npmjs.com/package/@openhermit/js)

## Features

- 🦀 **Automatic WebMCP injection** - Detects forms, calculators, booking widgets
- 🤖 **AI agent tracking** - Know which agents visit and what they do
- 🎯 **Zero configuration** - Works out of the box
- 🔧 **Customizable** - Configure agent prompts and behavior
- 📊 **Real-time analytics** - Dashboard at [openhermit.com](https://www.openhermit.com)
- 🚀 **Lightweight** - 19.7 KB vanilla JavaScript, zero dependencies

## Quick Start

### 1. Get your API key

Sign up at [openhermit.com](https://www.openhermit.com) to get your free API key.

### 2. Add the script to your website

```html
<script
  src="https://cdn.openhermit.com/v1/openhermit.js"
  data-api-key="your-api-key-here"
  async
></script>
```

That's it! Your website is now agent-ready.

## Installation Methods

### CDN (Recommended)

```html
<script
  src="https://cdn.openhermit.com/v1/openhermit.js"
  data-api-key="YOUR_API_KEY"
  async
></script>
```

### NPM

```bash
npm install @openhermit/js
```

```javascript
import OpenHermit from '@openhermit/js';

OpenHermit.init({
  apiKey: 'YOUR_API_KEY',
  apiBase: 'https://www.openhermit.com' // optional
});
```

### Self-Hosted

Download `src/openhermit.js` and host it yourself:

```html
<script
  src="/path/to/openhermit.js"
  data-api-key="YOUR_API_KEY"
  data-api-base="https://your-api.com" // optional
  async
></script>
```

## Configuration

### Script Attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-api-key` | Yes | Your OpenHermit API key |
| `data-api-base` | No | Custom API endpoint (default: `https://www.openhermit.com`) |

### Custom API Base

If you're self-hosting the OpenHermit platform:

```html
<script
  src="https://cdn.openhermit.com/v1/openhermit.js"
  data-api-key="YOUR_API_KEY"
  data-api-base="https://your-custom-api.com"
  async
></script>
```

## What It Does

OpenHermit automatically:

1. **Detects forms** - Contact forms, signups, newsletters, bookings, etc.
2. **Injects WebMCP attributes** - Adds `data-mcp-action`, `data-mcp-description`, `data-mcp-params`
3. **Detects third-party widgets** - Calendly, Typeform, HubSpot, Intercom
4. **Extracts business info** - Phone, email, address from Schema.org or page content
5. **Tracks agent interactions** - Knows when AI agents visit and what they do
6. **Serves manifest** - Provides WebMCP-compliant manifest at `/api/manifest`

## Supported AI Agents

OpenHermit detects and tracks:

- ChatGPT (GPTBot, ChatGPT-User)
- Claude (ClaudeBot, Claude-Web)
- Perplexity (PerplexityBot)
- Google Gemini (Google-Extended)
- Microsoft Copilot
- OpenAI Operator
- Custom agents via user-agent detection

## Examples

### Basic HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <form action="/contact" method="POST">
    <input type="email" name="email" required>
    <textarea name="message" required></textarea>
    <button type="submit">Send</button>
  </form>

  <!-- OpenHermit will automatically detect this form and inject WebMCP attributes -->

  <script
    src="https://cdn.openhermit.com/v1/openhermit.js"
    data-api-key="YOUR_API_KEY"
    async
  ></script>
</body>
</html>
```

### React

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.openhermit.com/v1/openhermit.js';
    script.setAttribute('data-api-key', 'YOUR_API_KEY');
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return (
    <form action="/contact" method="POST">
      <input type="email" name="email" required />
      <textarea name="message" required />
      <button type="submit">Send</button>
    </form>
  );
}
```

### Next.js

```jsx
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
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
```

### WordPress

Add to your theme's `footer.php` or use a plugin like "Insert Headers and Footers":

```html
<script
  src="https://cdn.openhermit.com/v1/openhermit.js"
  data-api-key="YOUR_API_KEY"
  async
></script>
```

## Browser Compatibility

OpenHermit uses vanilla ES5 JavaScript and works on:

- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ IE 11+ (yes, really)
- ✅ Mobile browsers

## Privacy & Security

- **No PII collected** - Only tracks agent interactions, not user data
- **No cookies** - Fully cookieless tracking
- **No external dependencies** - Self-contained script
- **Open source** - Inspect the code yourself
- **Fail-safe** - Never breaks your website (wrapped in try/catch)

## Development

### Build from source

```bash
git clone https://github.com/openhermit/openhermit-js.git
cd openhermit-js
npm install
npm run build
```

### Run tests

```bash
npm test
```

## WebMCP Specification

OpenHermit implements the [WebMCP specification](https://webmcp.org) for AI agent discoverability.

Example injected attributes:

```html
<form
  data-mcp-action="submit_contact_form"
  data-mcp-description="Submit a contact form inquiry to the business"
  data-mcp-params='[{"name":"email","type":"email","required":true},{"name":"message","type":"textarea","required":true}]'
  data-openhermit="true"
>
  ...
</form>
```

## Dashboard & Analytics

Get real-time insights at [openhermit.com](https://www.openhermit.com):

- Which AI agents visit your site
- What forms/actions they interact with
- Conversion rates and success metrics
- Custom agent prompts and behavior controls

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Support

- 📚 [Documentation](https://docs.openhermit.com)
- 🐛 [Report Issues](https://github.com/openhermit/openhermit-js/issues)
- 📧 [Email Support](mailto:support@openhermit.com)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Links

- [Website](https://www.openhermit.com)
- [Documentation](https://docs.openhermit.com)
- [GitHub](https://github.com/openhermit)
- [npm Package](https://www.npmjs.com/package/@openhermit/js)

---

Made with 🦀 by the OpenHermit team
