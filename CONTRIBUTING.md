# Contributing to The Minotaur's Gates

Thank you for considering contributing to this project! Please take a moment to review this guide to make the contribution process smooth and effective.

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report, please check if it has already been reported by searching the issue tracker. When you are creating a bug report, please include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs. actual behavior
- Screenshots or recordings if applicable
- Your environment (browser, OS, etc.)

### Suggesting Features

Feature requests are welcome! Please provide:

- A clear description of the feature and its purpose
- Use cases that would benefit from this feature
- Any potential implementation considerations

### Pull Requests

We welcome pull requests! Here's how to get started:

1. Fork the repository
2. Create a new branch from `main`: `git checkout -b feature/your-feature-name`
3. Make your changes, following the code style guidelines below
4. Add or update tests as necessary
5. Ensure all tests pass and linting is clean
6. Commit your changes: `git commit -m "Add: brief description of changes"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a pull request against the `main` branch

## Code Style Guidelines

### JavaScript/React

- Use ES6+ features (arrow functions, destructuring, etc.)
- Prefer functional components with hooks over class components
- Use meaningful, descriptive names for variables and functions
- Keep components focused and small (aim for <200 lines when possible)
- Add JSDoc comments for complex functions
- Use early returns to reduce nesting
- Prefer `const` and `let` over `var`

### CSS/Tailwind

- Use utility-first approach with Tailwind classes
- Extract repeated patterns into component classes when appropriate
- Use semantic HTML elements where possible
- Maintain responsive design considerations

### Testing

- Write unit tests for business logic and utility functions
- Test edge cases and error conditions
- Keep tests focused and independent
- Use descriptive test names that explain what is being tested

## Development Process

### Setting Up Your Environment

```bash
# Clone your fork
git clone https://github.com/your-username/puzzle.git

# Navigate to project directory
cd puzzle

# Install dependencies
npm install

# Start development server
npm run dev
```

### Making Changes

1. Create a feature branch for your work
2. Implement your changes following the guidelines above
3. Write or update tests as needed
4. Run the test suite: `npm run test`
5. Run the linter: `npm run lint`
6. Ensure the application runs correctly: `npm run dev`

### Submitting Changes

1. Make sure your branch is up to date with `main`: `git pull upstream main`
2. Resolve any merge conflicts
3. Run tests and linter one final time
4. Push your changes to your fork
5. Open a pull request with a clear title and description

## Review Process

All pull requests will be reviewed by project maintainers. The review process includes:

1. Initial review for completeness and adherence to guidelines
2. Code quality and maintainability assessment
3. Testing coverage verification
4. Feedback and requested changes (if any)
5. Final approval and merging

Please be responsive to reviewer feedback to help expedite the process.

## Community

Please follow our code of conduct in all interactions with the project community.

Thank you again for your contribution!