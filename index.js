const BASE_URL = "https://fakestoreapi.com";

const parseArguments = () => {
  const [, , method, resource, ...additionalArgs] = process.argv;

  return {
    method: method?.toUpperCase(),
    resource,
    additionalArgs,
  };
};

const extractProductId = (resource) => {
  const parts = resource.split("/");
  return parts.length > 1 ? parts[1] : null;
};

const displayResponse = (data, message = "API Response:") => {
  console.log("\n" + "=".repeat(50));
  console.log(message);
  console.log("=".repeat(50));
  console.log(JSON.stringify(data, null, 2));
  console.log("=".repeat(50) + "\n");
};

const displayError = (error) => {
  console.error("\n Error:", error.message);
};

const displayUsage = () => {
  console.log(`

FakeStore CLI - Instrucciones de Uso:                

                                                                
~Traer todos los productos:                                             
    npm run start GET products                                  
                                                                
~Traer un producto específico:                                       
    npm run start GET products/15                               
                                                                
~Crear un nuevo producto:                                         
    npm run start POST products <title> <price> <category>      
    Example: npm run start POST products T-Shirt-Rex 300 remeras
                                                                
~Eliminar un producto:                                             
    npm run start DELETE products/7                             
                                                                

  `);
};

const getAllProducts = async () => {
  try {
    console.log(" Trayendo todos los productos...");

    const response = await fetch(`${BASE_URL}/products`);

    if (!response.ok) {
      throw new Error(`Error HTTP! Estado: ${response.status}`);
    }

    const products = await response.json();

    displayResponse(products, `📦 All Products (Total: ${products.length})`);

    const categories = [
      ...new Set(products.map((product) => product.category)),
    ];
    console.log(" Categorías disponibles:", categories.join(", "));
  } catch (error) {
    displayError(error);
  }
};

const getProductById = async (productId) => {
  try {
    console.log(` Buscando producto con ID: ${productId}...`);

    const response = await fetch(`${BASE_URL}/products/${productId}`);

    if (!response.ok) {
      throw new Error(`Error HTTP! Estado: ${response.status}`);
    }

    const product = await response.json();

    const { id, title, price, category, description } = product;

    displayResponse(product, `Detalles del Producto (ID: ${id})`);

    console.log("Resumen:");
    console.log(`  • Título: ${title}`);
    console.log(`  • Precio: $${price}`);
    console.log(`  • Categoría: ${category}`);
    console.log(`  • Descripción: ${description.slice(0, 100)}...`);
  } catch (error) {
    displayError(error);
  }
};

const createProduct = async (title, price, category) => {
  try {
    if (!title || !price || !category) {
      throw new Error(
        "Faltan campos requeridos: título, precio, y categoría son requeridos",
      );
    }

    console.log("Creando nuevo producto...");

    const productData = {
      title,
      price: Number(price),
      category,
    };

    console.log("Información del producto a enviar:", productData);

    const response = await fetch(`${BASE_URL}/products`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP! Estado: ${response.status}`);
    }

    const createdProduct = await response.json();

    displayResponse(createdProduct, "Producto Creado Exitosamente!");
  } catch (error) {
    displayError(error);
  }
};

const deleteProduct = async (productId) => {
  try {
    if (!productId) {
      throw new Error("El ID del producto es requerido para su eliminación");
    }

    console.log(`Eliminando producto por ID: ${productId}...`);

    const response = await fetch(`${BASE_URL}/products/${productId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Error HTTP! Estado: ${response.status}`);
    }

    const result = await response.json();

    displayResponse(result, `Producto Eliminado (ID: ${productId})`);
  } catch (error) {
    displayError(error);
  }
};

const main = async () => {
  const { method, resource, additionalArgs } = parseArguments();

  if (!method || !resource) {
    console.log("Faltan argumentos requeridos!");
    displayUsage();
    return;
  }

  console.log(`\n Ejecutando: ${method} ${resource}`);

  const hasProductId = resource.includes("/");
  const productId = hasProductId ? extractProductId(resource) : null;

  switch (method) {
    case "GET":
      if (hasProductId && productId) {
        await getProductById(productId);
      } else if (resource === "products") {
        await getAllProducts();
      } else {
        console.log(" Comando GET inválido");
        displayUsage();
      }
      break;

    case "POST":
      if (resource === "products") {
        const [title, price, category] = additionalArgs;
        await createProduct(title, price, category);
      } else {
        console.log(" Comando POST inválido");
        displayUsage();
      }
      break;

    case "DELETE":
      if (hasProductId && productId) {
        await deleteProduct(productId);
      } else {
        console.log(
          " Comando DELETE requiere un ID del producto (ej: products/7)",
        );
        displayUsage();
      }
      break;

    default:
      console.log(` Método desconocido: ${method}`);
      displayUsage();
  }
};

main();
