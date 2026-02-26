import React from 'react';

export default function ProductItem({ product, onEdit, onDelete }) {
  return (
    <div className="product-card">
      <div className="product-card__main">
        <span className="product-card__id">#{product.id.slice(0, 4)}</span>
        <strong className="product-card__name">{product.name}</strong>
        <span className="product-card__category">{product.category}</span>
        <span className="product-card__price">{product.price} ₽</span>
        <span className="product-card__stock">{product.stock} шт</span>
      </div>
      <div className="product-card__actions">
        <button className="btn btn--edit" onClick={() => onEdit(product)}>✎</button>
        <button className="btn btn--delete" onClick={() => onDelete(product.id)}>🗑</button>
      </div>
    </div>
  );
}
