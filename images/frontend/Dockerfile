FROM node:20-alpine

WORKDIR /usr/app

# Only copy package files first (better for caching)
COPY package*.json ./

RUN npm install --quiet  --legacy-peer-deps

# Copy the rest of the app
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
