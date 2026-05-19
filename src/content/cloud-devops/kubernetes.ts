import type { DiagramConfig } from "@/components/FlowDiagram";

const k8sDiagram: DiagramConfig = {
  width: 760,
  height: 230,
  caption: "Kubernetes request flow: Ingress routes external traffic to a Service, which load-balances across Pods that persist data in a PersistentVolume",
  nodes: [
    { id: "user",    type: "client",       label: "User",       x: 60,  y: 115 },
    { id: "ingress", type: "loadbalancer", label: "Ingress",    x: 210, y: 115 },
    { id: "svc",     type: "proxy",        label: "Service",    x: 390, y: 115 },
    { id: "pod1",    type: "server",       label: "Pod 1",      x: 560, y: 45  },
    { id: "pod2",    type: "server",       label: "Pod 2",      x: 560, y: 115 },
    { id: "pod3",    type: "server",       label: "Pod 3",      x: 560, y: 190 },
    { id: "pv",      type: "database",     label: "Persistent\nVolume", x: 700, y: 115 },
  ],
  edges: [
    { from: "user",    to: "ingress", label: "HTTPS" },
    { from: "ingress", to: "svc",     label: "route" },
    { from: "svc",     to: "pod1" },
    { from: "svc",     to: "pod2" },
    { from: "svc",     to: "pod3" },
    { from: "pod1",    to: "pv",      dashed: true },
    { from: "pod2",    to: "pv",      dashed: true },
    { from: "pod3",    to: "pv",      dashed: true },
  ],
};

export const content = {
  title: "Kubernetes Fundamentals",
  sections: [
    {
      heading: "Why Kubernetes",
      diagram: k8sDiagram,
      body: `Docker gives you containers. But in production you need answers to harder questions: what happens when a container crashes? How do you deploy a new version without downtime? How do you scale from 2 to 20 replicas under load, then back to 2 when traffic drops?

**Kubernetes** (K8s) is an open-source container orchestrator that answers these questions. It runs your containers across a cluster of machines, continuously reconciling the actual state of the cluster with your desired state. If a Pod crashes, K8s restarts it. If a node dies, K8s reschedules Pods to healthy nodes. If CPU usage spikes, the Horizontal Pod Autoscaler adds replicas.

The **control plane** is the brain: the API server accepts declarative YAML configs, the scheduler decides which node a Pod runs on, and the controller manager runs reconciliation loops. **Worker nodes** are the muscle: each runs \`kubelet\` (communicates with the API server) and a container runtime (containerd). \`kubectl\` is your CLI to the API server.`,
      items: [
        "`Control plane` — API server, etcd (state store), scheduler, controller manager",
        "`Worker node` — kubelet, kube-proxy, container runtime (containerd)",
        "`kubectl` — CLI that sends declarative YAML to the API server",
        "`Namespace` — virtual cluster within a cluster; isolates resources by team or environment",
      ],
    },
    {
      heading: "Core Objects",
      body: `Kubernetes is built around a small set of objects that compose together. You declare the desired state of each object in YAML and apply it — K8s does the rest.

A **Pod** is the smallest deployable unit: one or more containers that share a network namespace and volume mounts. Pods are ephemeral — don't address them directly. A **Deployment** manages a set of identical Pods (a ReplicaSet), handles rolling updates, and ensures the desired replica count is always running. A **Service** gives a stable DNS name and virtual IP to a group of Pods — traffic is load-balanced across all matching Pods. An **Ingress** is an HTTP/HTTPS router that maps host names and URL paths to Services, typically backed by Nginx or a cloud load balancer.`,
      code: `# deployment.yaml — run 3 replicas of your app
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: ghcr.io/myorg/myapp:1.4.0
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            cpu: "100m"      # 0.1 CPU core guaranteed
            memory: "128Mi"
          limits:
            cpu: "500m"      # max 0.5 CPU core
            memory: "256Mi"
        readinessProbe:
          httpGet:
            path: /healthz
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10`,
    },
    {
      heading: "Deployments & Services",
      body: `A **Service** selects Pods using label selectors and exposes them under a stable DNS name. \`ClusterIP\` (default) is only reachable within the cluster. \`NodePort\` exposes the service on a port of every node. \`LoadBalancer\` provisions a cloud load balancer (AWS ALB, GCP GLBL) automatically — the easiest way to expose a service to the internet without an Ingress controller.

Rolling updates are built into Deployments. When you change the image tag, K8s gradually replaces old Pods with new ones, waiting for each new Pod to pass its readiness probe before moving on. This ensures zero-downtime deploys. Set \`maxUnavailable: 0\` and \`maxSurge: 1\` for a conservative roll-out that always keeps full capacity.`,
      code: `# service.yaml — stable ClusterIP for the web Deployment
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: production
spec:
  selector:
    app: web          # routes to all Pods with this label
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP

---
# ingress.yaml — route myapp.example.com → web Service
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
  tls:
  - hosts: [myapp.example.com]
    secretName: web-tls`,
    },
    {
      heading: "kubectl Basics",
      body: `\`kubectl\` is your primary interface to a Kubernetes cluster. It reads \`~/.kube/config\` to know which cluster and credentials to use. Managed clusters (EKS, GKE, AKS) provide a command to generate this config automatically. The \`apply\` / \`delete\` workflow is idempotent — you can safely re-run \`kubectl apply\` to update a resource.

Understanding how to read Pod logs and exec into containers is essential for debugging. \`kubectl describe\` shows events and resource limits that are often the first clue when a Pod fails to start (\`OOMKilled\`, \`ImagePullBackOff\`, \`CrashLoopBackOff\`).`,
      code: `# Context (cluster) management
kubectl config get-contexts
kubectl config use-context prod-cluster

# Apply / delete declarative YAML
kubectl apply -f deployment.yaml
kubectl apply -f k8s/                # apply all YAML files in a directory
kubectl delete -f deployment.yaml

# Inspect resources
kubectl get pods -n production
kubectl get pods -n production -w    # watch for changes
kubectl describe pod web-7d4f8b-xz9 -n production
kubectl get events -n production --sort-by=.lastTimestamp

# Logs and exec
kubectl logs web-7d4f8b-xz9 -n production
kubectl logs -l app=web -n production --tail=100   # all web pods
kubectl exec -it web-7d4f8b-xz9 -n production -- bash

# Rolling update: change image tag
kubectl set image deployment/web web=ghcr.io/myorg/myapp:1.5.0 -n production
kubectl rollout status deployment/web -n production
kubectl rollout undo deployment/web -n production   # rollback`,
    },
  ],
};
