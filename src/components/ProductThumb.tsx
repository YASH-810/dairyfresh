import Image from "next/image";
import ProductArt, { productArtBg } from "@/components/ProductArt";
import type { Product } from "@/lib/types";

/**
 * Product image, everywhere a product shows up: real photo (from public/product) when the
 * product has one, otherwise the hand-drawn category icon. `className` sizes/rounds the
 * container; `iconClassName` sizes the fallback icon within it.
 */
export default function ProductThumb({
  product,
  className = "h-full w-full",
  iconClassName = "h-1/2 w-1/2",
  sizes = "200px",
}: {
  product: Pick<Product, "imageUrl" | "category" | "name">;
  className?: string;
  iconClassName?: string;
  sizes?: string;
}) {
  if (product.imageUrl) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-b from-slate-50 to-white ${className}`}>
        <Image src={product.imageUrl} alt={product.name} fill sizes={sizes} className="object-contain p-2" />
      </div>
    );
  }
  return (
    <div className={`flex items-center justify-center overflow-hidden ${productArtBg(product.category)} ${className}`}>
      <ProductArt category={product.category} className={iconClassName} />
    </div>
  );
}
