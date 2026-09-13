FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=
ARG VITE_WEATHER_API_BASE_URL=
ARG VITE_KAKAO_JS_KEY=

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_WEATHER_API_BASE_URL=${VITE_WEATHER_API_BASE_URL}
ENV VITE_KAKAO_JS_KEY=${VITE_KAKAO_JS_KEY}

RUN npm run build

FROM nginx:1.29-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --output-document=/dev/null http://127.0.0.1/ || exit 1
