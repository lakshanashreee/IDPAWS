output "product_table_arn" {
  value       = aws_dynamodb_table.product_table.arn
  description = "Product Table ARN"
}

output "inventory_table_arn" {
  value       = aws_dynamodb_table.inventory_table.arn
  description = "Inventory Table ARN"
}

output "developer_role_arn" {
  value       = aws_iam_role.developer_lakshana.arn
  description = "Developer Lakshana Role ARN"
}

output "cognito_user_pool_id" {
  value       = aws_cognito_user_pool.user_pool.id
  description = "Cognito User Pool ID"
}
