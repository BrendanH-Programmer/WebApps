output "vm_public_ip" {
  value       = azurerm_public_ip.main.ip_address
  description = "Public IP address of the deployed VM"
}