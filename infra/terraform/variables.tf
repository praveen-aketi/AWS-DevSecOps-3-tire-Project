variable "region" {
  default = "ap-south-1"
}

variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "vpc_id" {}
variable "subnet_ids" {
  type = list(string)
}

variable "backend_image" {}
variable "frontend_image" {}
