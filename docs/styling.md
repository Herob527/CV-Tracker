# Styling

You'll use [Tailwind](https://tailwindcss.com/) for styling

You'll prefer using color primary for colours styling. This is defined in the Tailwind config via `global.css`.

For icons, you'll icons from iconify

Example usage of icon

<span class="icon-[devicon--git] size-4" />

The style will use rounded-sm, so rounding will be small.

In case of destructive things like update or delete, you'll use modal to confirm action

Modal itself will have backdrop filter for bluring and small rounding with shadow and allow canceling and confirmation.

Pagination should display 10 items per page

Pagination component by itself should show first and last page if there are more than one page.
Current page will display itself, and its surrounding pages. A constant determines how many neighbouring pages are shown around the current page (use this to fine-tune).
Further there is ellipsis.
If neighbouring pages are close to beginning or end, skip the ellipsis for given side.
