resource "aws_sns_topic" "cloudwatch_alarms" {
  name = "Laurite_Production_Alarms"
  tags = {
    ApplicationService = "test"
    CostCentre         = "test"
  }
}

resource "aws_cloudwatch_dashboard" "production_dashboard" {
  dashboard_name = "Laurite_Production_Dashboard"

    dashboard_body = jsonencode({
  "widgets": [
    {
      "type": "text",
      "x": 0,
      "y": 0,
      "width": 24,
      "height": 1,
      "properties": {
        "markdown": "\n# CloudFront\n"
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 1,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/CloudFront",
            "Requests",
            "DistributionId",
            "E3O1NXIGXU666Q",
            "Region",
            "Global"
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "CloudFront Requests"
      }
    },
    {
      "type": "metric",
      "x": 8,
      "y": 1,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/CloudFront",
            "CacheHitRate",
            "DistributionId",
            "E3O1NXIGXU666Q",
            "Region",
            "Global"
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "CloudFront Cache Hit Rate"
      }
    },
    {
      "type": "metric",
      "x": 16,
      "y": 1,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/CloudFront",
            "OriginLatency",
            "DistributionId",
            "E3O1NXIGXU666Q",
            "Region",
            "Global"
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "CloudFront Origin Latency"
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 7,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/CloudFront",
            "4xxErrorRate",
            "DistributionId",
            "E3O1NXIGXU666Q",
            "Region",
            "Global"
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "CloudFront 4XX Errors"
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 7,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/CloudFront",
            "5xxErrorRate",
            "DistributionId",
            "E3O1NXIGXU666Q",
            "Region",
            "Global"
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "CloudFront 5XX Errors"
      }
    },
    {
      "type": "text",
      "x": 0,
      "y": 13,
      "width": 24,
      "height": 1,
      "properties": {
        "markdown": "\n# API Gateway\n"
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 14,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/ApiGateway",
            "Count",
            "ApiName",
            "L_ECommerceAPI"
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "Request Count"
      }
    },
    {
      "type": "metric",
      "x": 8,
      "y": 14,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/ApiGateway",
            "Latency",
            "ApiName",
            "L_ECommerceAPI"
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "Latency"
      }
    },
    {
      "type": "metric",
      "x": 16,
      "y": 14,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/ApiGateway",
            "IntegrationLatency",
            "ApiName",
            "L_ECommerceAPI"
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "Integration Latency"
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 20,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/ApiGateway",
            "4XXError",
            "ApiName",
            "L_ECommerceAPI"
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "4XX Errors"
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 20,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/ApiGateway",
            "5XXError",
            "ApiName",
            "L_ECommerceAPI"
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "5XX Errors"
      }
    },
    {
      "type": "text",
      "x": 0,
      "y": 26,
      "width": 24,
      "height": 1,
      "properties": {
        "markdown": "\n# Lambda\n"
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 27,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/Lambda",
            "Invocations",
            "FunctionName",
            "L_ProductService"
          ],
          [
            ".",
            "Errors",
            ".",
            "."
          ],
          [
            ".",
            "Duration",
            ".",
            "."
          ],
          [
            ".",
            "Throttles",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_ProductService Metrics"
      }
    },
    {
      "type": "metric",
      "x": 8,
      "y": 27,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/Lambda",
            "Invocations",
            "FunctionName",
            "L_InventoryService"
          ],
          [
            ".",
            "Errors",
            ".",
            "."
          ],
          [
            ".",
            "Duration",
            ".",
            "."
          ],
          [
            ".",
            "Throttles",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_InventoryService Metrics"
      }
    },
    {
      "type": "metric",
      "x": 16,
      "y": 27,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/Lambda",
            "Invocations",
            "FunctionName",
            "L_CartService"
          ],
          [
            ".",
            "Errors",
            ".",
            "."
          ],
          [
            ".",
            "Duration",
            ".",
            "."
          ],
          [
            ".",
            "Throttles",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_CartService Metrics"
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 33,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/Lambda",
            "Invocations",
            "FunctionName",
            "L_OrderService"
          ],
          [
            ".",
            "Errors",
            ".",
            "."
          ],
          [
            ".",
            "Duration",
            ".",
            "."
          ],
          [
            ".",
            "Throttles",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_OrderService Metrics"
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 33,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/Lambda",
            "Invocations",
            "FunctionName",
            "L_PaymentService"
          ],
          [
            ".",
            "Errors",
            ".",
            "."
          ],
          [
            ".",
            "Duration",
            ".",
            "."
          ],
          [
            ".",
            "Throttles",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_PaymentService Metrics"
      }
    },
    {
      "type": "text",
      "x": 0,
      "y": 39,
      "width": 24,
      "height": 1,
      "properties": {
        "markdown": "\n# DynamoDB\n"
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 40,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/DynamoDB",
            "ConsumedReadCapacityUnits",
            "TableName",
            "L_ProductTable"
          ],
          [
            ".",
            "ConsumedWriteCapacityUnits",
            ".",
            "."
          ],
          [
            ".",
            "SuccessfulRequestLatency",
            ".",
            "."
          ],
          [
            ".",
            "ThrottledRequests",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_ProductTable Metrics"
      }
    },
    {
      "type": "metric",
      "x": 8,
      "y": 40,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/DynamoDB",
            "ConsumedReadCapacityUnits",
            "TableName",
            "L_InventoryTable"
          ],
          [
            ".",
            "ConsumedWriteCapacityUnits",
            ".",
            "."
          ],
          [
            ".",
            "SuccessfulRequestLatency",
            ".",
            "."
          ],
          [
            ".",
            "ThrottledRequests",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_InventoryTable Metrics"
      }
    },
    {
      "type": "metric",
      "x": 16,
      "y": 40,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/DynamoDB",
            "ConsumedReadCapacityUnits",
            "TableName",
            "L_CartTable"
          ],
          [
            ".",
            "ConsumedWriteCapacityUnits",
            ".",
            "."
          ],
          [
            ".",
            "SuccessfulRequestLatency",
            ".",
            "."
          ],
          [
            ".",
            "ThrottledRequests",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_CartTable Metrics"
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 46,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/DynamoDB",
            "ConsumedReadCapacityUnits",
            "TableName",
            "L_OrderTable"
          ],
          [
            ".",
            "ConsumedWriteCapacityUnits",
            ".",
            "."
          ],
          [
            ".",
            "SuccessfulRequestLatency",
            ".",
            "."
          ],
          [
            ".",
            "ThrottledRequests",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_OrderTable Metrics"
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 46,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/DynamoDB",
            "ConsumedReadCapacityUnits",
            "TableName",
            "L_PaymentTable"
          ],
          [
            ".",
            "ConsumedWriteCapacityUnits",
            ".",
            "."
          ],
          [
            ".",
            "SuccessfulRequestLatency",
            ".",
            "."
          ],
          [
            ".",
            "ThrottledRequests",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_PaymentTable Metrics"
      }
    },
    {
      "type": "text",
      "x": 0,
      "y": 52,
      "width": 24,
      "height": 1,
      "properties": {
        "markdown": "\n# SQS\n"
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 53,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/SQS",
            "ApproximateNumberOfMessagesVisible",
            "QueueName",
            "L_CartQueue"
          ],
          [
            ".",
            "ApproximateAgeOfOldestMessage",
            ".",
            "."
          ],
          [
            ".",
            "NumberOfMessagesSent",
            ".",
            "."
          ],
          [
            ".",
            "NumberOfMessagesReceived",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_CartQueue Metrics"
      }
    },
    {
      "type": "metric",
      "x": 8,
      "y": 53,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/SQS",
            "ApproximateNumberOfMessagesVisible",
            "QueueName",
            "L_CartQueue_DLQ"
          ],
          [
            ".",
            "ApproximateAgeOfOldestMessage",
            ".",
            "."
          ],
          [
            ".",
            "NumberOfMessagesSent",
            ".",
            "."
          ],
          [
            ".",
            "NumberOfMessagesReceived",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_CartQueue_DLQ Metrics"
      }
    },
    {
      "type": "metric",
      "x": 16,
      "y": 53,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/SQS",
            "ApproximateNumberOfMessagesVisible",
            "QueueName",
            "L_InventoryQueue"
          ],
          [
            ".",
            "ApproximateAgeOfOldestMessage",
            ".",
            "."
          ],
          [
            ".",
            "NumberOfMessagesSent",
            ".",
            "."
          ],
          [
            ".",
            "NumberOfMessagesReceived",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_InventoryQueue Metrics"
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 59,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/SQS",
            "ApproximateNumberOfMessagesVisible",
            "QueueName",
            "L_InventoryQueue_DLQ"
          ],
          [
            ".",
            "ApproximateAgeOfOldestMessage",
            ".",
            "."
          ],
          [
            ".",
            "NumberOfMessagesSent",
            ".",
            "."
          ],
          [
            ".",
            "NumberOfMessagesReceived",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_InventoryQueue_DLQ Metrics"
      }
    },
    {
      "type": "metric",
      "x": 8,
      "y": 59,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/SQS",
            "ApproximateNumberOfMessagesVisible",
            "QueueName",
            "L_OrderPaymentUpdateQueue"
          ],
          [
            ".",
            "ApproximateAgeOfOldestMessage",
            ".",
            "."
          ],
          [
            ".",
            "NumberOfMessagesSent",
            ".",
            "."
          ],
          [
            ".",
            "NumberOfMessagesReceived",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_OrderPaymentUpdateQueue Metrics"
      }
    },
    {
      "type": "metric",
      "x": 16,
      "y": 59,
      "width": 8,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/SQS",
            "ApproximateNumberOfMessagesVisible",
            "QueueName",
            "L_OrderPaymentUpdateQueue_DLQ"
          ],
          [
            ".",
            "ApproximateAgeOfOldestMessage",
            ".",
            "."
          ],
          [
            ".",
            "NumberOfMessagesSent",
            ".",
            "."
          ],
          [
            ".",
            "NumberOfMessagesReceived",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_OrderPaymentUpdateQueue_DLQ Metrics"
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 65,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/SQS",
            "ApproximateNumberOfMessagesVisible",
            "QueueName",
            "L_PaymentQueue"
          ],
          [
            ".",
            "ApproximateAgeOfOldestMessage",
            ".",
            "."
          ],
          [
            ".",
            "NumberOfMessagesSent",
            ".",
            "."
          ],
          [
            ".",
            "NumberOfMessagesReceived",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_PaymentQueue Metrics"
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 65,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [
            "AWS/SQS",
            "ApproximateNumberOfMessagesVisible",
            "QueueName",
            "L_PaymentQueue_DLQ"
          ],
          [
            ".",
            "ApproximateAgeOfOldestMessage",
            ".",
            "."
          ],
          [
            ".",
            "NumberOfMessagesSent",
            ".",
            "."
          ],
          [
            ".",
            "NumberOfMessagesReceived",
            ".",
            "."
          ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": var.aws_region,
        "title": "L_PaymentQueue_DLQ Metrics"
      }
    }
  ]
})
}

