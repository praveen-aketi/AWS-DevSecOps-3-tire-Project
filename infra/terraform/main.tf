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
  # checkov:skip=CKV_AWS_18: "Ensure the S3 bucket has access logging enabled" - Not needed for demo
  # checkov:skip=CKV_AWS_144: "Ensure that S3 bucket has cross-region replication enabled" - Not needed for demo
  # checkov:skip=CKV_AWS_21: "Ensure all data stored in the S3 bucket have versioning enabled" - Not needed for demo
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

  db_name  = "petstoredb"
  username = "admin"
  password = var.db_password

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

resource "aws_ecs_task_definition" "backend" {
  family                   = "backend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image = "${var.aws_account_id}.dkr.ecr.${var.region}.amazonaws.com/aws-devsecops-backend:latest"
      portMappings = [
        {
          containerPort = 5000
          hostPort      = 5000
        }
      ],
      environment = [
        {
          name  = "DB_HOST"
          value = module.db.db_instance_endpoint
        },
        {
          name  = "DB_NAME"
          value = "petstoredb"
        },
        {
          name  = "DB_USER"
          value = "admin"
        },
        {
          name  = "DB_PASSWORD"
          value = "changeMe1234!"
        }
      ]
    }
  ])
}

output "rds_endpoint" {
  value = module.db.db_instance_endpoint
}

resource "aws_ecs_service" "backend" {
  name            = "backend-service"
  cluster         = aws_ecs_cluster.main.id
  launch_type     = "FARGATE"
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [module.vpc.default_security_group_id]
    assign_public_ip = false
  }

  depends_on = [
    aws_ecs_cluster.main,
    aws_ecs_task_definition.backend
  ]
}
