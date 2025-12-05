# Claude Code Project Context

## Development Principles

When implementing new features, always follow existing codebase conventions:

1. **Study existing patterns first** - Before writing new code, examine how similar functionality is already implemented
2. **Follow established testing patterns** - Use the same testing approaches, helpers, and assertion styles found in existing tests
3. **Match code style and structure** - Mimic naming conventions, file organization, and architectural patterns
4. **Reuse existing utilities** - Look for existing helper methods, concerns, and shared code before creating new ones
5. **Maintain consistency** - New code should feel like it belongs in the existing codebase

Example: When testing ActionCable broadcasts, use the existing `captured_broadcasts()` pattern found in other controller tests, not custom mocking approaches.

## Testing

This is a Ruby on Rails application. To run the test suites:

```bash
# Run unit and integration tests (controllers, models, helpers)
bin/rails test

# Run end-to-end browser tests using Selenium with headless Chrome
bin/rails test:system
```

Note: Use `bin/rails` (not `rails`) as this project uses bundler-managed Rails.