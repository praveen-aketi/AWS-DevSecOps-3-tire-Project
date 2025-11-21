# SecurePetStore - Terraform Code for AWS 3-Tier DevSecOps Architecture

# ----------------------------
# Provider Configuration
# ----------------------------
provider "aws" {
  region = var.region
}

# ----------------------------
# VPC
# ----------------------------
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

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

  # Harden S3 bucket by blocking public access by default.
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
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
# Terraform Remote State (bootstrap resources)
# ----------------------------
resource "aws_s3_bucket" "terraform_state" {
  bucket = "securepetstore-terraform-state-${var.aws_account_id}"
  acl    = "private"

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  tags = {
    Name    = "SecurePetStoreTerraformState"
    Project = "SecurePetStore"
  }
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "securepetstore-terraform-locks-${var.aws_account_id}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

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

output "terraform_state_bucket_name" {
  value = aws_s3_bucket.terraform_state.bucket
}

output "terraform_lock_table_name" {
  value = aws_dynamodb_table.terraform_locks.name
}

resource "aws_iam_role" "ecs_task_execution" {
  name = "ecsTaskExecutionRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        },
        Effect = "Allow",
        Sid    = ""
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Add a task IAM role for containers (allows access to Secrets Manager for DB password)
resource "aws_iam_role" "ecs_task_role" {
  name = "ecsTaskRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        },
        Effect = "Allow",
        Sid    = ""
      }
    ]
  })
}

resource "aws_iam_role_policy" "ecs_task_secrets_policy" {
  name = "ecs-task-secrets-policy"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ],
        Resource = aws_secretsmanager_secret.db_password.arn
      }
    ]
  })
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "backend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      # Use the image variable from terraform variables to avoid string assembly issues.
      image = var.backend_image
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
        }
      ],
      secrets = [
        {
          name      = "DB_PASSWORD"
          valueFrom = aws_secretsmanager_secret.db_password.arn
        }
      ]
    }
  ])
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

resource "aws_secretsmanager_secret" "db_password" {
  name        = "securepetstore-db-password"
  description = "Database admin password for SecurePetStore. Stored in Secrets Manager."
}

resource "aws_secretsmanager_secret_version" "db_password_version" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  # Store the password as the raw secret string so ECS secrets map directly to the password value.
  secret_string = var.db_password
}
