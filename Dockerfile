FROM node:18.12.1-bullseye-slim

# Switch to non-root user
RUN useradd --create-home --user-group egosearcher
USER egosearcher
WORKDIR /home/egosearcher

ENV NODE_ENV production
ENV EGOSEARCHER_CONFIG /config/config.js

COPY --chown=egosearcher:egosearcher . .

RUN yarn install --immutable && \
    yarn cache clean --mirror

ENTRYPOINT ["yarn", "run", "start"]
