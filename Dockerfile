FROM node:16
WORKDIR /src/app
COPY package*.json /src/app/
RUN npm install
COPY . /src/app/
EXPOSE 80
CMD ["npm", "start"]