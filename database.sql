CREATE DATABASE IF NOT EXISTS api_practica;
USE api_practica;

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL
);

INSERT INTO productos (nombre, precio) VALUES 
('Laptop Gamer', 15500.00),
('Mouse Inalámbrico', 450.00),
('Teclado Mecánico', 1200.00);