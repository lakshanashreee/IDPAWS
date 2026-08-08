
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

resource "aws_dynamodb_table" "inventory_table" {
  name         = "L_InventoryTable"
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

resource "aws_dynamodb_table" "cart_table" {
  name         = "L_CartTable"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
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


  tags = merge(
    local.common_tags,
    {
      ApplicationService = "ProductService"
    }
  )
}

resource "aws_dynamodb_table" "category_table" {
  name         = "L_CategoryTable"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "categoryId"

  attribute {
    name = "categoryId"
    type = "S"
  }

  tags = merge(
    local.common_tags,
    {
      ApplicationService = "ProductService"
    }
  )
}

resource "aws_dynamodb_table" "wishlist_table" {
  name         = "L_WishlistTable"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "productId"

  attribute {
    name = "userId"
    type = "S"
  }

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

resource "aws_dynamodb_table" "user_details_table" {
  name         = "L_UserDetails"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  tags = merge(
    local.common_tags,
    {
      ApplicationService = "UserService"
    }
  )
}
