# Contributing to Enterprise ChatGPT System

First off, thank you for considering contributing to this project! 🎉

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if applicable**
- **Include your environment details** (OS, Python version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternative solutions you've considered**

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

#### Pull Request Guidelines

- Follow the existing code style
- Update documentation as needed
- Add tests for new features
- Ensure all tests pass
- Update the README.md if needed

## Code Style

### Python (Backend)
- Follow PEP 8 style guide
- Use type hints where applicable
- Write docstrings for functions and classes
- Keep functions focused and small

### JavaScript (Frontend)
- Use ES6+ features
- Follow consistent naming conventions
- Comment complex logic
- Keep functions pure when possible

### CSS
- Use meaningful class names
- Follow BEM naming convention where applicable
- Keep specificity low
- Use CSS variables for theming

## Development Setup

1. Clone the repository
2. Install dependencies: `pip install -r backend/requirements.txt`
3. Set up environment variables (copy `.env.example` to `.env`)
4. Run tests: `pytest`
5. Start development server: `uvicorn main:app --reload`

## Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for high code coverage
- Test edge cases

## Documentation

- Update README.md for user-facing changes
- Update inline documentation for code changes
- Add examples for new features
- Keep documentation clear and concise

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Unacceptable Behavior

- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🚀
