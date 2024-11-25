FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps --save-prod

COPY . .

ARG VITE_BACKEND_URL=http://localhost:3000
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_BACKEND_ENDPOINT=/api
ENV VITE_PROJECT_NAME=MIGRATOR
ENV VITE_LANGUAGE='en'

RUN npm run build

## Stage 2: Run Build Application
FROM nginx:stable-alpine AS deploy

WORKDIR /app

COPY --from=build /app/nginx.conf /etc/nginx/conf.d
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/entrypoint.sh /app/entrypoint.sh
RUN rm /etc/nginx/conf.d/default.conf

RUN chmod +x /app/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["./entrypoint.sh"]
