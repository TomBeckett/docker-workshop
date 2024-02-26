# LAB 3: Docker Compose

## Project structure:

```bash
.
├── docker-compose.yaml
└── nodejs
    ├── Dockerfile
    ├── index.js
    └── package.json
```

Take a look around the project structure.

## Deploy with docker compose

The compose file defines an application with two services - a nodejs frontend and a postgres db.

When deploying the application, docker compose will expose port 8080 to 8080 of the host. No other ports will be accessible.

> Make sure port 8080 on the host is not already being in use.

```bash
# Start services
docker compose up -d
```

## Clear up

```bash
# Shutdown services
docker compose down

# Remove unused images
docker image prune -a
```
