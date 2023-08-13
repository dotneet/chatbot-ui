# ---- Base Node ----
FROM node:19-alpine AS base
WORKDIR /app
COPY ./webapp/package*.json ./

# ---- Dependencies ----
FROM base AS dependencies
RUN npm ci

FROM dependencies as development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---- Build ----
FROM dependencies AS build
COPY . .
RUN npm run build

# ---- Production ----
FROM node:19-alpine AS production
WORKDIR /app
COPY --from=dependencies /app/node_modules ./webapp/node_modules
COPY --from=build /app/.next ./webapp/.next
COPY --from=build /app/public ./webapp/public
COPY --from=build /app/package*.json ./webapp
COPY --from=build /app/next.config.js ./webapp/next.config.js
COPY --from=build /app/next-i18next.config.js ./webapp/next-i18next.config.js

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
