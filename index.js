// Base URL for the FakeStore API
const BASE_URL = "https://fakestoreapi.com";

/**
 * Parses command line arguments using process.argv
 * process.argv[0] = node path
 * process.argv[1] = script path
 * process.argv[2] = HTTP method (GET, POST, DELETE)
 * process.argv[3] = resource path (products, products/15)
 * process.argv[4+] = additional data for POST requests
 */
const parseArguments = () => {
  // Destructuring to extract arguments, skipping node and script paths
  const [, , method, resource, ...additionalArgs] = process.argv;

  return {
    method: method?.toUpperCase(), // Normalize method to uppercase
    resource,
    additionalArgs,
  };
};

/**
 * Extracts product ID from a resource path like "products/15"
 * Uses string methods to split and get the ID
 */
const extractProductId = (resource) => {
  // Split by "/" and get the second part (the ID)
  const parts = resource.split("/");
  return parts.length > 1 ? parts[1] : null;
};

/**
 * Displays data in a formatted way in the console
 */
const displayResponse = (data, message = "API Response:") => {
  console.log("\n" + "=".repeat(50));
  console.log(message);
  console.log("=".repeat(50));
  console.log(JSON.stringify(data, null, 2));
  console.log("=".repeat(50) + "\n");
};

/**
 * Displays an error message
 */
const displayError = (error) => {
  console.error("\n❌ Error:", error.message);
};

/**
 * Displays usage instructions
 */
const displayUsage = () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              FakeStore CLI - Usage Instructions                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Get all products:                                             ║
║    npm run start GET products                                  ║
║                                                                ║
║  Get a specific product:                                       ║
║    npm run start GET products/15                               ║
║                                                                ║
║  Create a new product:                                         ║
║    npm run start POST products <title> <price> <category>      ║
║    Example: npm run start POST products T-Shirt-Rex 300 remeras║
║                                                                ║
║  Delete a product:                                             ║
║    npm run start DELETE products/7                             ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
};

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * GET all products from the FakeStore API
 * Uses async/await with fetch
 */
const getAllProducts = async () => {
  try {
    console.log("📦 Fetching all products...");

    // Using native fetch with await
    const response = await fetch(`${BASE_URL}/products`);

    // Check if response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse JSON response
    const products = await response.json();

    // Display the products
    displayResponse(products, `📦 All Products (Total: ${products.length})`);

    // Using array methods to show a summary
    const categories = [
      ...new Set(products.map((product) => product.category)),
    ];
    console.log("📂 Available categories:", categories.join(", "));
  } catch (error) {
    displayError(error);
  }
};

/**
 * GET a specific product by ID
 * Dynamically extracts the product ID from the resource path
 */
const getProductById = async (productId) => {
  try {
    console.log(`🔍 Fetching product with ID: ${productId}...`);

    // Fetch specific product using template literal
    const response = await fetch(`${BASE_URL}/products/${productId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const product = await response.json();

    // Using destructuring to display product info
    const { id, title, price, category, description } = product;

    displayResponse(product, `🛍️ Product Details (ID: ${id})`);

    // Additional formatted output using destructured values
    console.log("Quick Summary:");
    console.log(`  • Title: ${title}`);
    console.log(`  • Price: $${price}`);
    console.log(`  • Category: ${category}`);
    console.log(`  • Description: ${description.slice(0, 100)}...`);
  } catch (error) {
    displayError(error);
  }
};

/**
 * POST - Create a new product
 * Sends product data to the API using fetch with POST method
 */
const createProduct = async (title, price, category) => {
  try {
    // Validate that all required fields are provided
    if (!title || !price || !category) {
      throw new Error(
        "Missing required fields: title, price, and category are required",
      );
    }

    console.log("➕ Creating new product...");

    // Create the product object using shorthand property names
    const productData = {
      title,
      price: Number(price), // Convert price to number
      category,
    };

    console.log("📝 Product data to send:", productData);

    // Using fetch with POST method
    const response = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      // Required headers for JSON content
      headers: {
        "Content-Type": "application/json",
      },
      // Using JSON.stringify to convert object to JSON string
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const createdProduct = await response.json();

    displayResponse(createdProduct, "✅ Product Created Successfully!");
  } catch (error) {
    displayError(error);
  }
};

/**
 * DELETE - Remove a product by ID
 * Sends a DELETE request to the API
 */
const deleteProduct = async (productId) => {
  try {
    if (!productId) {
      throw new Error("Product ID is required for deletion");
    }

    console.log(`🗑️ Deleting product with ID: ${productId}...`);

    // Using fetch with DELETE method
    const response = await fetch(`${BASE_URL}/products/${productId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    displayResponse(result, `🗑️ Product Deleted (ID: ${productId})`);
  } catch (error) {
    displayError(error);
  }
};

// =============================================================================
// MAIN ROUTER FUNCTION
// =============================================================================

/**
 * Main function that routes commands to appropriate handlers
 * Uses async/await and handles all CLI logic
 */
const main = async () => {
  // Parse command line arguments using destructuring
  const { method, resource, additionalArgs } = parseArguments();

  // Validate that method and resource are provided
  if (!method || !resource) {
    console.log("⚠️ Missing required arguments!");
    displayUsage();
    return;
  }

  console.log(`\n🚀 Executing: ${method} ${resource}`);

  // Check if resource includes a product ID (e.g., "products/15")
  const hasProductId = resource.includes("/");
  const productId = hasProductId ? extractProductId(resource) : null;

  // Route to appropriate function based on method
  switch (method) {
    case "GET":
      if (hasProductId && productId) {
        // GET specific product
        await getProductById(productId);
      } else if (resource === "products") {
        // GET all products
        await getAllProducts();
      } else {
        console.log("⚠️ Invalid GET command");
        displayUsage();
      }
      break;

    case "POST":
      if (resource === "products") {
        // Using spread operator to collect additional arguments
        // additionalArgs = [title, price, category]
        const [title, price, category] = additionalArgs;
        await createProduct(title, price, category);
      } else {
        console.log("⚠️ Invalid POST command");
        displayUsage();
      }
      break;

    case "DELETE":
      if (hasProductId && productId) {
        await deleteProduct(productId);
      } else {
        console.log("⚠️ DELETE requires a product ID (e.g., products/7)");
        displayUsage();
      }
      break;

    default:
      console.log(`⚠️ Unknown method: ${method}`);
      displayUsage();
  }
};

// =============================================================================
// RUN THE APPLICATION
// =============================================================================

// Execute the main function
main();
