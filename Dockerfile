FROM node:21-alpine as build

WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM node:21-alpine 

WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm install --only=production
COPY --from=build /app/dist ./dist 
EXPOSE 3000

CMD ["npm", "run", "start:prod"]