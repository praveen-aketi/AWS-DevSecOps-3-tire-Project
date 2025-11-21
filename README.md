# 🛡️ SecurePetStore: AWS DevSecOps 3-Tier Project
## 📌 Current Status
- Project updated for production readiness: Terraform remote state bootstrap (S3 + DynamoDB) added, sensitive values moved to AWS Secrets Manager, CI workflows updated to inject secrets from GitHub Actions. Backend listens on port 8080; frontend serves static assets on 3000.

## 🛠️ Tools & Technologies
- **Backend:** Node.js 18, Express, PostgreSQL, JWT, Bcrypt, Joi, Helmet, Winston, Swagger
- **Frontend:** React 18, React Router v6, Axios, Context API
- **DevOps:** Docker, Docker‑Compose, GitHub Actions, Terraform (IaC), Argo CD (GitOps), Helm
- **Testing:** Jest, Supertest
- **Security:** Helmet, express‑mongo‑sanitize, xss‑clean, hpp, rate‑limit, csurf
- **Observability:** Structured JSON logging, correlation IDs, health‑check endpoints

---

## 📁 Folder Structure

```bash
.
├── .github/workflows/         # CI/CD & security workflows
│   ├── checkov.yml            # Terraform static analysis
│   ├── codeql.yml             # CodeQL static code analysis
│   ├── ecr-push.yaml          # CI pipeline to build and push Docker images
│   ├── sonar.yml              # SonarQube for code quality checks
│   ├── trivy.yml              # Trivy for container vulnerability scanning
│   └── unit-tests.yml         # Run unit tests
├── argocd/
│   ├── argo-sync.yml          # Auto-sync configuration
│   ├── backend-app.yaml       # ArgoCD App CRD for backend
│   └── frontend-app.yaml      # ArgoCD App CRD for frontend
├── backend/
│   ├── Dockerfile
│   ├── app.js
│   ├── app.test.js
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── App.js
│       └── App.test.js
├── charts/                    # Helm charts
│   ├── backend/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   │       ├── backend-deployment.yaml
│   │       ├── backend-service.yaml
│   │       └── backend-ingress.yaml
│   └── frontend/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── frontend-deployment.yaml
│           ├── frontend-service.yaml
│           └── frontend-ingress.yaml
├── infra/terraform/           # Infrastructure as Code using Terraform
│   ├── eks.tf
│   ├── eks_node_group.tf
│   ├── main.tf
│   ├── terraform.tfvars
│   └── variables.tf
├── .gitignore
└── README.md
```

---

## 📊 Architecture Overview

**3-Tier Architecture:**

* **Frontend:** React-based web UI
* **Backend:** Node.js REST API
* **Database:** PostgreSQL (with fallback to mock data for local development)

**Deployment Targets:**

* **Local:** Docker
* **Production:** AWS EKS with ArgoCD + Helm

---

## 🧪 How to Run Locally

### Prerequisites
- Docker
- Node.js and npm
- Git

### Backend (local with Docker Compose)

The backend expects `DB_PASSWORD` to be supplied via environment or a local `.env` file (avoid committing secrets).

Create a `.env` in the repo root with:

```
DB_USER=admin
DB_PASSWORD=yourpassword
DB_NAME=petstoredb
```

Start services with Docker Compose:

```bash
docker-compose up --build
```

The backend will be available at http://localhost:8080 and includes health endpoints:
- GET /health  -> basic liveness
- GET /health/live
- GET /health/ready

### Frontend (local)

```bash
cd frontend
npm install
npm start
```

Frontend served on http://localhost:3000 and expects the API at REACT_APP_API_URL (default: http://localhost:8080/api/v1).

### Local Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Docker Local (optional)

```bash
# Frontend
docker build -t securepetstore-frontend ./frontend
docker run -p 3000:3000 securepetstore-frontend

# Backend
docker build -t securepetstore-backend ./backend
docker run -p 8080:8080 securepetstore-backend
```

---

## 🔐 Terraform remote state & Secrets (bootstrap & CI)

This project uses a remote S3 backend and a DynamoDB table for Terraform state locking. The repository includes bootstrap resources to create the S3 bucket + DynamoDB table, but you must bootstrap and reconfigure the backend before using remote state.

One-time bootstrap (creates remote state resources):

```bash
cd infra/terraform
terraform init
terraform apply
```

Then update `infra/terraform/backend.tf` with the created bucket and table names and run:

```bash
terraform init -reconfigure
```

Supply secrets securely (recommended: GitHub Actions Secrets):

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `DB_PASSWORD` (used to populate Secrets Manager during bootstrap if provided via TF_VAR)
- `BACKEND_IMAGE` and `FRONTEND_IMAGE` (image URIs for Terraform)

The CI workflow `/.github/workflows/ci.yml` is configured to pass `TF_VAR_db_password`, `TF_VAR_backend_image`, and `TF_VAR_frontend_image` from GitHub Secrets to Terraform during plan.

> Important: Do NOT store secrets in `terraform.tfvars` or code. Use GitHub Secrets or the `-var` CLI flag.

---

## 🚀 Deployment (EKS / ArgoCD)

1. Bootstrap infra (see Terraform steps above).
2. Build and push container images to ECR (or a registry) and set `BACKEND_IMAGE`/`FRONTEND_IMAGE` secrets.
3. Configure kubectl for EKS and install ArgoCD as described in `argocd/`.
4. Use the Helm charts in `charts/` (backend frontend) — they include basic probes and resource requests.

---

## 👤 Author

**Praveen Ayyappa**
🔗 GitHub: [@praveen-aketi](https://github.com/praveen-aketi)

---
