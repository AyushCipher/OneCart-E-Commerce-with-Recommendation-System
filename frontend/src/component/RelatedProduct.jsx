import React, { useContext, useEffect, useState } from "react";
import { shopDataContext } from "../context/ShopContext";
import Title from "./Title";
import Card from "./Card";

function RelatedProduct({ category, subCategory, currentProductId }) {
  const { products } = useContext(shopDataContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const list = products
        .filter((p) => p.category === category)
        .filter((p) => p.subCategory === subCategory)
        .filter((p) => p._id !== currentProductId);

      setRelated(list.slice(0, 4));
    }
  }, [products, category, subCategory, currentProductId]);

  return (
    <div className="mt-20 pb-16 px-4 md:px-12 lg:px-20">
      <div className="text-center mb-10">
        <Title text1="RELATED" text2="PRODUCTS" />
        <div className="mx-auto w-20 h-[3px] bg-blue-400 rounded mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 place-items-center">
        {related.map((item, index) => (
          <Card
            key={index}
            id={item._id}
            name={item.name}
            price={item.price}
            image={item.image1}
            rating={item.ratings}
          />
        ))}
      </div>
    </div>
  );
}

export default RelatedProduct;
