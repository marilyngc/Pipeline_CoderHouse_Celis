##### Etapa 1: dependencias de producción #####
FROM node:22-alpine AS deps
WORKDIR /app
COPY app/package*.json ./
RUN npm install --omit=dev


#### Etapa 2: Testeo #####
FROM node:22-alpine AS build

WORKDIR /app

COPY app/package*.json ./
RUN npm install 
COPY app/src ./src
COPY app/test ./test
RUN npm run build

#### Etapa 3: Produccion ####
FROM node:22-alpine AS final
WORKDIR /app

COPY --from=build /tmp/build-proof/tests-passed /tmp/build-proof/tests-passed

COPY --from=deps /app/node_modules ./node_modules
COPY app/package*.json ./
COPY app/src ./src

USER node

EXPOSE 3000

CMD ["node", "src/index.js"]
