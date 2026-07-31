resource "aws_sns_topic" "order_placed_topic" {
  name = "L_OrderPlacedTopic"

  tags = merge(
    local.common_tags,
    {
      ApplicationService = "ProductService"
    }
  )
}
