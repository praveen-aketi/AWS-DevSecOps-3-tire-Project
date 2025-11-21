# Terraform S3 backend config (example)
#
# IMPORTANT:
# - This file contains an example backend configuration. Do NOT run 'terraform init' with this backend
#   until the S3 bucket and DynamoDB table exist.
# - To bootstrap the remote state resources you can:
#   1) Leave this file commented/absent and run `terraform init` + `terraform apply` locally using the
#      current configuration to create the S3 bucket and DynamoDB table (they are defined in main.tf).
#   2) OR create the S3 bucket and DynamoDB table manually (AWS CLI / console) with the names below.
#   3) After the bucket + table exist, update bucket/table values below and run:
#        terraform init -reconfigure
#        terraform plan
#
# Example backend block. Replace placeholders and uncomment when ready.

terraform {
  backend "s3" {
    # Replace with the bucket name created by the bootstrap apply (or created manually)
    bucket         = "securepetstore-terraform-state-<YOUR_AWS_ACCOUNT_ID>"
    key            = "terraform.tfstate"
    region         = "<AWS_REGION>"
    dynamodb_table = "securepetstore-terraform-locks-<YOUR_AWS_ACCOUNT_ID>"
    encrypt        = true
  }
}
