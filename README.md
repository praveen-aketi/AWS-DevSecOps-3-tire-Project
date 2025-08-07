# 🛡️ SecurePetStore: AWS DevSecOps 3-Tier Project

## 🧾 Project Name

**SecurePetStore**

## 🌐 Application Purpose

SecurePetStore is a cloud-native 3-tier web application for managing a virtual pet store. It demonstrates best practices in DevSecOps by integrating secure development, infrastructure as code (IaC), containerization, automated testing, vulnerability scanning, GitOps, and CI/CD using AWS and Kubernetes.

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
* **Database:** (Simulated/mock, can be extended to RDS or MongoDB)

**Deployment Targets:**

* **Local:** Docker
* **Production:** AWS EKS with ArgoCD + Helm

---

## 🧪 How to Run Locally

### Prerequisites

* Docker
* Node.js and npm
* Git

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
npm install
npm start
```

### Local Testing

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
```

### Docker Local (optional)

```bash
# Build & run frontend
cd frontend
docker build -t securepetstore-frontend .
docker run -p 3000:3000 securepetstore-frontend

# Build & run backend
cd backend
docker build -t securepetstore-backend .
docker run -p 5000:5000 securepetstore-backend
```

---

## 🚀 Step-by-Step Production Deployment (AWS)

### STEP 1️⃣: Provision AWS EKS Cluster using Terraform

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

**🔍 What happens?**

* Creates VPC, IAM roles, EKS cluster and node group

---

### STEP 2️⃣: Configure kubectl to access the EKS cluster

```bash
aws eks update-kubeconfig --region <your-region> --name <your-cluster-name>
kubectl get nodes
```

**🔍 What happens?**

* Sets up your local kubeconfig to manage EKS cluster

---

### STEP 3️⃣: Install Argo CD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

**🔍 What happens?**

* Deploys Argo CD into the cluster

---

### STEP 4️⃣: Deploy Backend & Frontend via ArgoCD

```bash
kubectl apply -f argocd/
```

**🔍 What happens?**

* ArgoCD detects `charts/*` and installs Helm charts into Kubernetes
* Apps are deployed and synced automatically (GitOps)

---

### STEP 5️⃣: Access the Application

```bash
kubectl get svc -n <namespace>
```

**🔍 What happens?**

* Use LoadBalancer/Ingress IP to open frontend in browser

---

## 🔐 DevSecOps Toolchain Summary

| Stage            | Tool              | Purpose                           |
| ---------------- | ----------------- | --------------------------------- |
| CI/CD            | GitHub Actions    | Build, test, scan, deploy         |
| IaC              | Terraform         | Create AWS EKS cluster            |
| Static Code Scan | CodeQL, SonarQube | Detect code vulnerabilities       |
| IaC Scan         | Checkov           | Scan Terraform files              |
| Image Scanning   | Trivy             | Scan Docker image vulnerabilities |
| Unit Testing     | Jest/Mocha        | Backend & frontend testing        |
| GitOps CD        | Argo CD           | Kubernetes deployment from Git    |
| Helm Charts      | Helm              | Kubernetes manifests packaging    |

---

## 🧹 Cleanup (Optional)

```bash
cd infra/terraform
terraform destroy
```

---

## 👤 Author

**Praveen Ayyappa**
🔗 GitHub: [@praveen-aketi](https://github.com/praveen-aketi)

---
