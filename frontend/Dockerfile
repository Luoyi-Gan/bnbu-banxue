FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY src ./src
COPY shared ./shared
COPY public ./public
COPY index.html vite.config.ts tsconfig.app.json ./
ARG VITE_SPORTS_STUDENT_URL
ARG VITE_SPORTS_TEACHER_URL
RUN npm run build

FROM nginx:stable-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
