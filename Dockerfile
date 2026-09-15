FROM oven/bun:1.3.14-debian AS base

WORKDIR /app

COPY package.json /app/package.json
COPY bun.lock /app/bun.lock

RUN --mount=type=cache,target=/root/.bun/install/cache  bun install --frozen-lockfile

FROM base AS dev

EXPOSE 4321

COPY . /app

CMD ["bun","run", "dev", "--","--host"]

FROM dev AS build

RUN bun run build

# TODO: Replace with other SSR capable
CMD ["bun", "run", "preview", "--","--host"]

