FROM node:14-alpine

# Switch to non-root user
RUN adduser -D egosearcher
USER egosearcher
WORKDIR /home/egosearcher

ENV NODE_ENV production

COPY --chown=egosearcher:egosearcher . .

RUN yarn install --immutable && \
    yarn cache clean --mirror

ENTRYPOINT ["yarn", "run", "start"]
