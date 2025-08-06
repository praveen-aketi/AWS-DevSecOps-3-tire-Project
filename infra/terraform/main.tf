# SecurePetStore - Terraform Code for AWS 3-Tier DevSecOps Architecture

# ----------------------------
# Provider Configuration
# ----------------------------
provider "aws" {
  region = "us-east-1"
}

# ----------------------------
# VPC
# ----------------------------
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.14.2"

  name = "securepetstore-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.3.0/24", "10.0.4.0/24"]
  database_subnets = ["10.0.5.0/24", "10.0.6.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = {
    Project = "SecurePetStore"
  }
}

# ----------------------------
# S3 Bucket for Frontend Hosting
# ----------------------------
resource "aws_s3_bucket" "frontend" {
  bucket = "securepetstore-frontend-bucket"
  force_destroy = true

  tags = {
    Name    = "FrontendHosting"
    Project = "SecurePetStore"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "PublicReadGetObject",
        Effect    = "Allow",
        Principal = "*",
        Action    = ["s3:GetObject"],
        Resource  = ["${aws_s3_bucket.frontend.arn}/*"]
      }
    ]
  })
}

# ----------------------------
# ECS Cluster
# ----------------------------
resource "aws_ecs_cluster" "main" {
  name = "securepetstore-ecs-cluster"
  tags = {
    Project = "SecurePetStore"
  }
}

# ----------------------------
# ECR Repo for Backend
# ----------------------------
resource "aws_ecr_repository" "backend" {
  name = "securepetstore-backend"
  image_scanning_configuration {
    scan_on_push = true
  }
  tags = {
    Project = "SecurePetStore"
  }
}

# ----------------------------
# RDS PostgreSQL
# ----------------------------
module "db" {
  source  = "terraform-aws-modules/rds/aws"
  version = "5.0.2"

  identifier = "securepetstore-db"
  engine     = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.micro"
  allocated_storage    = 20
  max_allocated_storage = 50

  name     = "petstoredb"
  username = "admin"
  password = "changeMe1234!"

  vpc_security_group_ids = [module.vpc.default_security_group_id]
  db_subnet_group_name   = module.vpc.database_subnet_group
  publicly_accessible    = false

  skip_final_snapshot = true
  tags = {
    Project = "SecurePetStore"
  }
}

# ----------------------------
# Outputs
# ----------------------------
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "frontend_bucket" {
  value = aws_s3_bucket.frontend.bucket
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecr_repo_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "rds_endpoint" {
  value = module.db.db_instance_endpoint
}

