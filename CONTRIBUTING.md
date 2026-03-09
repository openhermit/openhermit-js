# Contributing to OpenHermit.js

Thank you for your interest in contributing to OpenHermit! 🦀

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment info
- Code sample if possible

### Suggesting Features

We welcome feature suggestions! Please open an issue with:
- Use case description
- Proposed solution
- Alternative approaches considered
- Any examples or mockups

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** with clear, descriptive commits
3. **Test your changes** - ensure the script still works
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description

### Code Style

- Use vanilla ES5 JavaScript (no transpiling needed)
- Keep the script dependency-free
- Follow existing code style
- Add comments for complex logic
- Keep it lightweight - every byte counts!

### Testing Checklist

Before submitting a PR, test that:
- [ ] Script loads without errors
- [ ] Forms are detected correctly
- [ ] WebMCP attributes are injected
- [ ] No console errors in Chrome, Firefox, Safari
- [ ] Works on mobile browsers
- [ ] Doesn't break the host page (fail-safe)

### Development Setup

```bash
git clone https://github.com/openhermit/openhermit-js.git
cd openhermit-js
npm install
```

### Testing Locally

1. Open `examples/basic.html` in your browser
2. Add your API key to the script tag
3. Open DevTools and inspect forms
4. Check for `data-mcp-*` attributes

### Questions?

Open a discussion on GitHub or email support@openhermit.com.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- No harassment or discrimination

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for making OpenHermit better! 🙏
