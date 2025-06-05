variable "resource_group_name" {
  default = "hospital-room-management-rg"
}

variable "location" {
  default = "UK South"
}

variable "vm_admin_username" {
  default = "azureuser"
}

variable "ssh_public_key_path" {
  description = "Path to your SSH public key"
  default     = "~/.ssh/id_rsa.pub"
}

variable "github_repo" {
  description = "GitHub repo to clone"
  default     = "https://github.com/BrendanH-Programmer/WebApps.git"
}