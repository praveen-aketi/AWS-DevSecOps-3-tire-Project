# AWS-DevSecOps-3-tire-Project
# SecurePetStore DevSecOps Project 🚀

A production-quality, **3-tier DevSecOps project** on AWS using **Terraform**, **EKS**, **Helm**, **ArgoCD**, and integrated security tools.

---

## 🧾 Tech Stack Overview

| Layer           | Technology / Tools                                      |
|----------------|----------------------------------------------------------|
| IaC            | Terraform (managing VPC, ECR, IAM, EKS, NodeGroup)       |
| CI             | GitHub Actions                                           |
| CD             | Argo CD                                                  |
| Container Registry | AWS ECR                                             |
| Orchestration  | AWS EKS (Kubernetes)                                     |
| Kubernetes Mgmt| Helm (for packaging and deployment)                      |
| Security Scans | Trivy, SonarQube, JFrog Xray, Checkov, CodeQL           |
| Monitoring     | CloudWatch / (optional) Prometheus + Grafana             |
| DB             | AWS RDS (PostgreSQL) — can be added later                |

---

## 📁 Project Structure

```
AWS-DevSecOps-3-tire-Project/
├── backend/                  # Node.js backend service
├── frontend/                 # Frontend React or static app
├── infra/terraform/          # Terraform infrastructure definitions
│   ├── main.tf
│   ├── eks.tf
│   └── ...other .tf files...
├── helm/                     # Helm charts for backend and frontend apps
│   ├── backend/
│   └── frontend/
├── k8s/                      # (Deprecated) Old Kubernetes manifests
├── .github/workflows/        # CI & Security workflows
│   ├── trivy.yml
│   ├── checkov.yml
│   ├── codeql.yml
│   ├── sonar.yml
│   ├── backend-ci.yml
│   └── frontend-ci.yml
└── argocd/                   # Argo CD app definitions
    ├── backend-app.yaml
    └── frontend-app.yaml
```

---

## 🚀 Step-by-Step Workflow

### 1. **Set up AWS Infrastructure (Terraform + EKS)**

- Define EKS cluster, node group, IAM roles, and security groups in `infra/terraform/*.tf`
- Configure variables in `terraform.tfvars` (account ID, subnet IDs, ECR repo names, etc.)

**Commands:**
```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

---

### 2. **Build and Push Docker Images to AWS ECR**

This is automatically triggered by GitHub Actions:

- `backend-ci.yml` builds and pushes backend Docker image from `backend/`
- `frontend-ci.yml` builds and pushes frontend image from `frontend/`

Make sure you have set the following **GitHub Secrets**:
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION (e.g., ap-south-1)
AWS_ACCOUNT_ID
ECR_REPOSITORY_BACKEND
ECR_REPOSITORY_FRONTEND
```

---

### 3. **Security Scans via GitHub Actions**

Run on every push to `main`:

- `trivy.yml` – Scan Docker images for vulnerabilities
- `checkov.yml` – Scan Terraform for misconfigurations
- `codeql.yml` – Analyze code for vulnerabilities
- `sonar.yml` – Code quality and static analysis
- **(Optional)** JFrog Xray for artifact scanning

---

### 4. **Deploy Apps to EKS via Helm + ArgoCD**

- Applications are packaged using Helm charts in `helm/`
- ArgoCD pulls the charts and deploys them to EKS

**Steps:**
```bash
# Install ArgoCD CLI
brew install argocd

# Login and configure ArgoCD (if not using ArgoCD UI)
argocd login <ARGO_SERVER>
argocd app create backend --repo <git-url> --path helm/backend --dest-server https://kubernetes.default.svc --dest-namespace default
argocd app sync backend

argocd app create frontend --repo <git-url> --path helm/frontend --dest-server https://kubernetes.default.svc --dest-namespace default
argocd app sync frontend
```

---

### 5. **Access & Testing**

- **Frontend**: Exposed using `LoadBalancer` service via ArgoCD Helm values
- **Backend**: Internal ClusterIP or port-forward if needed

```bash
kubectl get svc
kubectl port-forward svc/backend-service 8080:3000
```

---

## ✅ Summary: What Each Step Does

| Phase                  | Purpose                                                                |
|------------------------|------------------------------------------------------------------------|
| **Terraform infra**    | Create AWS VPC, subnets, ECR, IAM roles, EKS cluster & worker nodes    |
| **Docker + CI**        | Build/push Docker images automatically via GitHub Actions              |
| **Security**           | Run Trivy, Checkov, CodeQL, Sonar, JFrog scans                         |
| **Helm Charts**        | Define Kubernetes deployments/services for frontend and backend        |
| **CD via ArgoCD**      | Auto-deploy and manage releases in EKS using Helm and GitOps           |
| **Access**             | Frontend exposed; backend internally accessed or port-forwarded        |

---

## 🧠 Final Notes

This updated setup implements **GitOps**, **DevSecOps**, and **Infrastructure as Code** principles using a production-grade toolchain.

Let me know if you want help with Helm values files or ArgoCD app automation!
