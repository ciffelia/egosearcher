FROM --platform=$BUILDPLATFORM node:18.14.1-bullseye-slim as deps-downloader

# Switch to unpriviledged user
RUN useradd --create-home --user-group egosearcher
USER egosearcher
WORKDIR /home/egosearcher/egosearcher

ENV NODE_ENV production

COPY --chown=egosearcher:egosearcher . .

RUN yarn install --immutable --mode=skip-build

FROM node:18.14.1-bullseye-slim

# Switch to unpriviledged user
RUN useradd --create-home --user-group egosearcher
USER egosearcher
WORKDIR /home/egosearcher/egosearcher

ENV NODE_ENV production
ENV EGOSEARCHER_CONFIG /config/config.js

COPY --chown=egosearcher:egosearcher . .
COPY --from=deps-downloader --chown=egosearcher:egosearcher /home/egosearcher/egosearcher/.yarn/cache ./.yarn/cache
COPY --from=deps-downloader --chown=egosearcher:egosearcher /home/egosearcher/egosearcher/.pnp.* ./

RUN yarn install --immutable && \
    yarn cache clean --mirror

ENTRYPOINT ["yarn", "run", "start"]
