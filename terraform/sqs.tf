resource "aws_sqs_queue" "inventory_queue" {
  name = "L_InventoryQueue"

  tags = merge(
    local.common_tags,
    {
      ApplicationService = "ProductService"
    }
  )

  lifecycle {
    ignore_changes = [
      max_message_size
    ]
  }
}

resource "aws_sqs_queue" "payment_queue" {
  name = "L_PaymentQueue"

  tags = merge(
    local.common_tags,
    {
      ApplicationService = "ProductService"
    }
  )

  lifecycle {
    ignore_changes = [
      max_message_size
    ]
  }
}
