resource "aws_sns_topic" "cloudwatch_alarms" {
  name = "L_Production_Alarms"
  tags = {
    ApplicationService = "test"
    CostCentre         = "test"
  }
}

resource "aws_sns_topic_subscription" "email_alerts" {
  topic_arn = aws_sns_topic.cloudwatch_alarms.arn
  protocol  = "email"
  endpoint  = "lakshanalakshu2408@gmail.com"
}

resource "aws_cloudwatch_dashboard" "production_dashboard" {
  dashboard_name = "Laurite_Production_Dashboard"

    dashboard_body = <<EOF
{
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
                    [ "AWS/CloudFront", "Requests", "DistributionId", "E3O1NXIGXU666Q", "Region", "Global" ]
                ],
                "region": "us-east-1",
                "stacked": false,
                "title": "CloudFront Requests",
                "view": "timeSeries"
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
                    [ "AWS/CloudFront", "4xxErrorRate", "DistributionId", "E3O1NXIGXU666Q", "Region", "Global" ]
                ],
                "region": "us-east-1",
                "stacked": false,
                "title": "CloudFront 4XX Errors",
                "view": "timeSeries"
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
                    [ "AWS/CloudFront", "5xxErrorRate", "DistributionId", "E3O1NXIGXU666Q", "Region", "Global" ]
                ],
                "region": "us-east-1",
                "stacked": false,
                "title": "CloudFront 5XX Errors",
                "view": "timeSeries"
            }
        },
        {
            "type": "text",
            "x": 0,
            "y": 7,
            "width": 24,
            "height": 1,
            "properties": {
                "markdown": "\n# API Gateway\n"
            }
        },
        {
            "type": "text",
            "x": 0,
            "y": 11,
            "width": 24,
            "height": 1,
            "properties": {
                "markdown": "\n# Lambda\n"
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 12,
            "width": 8,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/Lambda", "Invocations", "FunctionName", "L_ProductService" ],
                    [ ".", "Errors", ".", "." ],
                    [ ".", "Duration", ".", "." ],
                    [ ".", "Throttles", ".", "." ]
                ],
                "region": "ap-southeast-1",
                "stacked": false,
                "title": "L_ProductService Metrics",
                "view": "timeSeries"
            }
        },
        {
            "type": "metric",
            "x": 8,
            "y": 12,
            "width": 8,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/Lambda", "Invocations", "FunctionName", "L_InventoryService" ],
                    [ ".", "Errors", ".", "." ],
                    [ ".", "Duration", ".", "." ],
                    [ ".", "Throttles", ".", "." ]
                ],
                "region": "ap-southeast-1",
                "stacked": false,
                "title": "L_InventoryService Metrics",
                "view": "timeSeries"
            }
        },
        {
            "type": "metric",
            "x": 16,
            "y": 12,
            "width": 8,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/Lambda", "Invocations", "FunctionName", "L_CartService" ],
                    [ ".", "Errors", ".", "." ],
                    [ ".", "Duration", ".", "." ],
                    [ ".", "Throttles", ".", "." ]
                ],
                "region": "ap-southeast-1",
                "stacked": false,
                "title": "L_CartService Metrics",
                "view": "timeSeries"
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 18,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/Lambda", "Invocations", "FunctionName", "L_OrderService" ],
                    [ ".", "Errors", ".", "." ],
                    [ ".", "Duration", ".", "." ],
                    [ ".", "Throttles", ".", "." ]
                ],
                "region": "ap-southeast-1",
                "stacked": false,
                "title": "L_OrderService Metrics",
                "view": "timeSeries"
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 18,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/Lambda", "Invocations", "FunctionName", "L_PaymentService" ],
                    [ ".", "Errors", ".", "." ],
                    [ ".", "Duration", ".", "." ],
                    [ ".", "Throttles", ".", "." ]
                ],
                "region": "ap-southeast-1",
                "stacked": false,
                "title": "L_PaymentService Metrics",
                "view": "timeSeries"
            }
        },
        {
            "type": "text",
            "x": 0,
            "y": 24,
            "width": 24,
            "height": 1,
            "properties": {
                "markdown": "\n# DynamoDB\n"
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 25,
            "width": 8,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "L_ProductTable" ],
                    [ ".", "ConsumedWriteCapacityUnits", ".", "." ],
                    [ ".", "SuccessfulRequestLatency", ".", "." ],
                    [ ".", "ThrottledRequests", ".", "." ]
                ],
                "region": "ap-southeast-1",
                "stacked": false,
                "title": "L_ProductTable Metrics",
                "view": "timeSeries"
            }
        },
        {
            "type": "metric",
            "x": 8,
            "y": 25,
            "width": 8,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "L_InventoryTable" ],
                    [ ".", "ConsumedWriteCapacityUnits", ".", "." ],
                    [ ".", "SuccessfulRequestLatency", ".", "." ],
                    [ ".", "ThrottledRequests", ".", "." ]
                ],
                "region": "ap-southeast-1",
                "stacked": false,
                "title": "L_InventoryTable Metrics",
                "view": "timeSeries"
            }
        },
        {
            "type": "metric",
            "x": 16,
            "y": 25,
            "width": 8,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "L_CartTable" ],
                    [ ".", "ConsumedWriteCapacityUnits", ".", "." ],
                    [ ".", "SuccessfulRequestLatency", ".", "." ],
                    [ ".", "ThrottledRequests", ".", "." ]
                ],
                "region": "ap-southeast-1",
                "stacked": false,
                "title": "L_CartTable Metrics",
                "view": "timeSeries"
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 31,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "L_OrderTable" ],
                    [ ".", "ConsumedWriteCapacityUnits", ".", "." ],
                    [ ".", "SuccessfulRequestLatency", ".", "." ],
                    [ ".", "ThrottledRequests", ".", "." ]
                ],
                "region": "ap-southeast-1",
                "stacked": false,
                "title": "L_OrderTable Metrics",
                "view": "timeSeries"
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 31,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "L_PaymentTable" ],
                    [ ".", "ConsumedWriteCapacityUnits", ".", "." ],
                    [ ".", "SuccessfulRequestLatency", ".", "." ],
                    [ ".", "ThrottledRequests", ".", "." ]
                ],
                "region": "ap-southeast-1",
                "stacked": false,
                "title": "L_PaymentTable Metrics",
                "view": "timeSeries"
            }
        },
        {
            "type": "text",
            "x": 0,
            "y": 37,
            "width": 24,
            "height": 1,
            "properties": {
                "markdown": "\n# SQS\n"
            }
        },
        {
            "type": "metric",
            "x": 8,
            "y": 38,
            "width": 8,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "L_CartQueue" ],
                    [ ".", "ApproximateAgeOfOldestMessage", ".", "." ],
                    [ ".", "NumberOfMessagesSent", ".", "." ],
                    [ ".", "NumberOfMessagesReceived", ".", "." ]
                ],
                "region": "ap-southeast-1",
                "stacked": false,
                "title": "L_CartQueue Metrics",
                "view": "timeSeries"
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 38,
            "width": 8,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "L_InventoryQueue" ],
                    [ ".", "ApproximateAgeOfOldestMessage", ".", "." ],
                    [ ".", "NumberOfMessagesSent", ".", "." ],
                    [ ".", "NumberOfMessagesReceived", ".", "." ]
                ],
                "region": "ap-southeast-1",
                "stacked": false,
                "title": "L_InventoryQueue Metrics",
                "view": "timeSeries"
            }
        },
        {
            "type": "metric",
            "x": 16,
            "y": 38,
            "width": 8,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "L_PaymentQueue" ],
                    [ ".", "ApproximateAgeOfOldestMessage", ".", "." ],
                    [ ".", "NumberOfMessagesSent", ".", "." ],
                    [ ".", "NumberOfMessagesReceived", ".", "." ]
                ],
                "region": "ap-southeast-1",
                "stacked": false,
                "title": "L_PaymentQueue Metrics",
                "view": "timeSeries"
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 8,
            "width": 24,
            "height": 3,
            "properties": {
                "view": "singleValue",
                "stacked": false,
                "metrics": [
                    [ "AWS/ApiGateway", "4xx", "ApiId", "zq1dj3ag6d" ],
                    [ ".", "IntegrationLatency", ".", "." ],
                    [ ".", "Latency", ".", "." ],
                    [ ".", "5xx", ".", "." ],
                    [ ".", "Count", ".", "." ]
                ],
                "region": "ap-southeast-1"
            }
        }
    ]
}
EOF
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
