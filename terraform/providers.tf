provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

# Required for CloudFront CloudWatch Alarms (which only exist in us-east-1)
provider "aws" {
  alias   = "us_east_1"
  region  = "us-east-1"
  profile = var.aws_profile
}
