module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.7"

  name = "${var.cluster_name}-${var.environment}"
  cidr = var.vpc_cidr

  # sa-east-1 availability zones
  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway     = true
  single_nat_gateway     = var.environment == "staging"
  one_nat_gateway_per_az = var.environment == "production"

  enable_dns_hostnames = true
  enable_dns_support   = true

  # Required tags for EKS
  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
  }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.8"

  cluster_name    = "${var.cluster_name}-${var.environment}"
  cluster_version = var.cluster_version

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true

  # Managed node groups
  eks_managed_node_groups = {
    general = {
      instance_types = var.node_group_instance_types
      min_size       = var.node_group_min_size
      max_size       = var.node_group_max_size
      desired_size   = var.node_group_desired_size

      labels = {
        role = "general"
      }

      taints = []
    }

    realtime = {
      instance_types = ["c5.xlarge", "c5.2xlarge"]
      min_size       = 1
      max_size       = 5
      desired_size   = 2

      labels = {
        role = "realtime"
      }

      taints = [
        {
          key    = "dedicated"
          value  = "realtime"
          effect = "NO_SCHEDULE"
        }
      ]
    }
  }

  # Enable IRSA
  enable_irsa = true

  cluster_addons = {
    coredns                = { most_recent = true }
    kube-proxy             = { most_recent = true }
    vpc-cni                = { most_recent = true }
    aws-ebs-csi-driver     = { most_recent = true }
  }
}

# RDS PostgreSQL
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.5"

  identifier = "vtt-postgres-${var.environment}"

  engine               = "postgres"
  engine_version       = "16.2"
  instance_class       = var.postgres_instance_class
  allocated_storage    = var.postgres_allocated_storage
  max_allocated_storage = var.postgres_allocated_storage * 3

  db_name  = "vtt_identity"
  username = "vtt"
  port     = "5432"

  multi_az               = var.environment == "production"
  db_subnet_group_name   = module.vpc.database_subnet_group
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = var.environment == "production" ? 30 : 7
  deletion_protection     = var.environment == "production"

  storage_encrypted = true
  performance_insights_enabled = true

  parameters = [
    { name = "log_connections", value = "1" },
    { name = "log_disconnections", value = "1" },
    { name = "log_duration", value = "1" },
  ]
}

# ElastiCache Redis
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "vtt-redis-${var.environment}"
  description          = "VTT Platform Redis Cluster"

  node_type            = var.redis_node_type
  num_cache_clusters   = var.redis_num_cache_nodes
  port                 = 6379

  subnet_group_name  = aws_elasticache_subnet_group.redis.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  automatic_failover_enabled = var.environment == "production"
  multi_az_enabled           = var.environment == "production"

  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "slow-log"
  }
}

resource "aws_cloudwatch_log_group" "redis" {
  name              = "/vtt/redis/${var.environment}"
  retention_in_days = 30
}
