resource "aws_kms_key" "dynamodb_key" {
  description             = "KMS key for DynamoDB tables"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}

resource "aws_kms_alias" "dynamodb_key_alias" {
  name          = "alias/ecommerce-dynamodb-key"
  target_key_id = aws_kms_key.dynamodb_key.key_id
}

resource "aws_dynamodb_table" "product_table" {
  name         = "L_ProductTable"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "productId"

  attribute {
    name = "productId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.dynamodb_key.arn
  }

  tags = merge(
    local.common_tags,
    {
      ApplicationService = "ProductService"
    }
  )
}

resource "aws_dynamodb_table" "inventory_table" {
  name         = "L_InventoryTable"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "productId"

  attribute {
    name = "productId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.dynamodb_key.arn
  }

  tags = merge(
    local.common_tags,
    {
      ApplicationService = "ProductService"
    }
  )
}

resource "aws_dynamodb_table" "cart_table" {
  name         = "L_CartTable"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.dynamodb_key.arn
  }

  tags = merge(
    local.common_tags,
    {
      ApplicationService = "ProductService"
    }
  )
}

resource "aws_dynamodb_table" "order_table" {
  name         = "L_OrderTable"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "orderId"

  attribute {
    name = "orderId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "userId-index"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.dynamodb_key.arn
  }

  tags = merge(
    local.common_tags,
    {
      ApplicationService = "ProductService"
    }
  )
}

resource "aws_dynamodb_table" "payment_table" {
  name         = "L_PaymentTable"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "paymentId"

  attribute {
    name = "paymentId"
    type = "S"
  }

  attribute {
    name = "orderId"
    type = "S"
  }

  global_secondary_index {
    name            = "orderId-index"
    hash_key        = "orderId"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.dynamodb_key.arn
  }

  tags = merge(
    local.common_tags,
    {
      ApplicationService = "ProductService"
    }
  )
}
