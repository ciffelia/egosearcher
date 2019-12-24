FROM node:12-alpine

ENV NODE_ENV production

ADD package.json yarn.lock /root/EgoSearcher/
WORKDIR /root/EgoSearcher
RUN yarn --pure-lockfile && yarn cache clean

ADD . /root/EgoSearcher

CMD ["node", "src/index.js"]
