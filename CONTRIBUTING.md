# Contributing to EVA AI Music

Thank you for your interest in contributing to **EVA AI Music**! We welcome contributions from developers of all skill levels.

---

## 📋 Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please ensure respectful and inclusive communication at all times.

---

## 🛠️ How to Contribute

### 1. Reporting Issues
- Search existing issues before submitting a new bug report.
- Include OS details, browser versions, exact console logs, and step-by-step reproduction steps.

### 2. Submitting Pull Requests
1. Fork the repository and create a feature branch (`feature/amazing-feature`).
2. Run TypeScript checks to verify zero build errors:
   ```bash
   cd eva-music-app && npx tsc --noEmit
   cd ../eva-music-backend && npx tsc --noEmit
   ```
3. Ensure all changes adhere to strict type-safety, clean component boundaries, and professional styling conventions.
4. Open a detailed Pull Request describing your changes.

---

## 🎨 Code Style Guidelines

- **TypeScript**: Strict type checking. Avoid `any` types where possible.
- **Styling**: TailwindCSS for component styling with Gen Z dynamic gradients and HSL color palettes.
- **Components**: Functional React components using hooks. Keep state localized where possible.
- **Async Safety**: Always guard async audio requests against out-of-order race conditions using request ID counters or AbortControllers.

---

## 📜 License

By contributing to EVA AI Music, you agree that your contributions will be licensed under the MIT License.
