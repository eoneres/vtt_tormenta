# ── DocumentDB (MongoDB-compatible) for Compendium + Rules Engine ─────────────

resource "aws_docdb_cluster" "mongodb" {
  cluster_identifier = "vtt-docdb-${var.environment}"

  engine                  = "docdb"
  engine_version          = "6.0.0"
  master_username         = "vttadmin"
  master_password         = random_password.docdb_password.result

  db_subnet_group_name   = aws_docdb_subnet_group.mongodb.name
  vpc_security_group_ids = [aws_security_group.docdb.id]

  storage_encrypted     = true
  deletion_protection   = var.environment == "production"
  skip_final_snapshot   = var.environment != "production"

  backup_retention_period = var.environment == "production" ? 14 : 3

  enabled_cloudwatch_logs_exports = ["audit", "profiler"]

  tags = {
    Name = "vtt-docdb-${var.environment}"
  }
}

resource "aws_docdb_cluster_instance" "mongodb" {
  count              = var.docdb_instance_count
  identifier         = "vtt-docdb-${var.environment}-${count.index}"
  cluster_identifier = aws_docdb_cluster.mongodb.id
  instance_class     = var.docdb_instance_class

  tags = {
    Name = "vtt-docdb-${var.environment}-instance-${count.index}"
  }
}

resource "aws_docdb_subnet_group" "mongodb" {
  name       = "vtt-docdb-${var.environment}"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name = "vtt-docdb-subnet-group-${var.environment}"
  }
}

resource "aws_security_group" "docdb" {
  name        = "vtt-docdb-${var.environment}"
  description = "DocumentDB security group"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "vtt-docdb-sg-${var.environment}" }
}

resource "random_password" "docdb_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "aws_secretsmanager_secret" "docdb_password" {
  name                    = "vtt/${var.environment}/docdb-password"
  recovery_window_in_days = var.environment == "production" ? 30 : 0
}

resource "aws_secretsmanager_secret_version" "docdb_password" {
  secret_id     = aws_secretsmanager_secret.docdb_password.id
  secret_string = jsonencode({
    username = "vttadmin"
    password = random_password.docdb_password.result
    host     = aws_docdb_cluster.mongodb.endpoint
    port     = 27017
  })
}

# ── S3 bucket for VTT assets (maps, tokens, marketplace) ─────────────────────

resource "aws_s3_bucket" "assets" {
  bucket        = "vtt-assets-${var.environment}-${data.aws_caller_identity.current.account_id}"
  force_destroy = var.environment != "production"

  tags = { Name = "vtt-assets-${var.environment}" }
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = var.allowed_cors_origins
    expose_headers  = ["ETag", "x-amz-checksum-sha256"]
    max_age_seconds = 3600
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    id     = "expire-temp-uploads"
    status = "Enabled"
    filter { prefix = "temp/" }
    expiration { days = 1 }
  }

  rule {
    id     = "transition-old-assets"
    status = "Enabled"
    filter { prefix = "marketplace/" }
    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }
  }
}

# Block all public access — served only via CloudFront
resource "aws_s3_bucket_public_access_block" "assets" {
  bucket                  = aws_s3_bucket.assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ── CloudFront distribution for asset CDN ─────────────────────────────────────

resource "aws_cloudfront_origin_access_control" "assets" {
  name                              = "vtt-assets-oac-${var.environment}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "assets" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "VTT Platform Asset CDN — ${var.environment}"
  price_class         = "PriceClass_100"  # US, Canada, Europe
  default_root_object = ""

  origin {
    domain_name              = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id                = "S3-vtt-assets-${var.environment}"
    origin_access_control_id = aws_cloudfront_origin_access_control.assets.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-vtt-assets-${var.environment}"
    viewer_protocol_policy = "https-only"
    compress               = true

    cache_policy_id          = aws_cloudfront_cache_policy.assets.id
    origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"  # CORS-S3Origin
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
    # In production: set acm_certificate_arn for custom domain
  }

  tags = { Name = "vtt-assets-cdn-${var.environment}" }
}

resource "aws_cloudfront_cache_policy" "assets" {
  name        = "vtt-assets-cache-${var.environment}"
  default_ttl = 31536000   # 1 year
  max_ttl     = 31536000
  min_ttl     = 3600

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config  { cookie_behavior = "none" }
    headers_config  { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
  }
}

# Allow CloudFront to read from S3
data "aws_iam_policy_document" "assets_bucket_policy" {
  statement {
    sid     = "AllowCloudFrontServicePrincipal"
    actions = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.assets.arn}/*"]
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.assets.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "assets" {
  bucket = aws_s3_bucket.assets.id
  policy = data.aws_iam_policy_document.assets_bucket_policy.json
}

# ── Database backup Lambda ────────────────────────────────────────────────────
# Note: RDS automated backups are handled by AWS; DocumentDB below needs manual

resource "aws_cloudwatch_event_rule" "docdb_snapshot" {
  name                = "vtt-docdb-daily-snapshot-${var.environment}"
  schedule_expression = "cron(0 2 * * ? *)"  # 02:00 UTC daily
}

# ── Outputs ───────────────────────────────────────────────────────────────────

output "docdb_endpoint" {
  description = "DocumentDB cluster endpoint"
  value       = aws_docdb_cluster.mongodb.endpoint
  sensitive   = true
}

output "assets_bucket_name" {
  description = "S3 assets bucket name"
  value       = aws_s3_bucket.assets.id
}

output "cdn_domain" {
  description = "CloudFront distribution domain"
  value       = aws_cloudfront_distribution.assets.domain_name
}

# ── Variables additions ───────────────────────────────────────────────────────

variable "docdb_instance_class" {
  description = "DocumentDB instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "docdb_instance_count" {
  description = "Number of DocumentDB instances"
  type        = number
  default     = 1
}

variable "allowed_cors_origins" {
  description = "Allowed CORS origins for S3 asset bucket"
  type        = list(string)
  default     = ["https://vtt-platform.com", "https://staging.vtt-platform.com"]
}

data "aws_caller_identity" "current" {}
