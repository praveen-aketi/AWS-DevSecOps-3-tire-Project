# SecurePetStore: End-to-End AWS DevSecOps Project (3-Tier Architecture)

## Project Overview

SecurePetStore is a secure, production-ready, full-stack 3-tier application deployed on Amazon EKS using a complete DevSecOps pipeline. It includes a React-based frontend, a Node.js (Express) backend, PostgreSQL as the database, and various security scanning, testing, and deployment stages.

---

## Project Structure

```bash
AWS-DevSecOps-3-tire-Project/
├── backend/                    # Node.js + Express backend API
├── frontend/                   # React frontend
├── infra/terraform/            # Terraform code for EKS & supporting infra
├── charts/                     # Helm charts for backend and frontend
├── argocd/                     # Argo CD app definitions
└── .github/workflows/          # GitHub Actions CI/CD pipelines
```

---

## Technology Stack

| Layer            | Tech Stack                              |
| ---------------- | --------------------------------------- |
| Frontend         | React.js                                |
| Backend          | Node.js (Express)                       |
| Database         | PostgreSQL                              |
| Containerization | Docker                                  |
| Orchestration    | Amazon EKS (Elastic Kubernetes Service) |
| IaC              | Terraform                               |
| CI/CD            | GitHub Actions + Argo CD                |
| Helm             | Kubernetes Package Management           |
| Security         | Trivy, Checkov, CodeQL, SonarCloud      |

---

## Prerequisites

* AWS CLI & IAM configured
* kubectl configured
* Terraform installed
* Docker installed
* Node.js and npm (for local testing)
* Argo CD running on EKS

---

## How to Run Locally (Development Testing)

### 1. **Backend**

```bash
cd backend
npm install
npm test            # Run unit tests
npm start           # Starts server on port 3000
```

### 2. **Frontend**

```bash
cd frontend
npm install
npm test            # Run React unit tests
npm start           # Opens on http://localhost:3000
```

---

## CI/CD Pipeline Stages (`.github/workflows/`)

### ✅ **1. Code Quality & Static Analysis**

* **Tool**: CodeQL (`codeql.yml`)
* **Stage**: On PR & push to `main`
* **What it Validates**: Common vulnerabilities in JS code (e.g., SQL injection, XSS)

### ✅ **2. Infrastructure Scan**

* **Tool**: Checkov (`checkov.yml`)
* **Stage**: On push/PR to `infra/terraform`
* **What it Validates**: Terraform misconfigurations, insecure settings

### ✅ **3. Docker Image Scan**

* **Tool**: Trivy (`trivy.yml`)
* **Stage**: On image build (before pushing to ECR)
* **What it Validates**: OS & app dependency vulnerabilities

### ✅ **4. Unit Tests (CI)**

* **Tool**: Jest, React Testing Library (`unit-test.yml`)
* **Stage**: On every PR and push
* **What it Validates**: Functional correctness of backend & frontend logic

### ✅ **5. SonarCloud Quality Gate**

* **Tool**: SonarCloud (`sonar.yml`)
* **Stage**: On PR
* **What it Validates**: Bugs, code smells, test coverage, duplication

### ✅ **6. Build & Push Docker Images**

* **Workflow**: `ecr-push.yml`
* **Stage**: On push to `main` branch
* **Steps**:

  * Build Docker images for frontend & backend
  * Run Trivy scan
  * Push to AWS ECR

---

## CD Pipeline (Argo CD)

### ✅ **7. Continuous Deployment with Argo CD**

* **Files**: `argocd/backend-app.yaml`, `argocd/frontend-app.yaml`
* **What it Does**:

  * Tracks Helm chart repo and syncs deployment automatically
  * Visual GitOps interface to manage Kubernetes workloads

---

## Helm Charts

Each app has a separate Helm chart with:

* `deployment.yaml`: defines pods, replicas, containers
* `service.yaml`: exposes internal Kubernetes service
* `values.yaml`: customizable config (image tags, ports, etc.)

---

## Terraform Modules (Infrastructure Setup)

### ✅ Resources Created

* VPC, Subnets, IGW, Route Tables
* EKS Cluster
* EKS Node Groups
* IAM Roles for EKS & Nodes

### Steps to Deploy Infra:

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

Output will include:

* EKS Cluster name
* Kubeconfig for access

---

## Production Deployment Flow

1. **Dev/Test Your Code Locally**
2. **Push Code to GitHub → Triggers CI Workflows**
3. **Image Build → Trivy Scan → Push to ECR**
4. **Argo CD Watches Helm Charts → Auto Deployment**
5. **App is Deployed to EKS in Production**

---

## Monitoring (Optional Enhancements)

* Integrate Prometheus + Grafana for metrics
* Fluent Bit for logs
* AWS CloudWatch or Loki for log aggregation

---

## Security Best Practices Followed

* IaC scanning with Checkov
* Image scanning with Trivy
* Code analysis with CodeQL
* Secure Helm templates (no hardcoded secrets)
* EKS with IAM roles and least-privilege access

---

## Future Enhancements

* Add integration & e2e tests
* Implement Argo Rollouts for blue/green deployments
* Setup KEDA for auto-scaling based on metrics

---

## Author

Praveen Ayyappa
[GitHub](https://github.com/praveen-aketi)

---