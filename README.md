# FakeStore CLI

Aplicación desarrollada con Node.js para gestionar productos utilizando la API FakeStore.

## Comandos

### Obtener todos los productos

Estructura:
npm run start GET products

---

### Obtener un producto específico

Estructura:
npm run start GET products/<productId>

Ejemplo:
npm run start GET products/15

---

### Crear un producto

Estructura:
npm run start POST products <title> <price> <category>

Ejemplo:
npm run start POST products T-Shirt-Rex 300 remeras

---

### Eliminar un producto

Estructura:
npm run start DELETE products/<productId>

Ejemplo:
npm run start DELETE products/7
