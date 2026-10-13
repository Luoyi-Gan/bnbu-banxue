FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY backend ./backend
COPY shared ./shared
RUN node backend/build.mjs

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production BNBU_API_HOST=0.0.0.0 BNBU_API_PORT=4175 BNBU_DATABASE=/app/data/bnbu.sqlite
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=build /app/backend/dist ./backend/dist
RUN mkdir /app/data && chown node:node /app/data
USER node
EXPOSE 4175
CMD ["node", "backend/dist/main.mjs"]
