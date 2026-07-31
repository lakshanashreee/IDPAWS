variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "ap-southeast-1"
}

variable "aws_profile" {
  type        = string
  description = "AWS CLI profile"
  default     = null
}