# -------------------------------------------------------------------------
# API Gateway Alarms
# -------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "apigw_5xx" {
  alarm_name          = "Laurite-APIGW-High-5XX"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = "60"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "High number of 5XX errors in API Gateway"
  alarm_actions       = [aws_sns_topic.cloudwatch_alarms.arn]
  tags = {
    ApplicationService = "test"
    CostCentre         = "test"
  }
}

resource "aws_cloudwatch_metric_alarm" "apigw_latency" {
  alarm_name          = "Laurite-APIGW-High-Latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Latency"
  namespace           = "AWS/ApiGateway"
  period              = "60"
  statistic           = "Average"
  threshold           = "1000"
  alarm_description   = "High Latency in API Gateway"
  alarm_actions       = [aws_sns_topic.cloudwatch_alarms.arn]
  tags = {
    ApplicationService = "test"
    CostCentre         = "test"
  }
}

# -------------------------------------------------------------------------
# CloudFront Alarms 
# (Removed because AWS Academy SCP denies alarm creation in us-east-1)
# -------------------------------------------------------------------------

# -------------------------------------------------------------------------
# Lambda Alarms
# -------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "Laurite-Lambda-High-Errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "60"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "High number of Lambda errors"
  alarm_actions       = [aws_sns_topic.cloudwatch_alarms.arn]
  tags = {
    ApplicationService = "test"
    CostCentre         = "test"
  }
}

resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  alarm_name          = "Laurite-Lambda-Long-Duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = "60"
  statistic           = "Average"
  threshold           = "3000"
  alarm_description   = "Lambda functions taking too long"
  alarm_actions       = [aws_sns_topic.cloudwatch_alarms.arn]
  tags = {
    ApplicationService = "test"
    CostCentre         = "test"
  }
}

resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  alarm_name          = "Laurite-Lambda-Throttling"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = "60"
  statistic           = "Sum"
  threshold           = "1"
  alarm_description   = "Lambda throttling detected"
  alarm_actions       = [aws_sns_topic.cloudwatch_alarms.arn]
  tags = {
    ApplicationService = "test"
    CostCentre         = "test"
  }
}

# -------------------------------------------------------------------------
# DynamoDB Alarms
# -------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "dynamodb_throttles" {
  alarm_name          = "Laurite-DynamoDB-Throttling"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ThrottledRequests"
  namespace           = "AWS/DynamoDB"
  period              = "60"
  statistic           = "Sum"
  threshold           = "1"
  alarm_description   = "DynamoDB requests are being throttled"
  alarm_actions       = [aws_sns_topic.cloudwatch_alarms.arn]
  tags = {
    ApplicationService = "test"
    CostCentre         = "test"
  }
}

resource "aws_cloudwatch_metric_alarm" "dynamodb_latency" {
  alarm_name          = "Laurite-DynamoDB-High-Latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "SuccessfulRequestLatency"
  namespace           = "AWS/DynamoDB"
  period              = "60"
  statistic           = "Average"
  threshold           = "50"
  alarm_description   = "DynamoDB response time is high"
  alarm_actions       = [aws_sns_topic.cloudwatch_alarms.arn]
  tags = {
    ApplicationService = "test"
    CostCentre         = "test"
  }
}

# -------------------------------------------------------------------------
# SQS Alarms
# -------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "sqs_old_messages" {
  alarm_name          = "Laurite-SQS-Old-Messages"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ApproximateAgeOfOldestMessage"
  namespace           = "AWS/SQS"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "300"
  alarm_description   = "Messages are sitting in the queue too long"
  alarm_actions       = [aws_sns_topic.cloudwatch_alarms.arn]
  tags = {
    ApplicationService = "test"
    CostCentre         = "test"
  }
}

resource "aws_cloudwatch_metric_alarm" "sqs_queue_depth" {
  alarm_name          = "Laurite-SQS-High-Queue-Depth"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "100"
  alarm_description   = "High queue depth / backlog"
  alarm_actions       = [aws_sns_topic.cloudwatch_alarms.arn]
  tags = {
    ApplicationService = "test"
    CostCentre         = "test"
  }
}
