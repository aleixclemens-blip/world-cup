# Stage 1: Build TypeScript code
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src ./src
RUN npm run build

# Stage 2: Production environment
FROM node:24-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist

# Copiar los datos requeridos para el seeding
COPY data ./data

EXPOSE 7000

CMD ["node", "dist/index.js"]
