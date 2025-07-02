FROM node:23
WORKDIR /opt/lobbyregister
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ENV ORIGIN="https://nationaallobbyregister.nl"
COPY ./ ./
RUN npm install
RUN npm run build
CMD [ "node", "build" ]