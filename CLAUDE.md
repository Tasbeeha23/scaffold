@AGENTS.md
# Scaffold

## Project

Scaffold is an AI-powered tool that turns a vague idea into a structured,
step-by-step execution roadmap.

## Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS
- Anthropic SDK (Claude API)
- Zod for schema validation
- React Flow for roadmap visualization
- react-hook-form for forms
- Vitest and Testing Library for tests

## Conventions

- Use the Conventional Commits format for every commit.
- Place components in `/components`.
- Place shared logic in `/lib`.
- Place types in `/types`.
- Place tests in `__tests__`.

## Rules

- Use `react-hook-form` and Zod for forms; never use uncontrolled inputs.
- Settings and form UI must use native form elements with associated labels, not button-based custom controls.
- Explicitly implement every field required by a specification; do not silently omit fields.
- Do not ship a feature without a corresponding test file in the same commit.
- Validate AI-generated content from the Claude API against a Zod schema before using it in the UI, and provide a fallback or error state for invalid responses.
