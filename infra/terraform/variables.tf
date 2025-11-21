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
  description = "Database password"
  type        = string
  sensitive   = true
  default     = "changeMe1234!"
}

variable "vpc_id" {}
variable "subnet_ids" {
  type = list(string)
}

variable "backend_image" {
  description = "Full image URI for backend (ECR or other). Example: 123456789012.dkr.ecr.ap-south-1.amazonaws.com/aws-devsecops-backend:latest"
  type        = string
  default     = ""
}

variable "frontend_image" {
  description = "Full image URI for frontend (ECR or other). Example: 123456789012.dkr.ecr.ap-south-1.amazonaws.com/aws-devsecops-frontend:latest"
  type        = string
  default     = ""
}
