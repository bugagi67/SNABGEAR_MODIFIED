export interface Product {
  id: string;
  sku: string;
  title: string;
  specs: string[];
  price: number; // РРЦ in RUB
  stock: number; // Остатки
  image: string | null; // e.g. "/images/products/1112031.png" or null
}

export interface CartItem {
  product: Product;
  quantity: number;
}
