FROM mhart/alpine-node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies and add source files
COPY package.json yarn.lock tsconfig.json ./
COPY src/ ./src 
RUN yarn install && yarn build && rm -f dist/*.map

# Second stage
FROM mhart/alpine-node:latest

WORKDIR /usr/src/app

# Copy artifacts
COPY --from=0 /usr/src/app/dist/ ./
COPY --from=0 /usr/src/app/node_modules ./node_modules
COPY env.json ./

RUN addgroup -S app -g 50000 && \
    adduser -S -g app -u 50000 app && \
    mkdir /data && chown app:app /data/

USER app

ENTRYPOINT [ "node", "server.js" ]
