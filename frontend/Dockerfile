# deps
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# build
FROM node:18-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# If you use envs at build time, set them with --build-arg or ENV here
RUN npm run build

# production runner (lean)
FROM node:18-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
# Copy only what's needed to run
COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/next.config.* ./
COPY --from=build /app/tsconfig.json ./tsconfig.json

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:3000/ || exit 1
CMD ["npm","run","start"]