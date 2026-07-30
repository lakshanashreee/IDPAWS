resource "aws_dynamodb_table" "product_table" {
  name         = "L_ProductTable"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "productId"

  attribute {
    name = "productId"
    type = "S"
  }

  tags = merge(
    local.common_tags,
    {
      ApplicationService = "ProductService"
    }
  )
}
