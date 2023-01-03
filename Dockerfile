FROM --platform=$BUILDPLATFORM node:18.12.1-bullseye-slim as builder

# Switch to unpriviledged user
RUN useradd --create-home --user-group egosearcher
USER egosearcher
WORKDIR /home/egosearcher/egosearcher

ENV NODE_ENV production

COPY --chown=egosearcher:egosearcher . .

RUN yarn install --immutable

FROM node:18.12.1-bullseye-slim

# Switch to unpriviledged user
RUN useradd --create-home --user-group egosearcher
USER egosearcher
WORKDIR /home/egosearcher/egosearcher

ENV NODE_ENV production
ENV EGOSEARCHER_CONFIG /config/config.js

COPY --from=builder --chown=egosearcher:egosearcher . .

RUN yarn install --immutable && \
    yarn cache clean --mirror

ENTRYPOINT ["yarn", "run", "start"]
