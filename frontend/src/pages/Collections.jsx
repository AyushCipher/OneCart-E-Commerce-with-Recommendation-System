import React, { useContext, useEffect, useState } from 'react'
import { FaChevronRight } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import Title from '../component/Title';
import { shopDataContext } from '../context/ShopContext';
import Card from '../component/Card';

function Collections() {

  let [showFilter, setShowFilter] = useState(false)
  let { products, search, showSearch } = useContext(shopDataContext)
  let [filterProduct, setFilterProduct] = useState([])
  let [category, setCategory] = useState([])
  let [subCategory, setSubCategory] = useState([])
  let [sortType, setSortType] = useState("relavent")

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory(prev => prev.filter(item => item !== e.target.value))
    } else {
      setCategory(prev => [...prev, e.target.value])
    }
  }

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev => prev.filter(item => item !== e.target.value))
    } else {
      setSubCategory(prev => [...prev, e.target.value])
    }
  }

  const applyFilter = () => {
    let productCopy = products.slice()

    if (showSearch && search) {
      productCopy = productCopy.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()))
    }

    if (category.length > 0) {
      productCopy = productCopy.filter(item => category.includes(item.category))
    }

    if (subCategory.length > 0) {
      productCopy = productCopy.filter(item => subCategory.includes(item.subCategory))
    }

    setFilterProduct(productCopy)
  }

  const sortProducts = () => {
    let fbCopy = filterProduct.slice()

    switch (sortType) {
      case 'low-high':
        setFilterProduct(fbCopy.sort((a, b) => (a.price - b.price)))
        break;

      case 'high-low':
        setFilterProduct(fbCopy.sort((a, b) => (b.price - a.price)))
        break;

      default:
        applyFilter()
        break;
    }
  }

  useEffect(() => {
    sortProducts()
  }, [sortType])

  useEffect(() => {
    setFilterProduct(products)
  }, [products])

  useEffect(() => {
    applyFilter()
  }, [category, subCategory, search, showSearch])

  return (
    <div className='w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] flex items-start flex-col md:flex-row justify-start pt-[70px] overflow-x-hidden pb-[130px]'>
      
      {/* SIDEBAR FILTER */}
      <div className={`
        md:w-[260px] lg:w-[220px] flex-shrink-0
        w-full md:min-h-screen p-5
        border-b md:border-b-0 md:border-r border-gray-600
        text-[#aaf5fa]
        lg:fixed lg:top-[70px] lg:left-0 lg:h-[calc(100vh-70px)] lg:overflow-y-auto
        transition-all duration-300
        ${showFilter ? "h-auto pb-8" : "h-[60px] overflow-hidden md:overflow-visible md:h-auto"}
      `}>
        <p
          className='text-[22px] font-semibold flex gap-2 items-center justify-start cursor-pointer select-none'
          onClick={() => setShowFilter(prev => !prev)}
        >
          FILTERS
          {!showFilter && <FaChevronRight className='text-[16px] md:hidden' />}
          {showFilter && <FaChevronDown className='text-[16px] md:hidden' />}
        </p>

        {/* CATEGORY FILTER */}
        <div className={`border-2 border-[#dedcdc] pl-5 py-3 mt-6 rounded-md bg-slate-600 ${showFilter ? "block" : "hidden"} md:block`}>
          <p className='text-[16px] text-[#f8fafa] font-semibold mb-2'>CATEGORIES</p>
          <div className='flex flex-col gap-2'>
            {['Men', 'Women', 'Kids'].map(cat => (
              <label key={cat} className='flex items-center gap-3 cursor-pointer'>
                <input type="checkbox" value={cat} className='w-3 h-3 accent-cyan-400' onChange={toggleCategory} />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* SUBCATEGORY FILTER */}
        <div className={`border-2 border-[#dedcdc] pl-5 py-3 mt-4 rounded-md bg-slate-600 ${showFilter ? "block" : "hidden"} md:block`}>
          <p className='text-[16px] text-[#f8fafa] font-semibold mb-2'>SUB-CATEGORIES</p>
          <div className='flex flex-col gap-2'>
            {['TopWear', 'BottomWear', 'WinterWear', 'FootWear'].map(sub => (
              <label key={sub} className='flex items-center gap-3 cursor-pointer'>
                <input type="checkbox" value={sub} className='w-3 h-3 accent-cyan-400' onChange={toggleSubCategory} />
                <span>{sub}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCT DISPLAY */}
      <div className='flex-1 min-w-0 lg:ml-[220px] w-full px-4 md:px-6 lg:px-8'>
        
        {/* TOP BAR */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pt-2'>
          <Title text1={"ALL"} text2={"COLLECTIONS"} />
          <select
            className='bg-slate-600 w-[200px] h-[44px] px-3 text-white rounded-lg border-2 border-slate-500 hover:border-[#46d1f7] transition-colors focus:outline-none focus:border-[#46d1f7]'
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="relavent">Sort By: Relevant</option>
            <option value="low-high">Sort By: Low to High</option>
            <option value="high-low">Sort By: High to Low</option>
          </select>
        </div>

        {/* GRID */}
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-8'>
          {filterProduct.map((item, index) => (
            <Card
              key={index}
              id={item._id}
              name={item.name}
              price={item.price}
              image={item.image1}
              rating={item.ratings}
              reviewCount={item.numOfReviews}
            />
          ))}
        </div>

        {/* EMPTY STATE */}
        {filterProduct.length === 0 && (
          <div className='flex flex-col items-center justify-center h-64 text-gray-400'>
            <p className='text-xl'>No products found</p>
            <p className='text-sm mt-2'>Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Collections