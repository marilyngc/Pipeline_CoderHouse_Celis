variable "namespace" {
  type    = string
  default = "demo"
}

variable "app_name" {
  type    = string
  default = "demo-app"
}

variable "app_image" {
  description = "Debe coincidir con app_image usado en 01-infra (el que cargaste con kind load docker-image)"
  type        = string
  default     = "demo-app:dev"
}

variable "replicas" {
  type    = number
  default = 2
}

variable "container_port" {
  type    = number
  default = 3000
}
