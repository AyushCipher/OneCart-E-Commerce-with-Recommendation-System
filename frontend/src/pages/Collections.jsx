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
    <div className='w-[99vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] flex items-start flex-col md:flex-row justify-start pt-[70px] overflow-x-hidden z-[2] pb-[130px]'>
      <div className={`md:w-[30vw] lg:w-[20vw] w-[100vw] md:min-h-[100vh] p-[20px] border-r-[1px] border-gray-400 text-[#aaf5fa] lg:fixed transition-all duration-300  ${showFilter ? "h-auto pb-8" : "h-[8vh]"}`}>
        <p
          className='text-[25px] font-semibold flex gap-[5px] items-center justify-start cursor-pointer'
          onClick={() => setShowFilter(prev => !prev)}
        >
          FILTERS
          {!showFilter && <FaChevronRight className='text-[18px] md:hidden' />}
          {showFilter && <FaChevronDown className='text-[18px] md:hidden' />}
        </p>

        {/* CATEGORY FILTER */}
        <div className={`border-[2px] border-[#dedcdc] pl-5 py-3 mt-6 rounded-md bg-slate-600 ${showFilter ? "" : "hidden"} md:block`}>
          <p className='text-[18px] text-[#f8fafa]'>CATEGORIES</p>
          <div className='w-[230px] h-[120px] flex items-start justify-center gap-[10px] flex-col'>
            <p className='flex items-center gap-[10px]'>
              <input type="checkbox" value={'Men'} className='w-3' onChange={toggleCategory} /> Men
            </p>
            <p className='flex items-center gap-[10px]'>
              <input type="checkbox" value={'Women'} className='w-3' onChange={toggleCategory} /> Women
            </p>
            <p className='flex items-center gap-[10px]'>
              <input type="checkbox" value={'Kids'} className='w-3' onChange={toggleCategory} /> Kids
            </p>
          </div>
        </div>

        {/* SUBCATEGORY FILTER */}
        <div className={`border-[2px] border-[#dedcdc] pl-5 py-3 mt-6 rounded-md bg-slate-600 ${showFilter ? "" : "hidden"} md:block`}>
          <p className='text-[18px] text-[#f8fafa]'>SUB-CATEGORIES</p>
          <div className='w-[230px] h-[160px] flex items-start justify-center gap-[10px] flex-col'>
            <p className='flex items-center gap-[10px]'>
              <input type="checkbox" value={'TopWear'} className='w-3' onChange={toggleSubCategory} /> TopWear
            </p>
            <p className='flex items-center gap-[10px]'>
              <input type="checkbox" value={'BottomWear'} className='w-3' onChange={toggleSubCategory} /> BottomWear
            </p>
            <p className='flex items-center gap-[10px]'>
              <input type="checkbox" value={'WinterWear'} className='w-3' onChange={toggleSubCategory} /> WinterWear
            </p>
            <p className='flex items-center gap-[10px]'>
              <input type="checkbox" value={'FootWear'} className='w-3' onChange={toggleSubCategory} /> FootWear
            </p>
          </div>
        </div>
      </div>

      {/* PRODUCT DISPLAY */}
      <div className='lg:pl-[20%] md:py-[10px]'>
        <div className='md:w-[80vw] w-[100vw] flex justify-between flex-col lg:flex-row lg:px-[50px] pl-5'>
          <Title text1={"ALL"} text2={"COLLECTIONS"} />

          <select
            className='bg-slate-600 w-[60%] md:w-[200px] h-[50px] px-[10px] text-[white] rounded-lg hover:border-[#46d1f7] border-[2px]'
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="relavent">Sort By: Relevant</option>
            <option value="low-high">Sort By: Low to High</option>
            <option value="high-low">Sort By: High to Low</option>
          </select>
        </div>

        <div className='lg:w-[80vw] md:w-[60vw] w-[100vw] min-h-[70vh] flex items-center justify-center flex-wrap gap-[30px] mt-7'>
          {
            filterProduct.map((item, index) => (
              <Card key={index} id={item._id} name={item.name} price={item.price} image={item.image1} rating={item.ratings} reviewCount={item.numOfReviews} />
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Collections