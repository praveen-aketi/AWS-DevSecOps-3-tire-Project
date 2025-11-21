variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "db_password" {
  description = "Database password (must be provided via TF_VAR_db_password or CI secret)."
  type        = string
  sensitive   = true
}

variable "vpc_id" {}
variable "subnet_ids" {
  type = list(string)
}

variable "backend_image" {
  description = "Full image URI for backend (ECR or other). Example: 123456789012.dkr.ecr.ap-south-1.amazonaws.com/aws-devsecops-backend:latest"
  type        = string
  default     = ""
  validation {
    condition     = length(var.backend_image) > 0
    error_message = "backend_image must be set (TF_VAR_backend_image or in terraform.tfvars)"
  }
}

variable "frontend_image" {
  description = "Full image URI for frontend (ECR or other). Example: 123456789012.dkr.ecr.ap-south-1.amazonaws.com/aws-devsecops-frontend:latest"
  type        = string
  default     = ""
  validation {
    condition     = length(var.frontend_image) > 0
    error_message = "frontend_image must be set (TF_VAR_frontend_image or in terraform.tfvars)"
  }
}
