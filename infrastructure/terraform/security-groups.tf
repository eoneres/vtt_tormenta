locals {
  eks_node_sg_id = module.eks.node_security_group_id
}

# ─── RDS PostgreSQL ───────────────────────────────────────────────────────────

resource "aws_security_group" "rds" {
  name        = "vtt-rds-${var.environment}"
  description = "Allow PostgreSQL access from EKS nodes only"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "PostgreSQL from EKS nodes"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [local.eks_node_sg_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "vtt-rds-${var.environment}"
  }
}

# ─── ElastiCache Redis ────────────────────────────────────────────────────────

resource "aws_security_group" "redis" {
  name        = "vtt-redis-${var.environment}"
  description = "Allow Redis access from EKS nodes only"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "Redis from EKS nodes"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [local.eks_node_sg_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "vtt-redis-${var.environment}"
  }
}

# ─── ElastiCache Subnet Group ─────────────────────────────────────────────────

resource "aws_elasticache_subnet_group" "redis" {
  name       = "vtt-redis-${var.environment}"
  subnet_ids = module.vpc.private_subnets
}
