import React, { useContext, useEffect, useState } from 'react'
import Title from './Title'
import { shopDataContext } from '../context/ShopContext'
import Card from './Card'

function LatestCollection() {
    let {products} = useContext(shopDataContext)
    let [latestProducts,setLatestProducts] = useState([])

    useEffect(()=>{
      setLatestProducts(products.slice(0,8));
    },[products])

  return (
    <div>
      <div className='h-[8%] w-[100%] text-center md:mt-[50px]  '>
        <Title text1={"LATEST"} text2={"COLLECTIONS"}/>
        <p className='w-[100%] m-auto text-[13px] md:text-[20px] px-[10px] text-blue-100 '>Step Into Style – New Collection Dropping This Season!</p>
      </div>
      <div className='w-[100%] mt-[30px] px-2 sm:px-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 place-items-center'>
          {
              latestProducts.map((item,index)=>(
                  <Card key={index} name={item.name} image={item.image1} id={item._id} price={item.price} rating={item.ratings} reviewCount={item.numOfReviews}/>
              ))
          }
        </div>
      </div>
    </div>
  )
}

export default LatestCollection
