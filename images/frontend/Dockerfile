FROM node:16

WORKDIR /usr/app

# Only copy package files first (better for caching)
COPY package*.json ./

RUN npm install --quiet

# Copy the rest of the app
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
