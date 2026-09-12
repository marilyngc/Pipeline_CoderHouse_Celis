variable "network_name" {
  type    = string
  default = "demo-net"
}

variable "enable_registry" {
  type    = bool
  default = false
}

variable "cluster_name" {
  type    = string
  default = "demo-cluster"
}

variable "worker_count" {
  type    = number
  default = 2
}

variable "node_image" {
  type    = string
  default = "kindest/node:v1.31.0"
}

variable "kubeconfig_path" {
  type    = string
  default = "~/.kube/kind-demo-cluster.yaml"
}

variable "app_image" {
  description = "Imagen local (name:tag) a cargar en el cluster. Debe coincidir con lo que construiste con docker build."
  type        = string
  default     = "demo-app:dev"
}
