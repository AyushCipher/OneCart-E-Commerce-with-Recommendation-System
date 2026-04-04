import React from 'react'
import LatestCollection from '../component/LatestCollection'
import BestSeller from '../component/BestSeller'

function Product() {
  return (
    <div className='w-full bg-gradient-to-l from-[#141414] to-[#0c2025] flex flex-col items-center justify-start py-8 sm:py-12 md:py-16 lg:py-20 px-2 sm:px-4'>
        {/* Latest Collection Section */}
        <div className='w-full max-w-7xl flex items-center justify-center flex-col mb-12 sm:mb-16 md:mb-20 lg:mb-24'>
            <LatestCollection/>
        </div>
        
        {/* Best Seller Section */}
        <div className='w-full max-w-7xl flex items-center justify-center flex-col'>
            <BestSeller/>
        </div>
    </div>
  )
}

export default Product
