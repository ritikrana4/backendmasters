export const content = {
  title: "Volumes & Persistent Storage",
  sections: [
    {
      heading: "Why Volumes?",
      body: "Container filesystems are **ephemeral** — the writable container layer is destroyed when the container is removed. If your database writes data inside a container and you `docker rm` it, the data is gone.\n\n**Volumes** solve this by mounting a persistent storage location into the container. Docker supports three types: **named volumes** (managed by Docker, stored in `/var/lib/docker/volumes`), **bind mounts** (a path from the host filesystem), and **tmpfs mounts** (in-memory, never written to disk).",
      items: [
        "`Named volume` — Docker manages the storage location. Portable, shareable between containers, survives container removal.",
        "`Bind mount` — mounts a specific host path directly. Used in development to mount source code into the container so changes are immediate.",
        "`tmpfs mount` — stored in the host's RAM only. Data is lost when the container stops. Used for sensitive data or high-speed temp storage.",
      ],
    },
    {
      heading: "Named Volumes",
      body: "Named volumes are the recommended storage mechanism for production containers. Docker manages the directory on the host, handles backups, and lets you attach the volume to a new container (e.g., after upgrading your database image).\n\nVolumes can be pre-populated: if you mount an empty named volume into a container directory that already has data, Docker copies the existing directory contents into the volume on first use.",
      code: `# Create and use a named volume
docker volume create postgres-data

docker run -d \\
  --name db \\
  -v postgres-data:/var/lib/postgresql/data \\
  -e POSTGRES_PASSWORD=secret \\
  postgres:16

# Inspect the volume
docker volume inspect postgres-data
# Shows: Mountpoint = /var/lib/docker/volumes/postgres-data/_data

# Upgrade database — data persists because the volume is reused
docker stop db && docker rm db
docker run -d --name db -v postgres-data:/var/lib/postgresql/data postgres:16.1

# Backup a volume
docker run --rm -v postgres-data:/data -v $(pwd):/backup \\
  alpine tar czf /backup/postgres-backup.tar.gz /data`,
      items: [
        "`docker volume ls` — list all volumes.",
        "`docker volume prune` — remove all unnamed (anonymous) volumes not attached to any container.",
        "`docker volume rm <name>` — remove a specific named volume. Fails if a container is using it.",
        "Volumes persist until explicitly removed — `docker rm` of a container does NOT remove its volumes unless you add `-v`.",
      ],
    },
    {
      heading: "Bind Mounts for Development",
      body: "**Bind mounts** mount a directory from your host machine into the container. This is the standard pattern for local development: mount your source code into the container, so edits you make on your laptop are immediately visible inside the running container — no rebuild needed.\n\nBind mounts are not recommended for production: they couple the container to the host's filesystem layout and create permission issues. Use named volumes in production.",
      code: `# Mount current directory into container (development)
docker run -it \\
  -v $(pwd):/app \\
  -v /app/node_modules \\    # anonymous volume — prevents host from overwriting container's node_modules
  -p 3000:3000 \\
  node:20-alpine \\
  npm run dev

# In docker-compose.yml — development workflow
services:
  api:
    image: my-api:dev
    volumes:
      - ./src:/app/src           # bind mount: host src/ → container /app/src
      - deps:/app/node_modules   # named volume: isolates node_modules from host
    ports:
      - "3000:3000"
    command: npm run dev

volumes:
  deps:`,
      items: [
        "The `node_modules` anonymous volume trick prevents Docker from using the host's `node_modules` (which may have different platform binaries).",
        "On macOS, bind mounts can be slow due to filesystem translation. `VirtioFS` (Docker Desktop 4.6+) dramatically improves performance.",
        "Bind mounts bypass Docker's snapshot mechanism — changes are live but not tracked as image layers.",
      ],
    },
    {
      heading: "Volume Drivers & Cloud Storage",
      body: "The default volume driver (`local`) stores volumes on the Docker host's disk. **Volume drivers** extend this to network storage: mount an EFS filesystem, NFS share, or cloud block storage as a Docker volume. This is how stateful containers share data across multiple hosts in a cluster.\n\nFor AWS, the **EFS (Elastic File System)** volume driver is common with ECS and Kubernetes — it provides shared, persistent NFS storage that multiple containers on different hosts can mount simultaneously.",
      code: `# Use the local driver with custom options (NFS mount)
docker volume create \\
  --driver local \\
  --opt type=nfs \\
  --opt o=addr=10.0.0.10,rw \\
  --opt device=:/exports/data \\
  nfs-data

# ECS task definition with EFS volume
{
  "volumes": [{
    "name": "efs-data",
    "efsVolumeConfiguration": {
      "fileSystemId": "fs-12345678",
      "rootDirectory": "/data"
    }
  }],
  "containerDefinitions": [{
    "name": "api",
    "mountPoints": [{
      "sourceVolume": "efs-data",
      "containerPath": "/app/uploads",
      "readOnly": false
    }]
  }]
}`,
      items: [
        "`EFS` — AWS Elastic File System. NFS-based, shared across multiple AZs and multiple containers simultaneously. Used for upload directories, shared config.",
        "`EBS` — block storage, attached to one EC2 instance at a time. Lower latency than EFS but not shareable.",
        "Stateful containers are complex in production — prefer externalising state to managed services (RDS, S3, ElastiCache) over mounting volumes.",
      ],
    },
  ],
};
