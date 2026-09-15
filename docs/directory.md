# Directory

You'll use feature sliced directories to keep your code clean and easy to navigate.

If functionality (ex. form components, fetch wrapper, services wrapping functionality) can be shared across project, you'll put them in src/core directory
Form elements would be in src/core/form, services would be in src/core/services, components would be in src/core/components, etc.

If functionality (let's say list applied offers) is a feature-specific thing, it'll be in src/feature directory
Creating offer would be in `src/feature/offer/create.ts`, update data would be in `src/feature/offer/update.ts`, delete in `src/feature/offer/delete.ts`, etc.
Naming would be kinda like in CQRS that there is resource, and we add interface to commit it. Mostly single `.ts` files per action.

All interactive functionality should be in React and integrated into Astro components via `client:load`.
