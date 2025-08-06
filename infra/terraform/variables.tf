variable "region" {
  default = "ap-south-1"
}

variable "aws_account_id" {}

variable "vpc_id" {}
variable "subnet_ids" {
  type = list(string)
}

variable "backend_image" {}
variable "frontend_image" {}

