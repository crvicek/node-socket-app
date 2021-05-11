FROM node:16

RUN echo "Europe/Amsterdam" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

RUN apt-get update && apt-get install -y --fix-missing git build-essential wget curl vim nano

ENV TERM xterm

COPY . /app

WORKDIR /app

CMD ["npm", "start"]
