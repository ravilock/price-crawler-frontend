FROM node:22-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json vite.config.ts ./
COPY index.html ./index.html
COPY src ./src
RUN npm install && npm run build
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker-entrypoint.d/ /docker-entrypoint.d/
