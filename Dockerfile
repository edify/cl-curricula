FROM node:6.9.1

RUN mkdir -p /usr/share/cl-curricula

COPY . /usr/share/cl-curricula

WORKDIR /usr/share/cl-curricula

RUN chmod +x ./docker-entry.sh

EXPOSE 8081

ENTRYPOINT [ "./docker-entry.sh" ]
