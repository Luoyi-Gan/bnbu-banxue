FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm cache clean --force
COPY . .
ENV BNBU_WEB_HOST=0.0.0.0
EXPOSE 4174
CMD ["node", "scripts/local.mjs"]
