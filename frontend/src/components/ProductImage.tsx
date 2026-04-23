import type { ReactNode } from "react";
import type { Product } from "../storefront/types";

interface ProductImageProps {
  product: Product;
  className?: string;
  imageClassName?: string;
  overlayClassName?: string;
  children?: ReactNode;
  loading?: "eager" | "lazy";
}

export default function ProductImage({
  product,
  className = "",
  imageClassName = "",
  overlayClassName = "bg-gradient-to-b from-slate-950/10 via-slate-950/5 to-slate-950/70",
  children,
  loading = "lazy",
}: ProductImageProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`.trim()}
      style={{ background: product.coverGradient }}
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.title}
          loading={loading}
          className={`absolute inset-0 h-full w-full object-cover ${imageClassName}`.trim()}
        />
      ) : null}
      <div className={`absolute inset-0 ${overlayClassName}`.trim()} />
      {children ? <div className="relative z-10 h-full">{children}</div> : null}
    </div>
  );
}
