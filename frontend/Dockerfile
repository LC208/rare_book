FROM node:18-alpine AS builder

WORKDIR /frontend

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build --prod

FROM nginx:stable-alpine

COPY --from=builder /frontend/dist/frontend/* /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]