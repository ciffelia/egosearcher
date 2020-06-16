FROM node:12.18.0-alpine

# Switch to non-root user
RUN adduser -D egosearcher
USER egosearcher
WORKDIR /home/egosearcher

ENV NODE_ENV production

COPY --chown=egosearcher:egosearcher ./package.json ./yarn.lock ./

RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

COPY --chown=egosearcher:egosearcher . .

ENTRYPOINT yarn run start
