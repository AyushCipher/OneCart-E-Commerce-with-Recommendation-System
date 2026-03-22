import React, { useContext } from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import upload from '../assets/upload image.jpg'
import { useState, useEffect } from 'react'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../component/Loading'

function Add() {
  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Men")
  const [price, setPrice] = useState("")
  const [subCategory, setSubCategory] = useState("TopWear")
  const [bestseller, setBestSeller] = useState(false)
  const [sizes, setSizes] = useState([])
  const [loading, setLoading] = useState(false)

  let { serverUrl } = useContext(authDataContext)

  // Reset sizes when changing sub-category
  useEffect(() => {
    setSizes([])
  }, [subCategory])

  const handleAddProduct = async (e) => {
    setLoading(true)
    e.preventDefault()
    try {
      let formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subCategory", subCategory)
      formData.append("bestseller", bestseller)
      formData.append("sizes", JSON.stringify(sizes))
      formData.append("image1", image1)
      formData.append("image2", image2)
      formData.append("image3", image3)
      formData.append("image4", image4)

      let result = await axios.post(
        serverUrl + "/api/product/addproduct",
        formData,
        { withCredentials: true }
      )

      toast.success("Added Product Successfully")
      setLoading(false)

      if (result.data) {
        setName("")
        setDescription("")
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setPrice("")
        setBestSeller(false)
        setCategory("Men")
        setSubCategory("TopWear")
      }

    } catch (error) {
      console.log(error)
      setLoading(false)
      toast.error("Add Product Failed")
    }
  }

  // FIX: Replace eval() with explicit image state array — safe and readable
  const imageStates = [
    { val: image1, setter: setImage1, id: 'image1' },
    { val: image2, setter: setImage2, id: 'image2' },
    { val: image3, setter: setImage3, id: 'image3' },
    { val: image4, setter: setImage4, id: 'image4' },
  ]

  return (
    <div className='w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] text-white'>
      <Nav />
      <Sidebar />

      <div className='w-[82%] h-[100%] flex items-center justify-start overflow-x-hidden absolute right-0 bottom-[5%]'>
        <form
          onSubmit={handleAddProduct}
          className='w-[100%] md:w-[90%] h-[100%] mt-[70px] flex flex-col gap-[30px] py-[90px] px-[30px] md:px-[60px]'
        >
          <div className='w-[300px] h-[50px] text-[25px] md:text-[40px] text-white'>Add Products</div>

          {/* IMAGE UPLOAD — FIX: no eval(), uses imageStates array */}
          <div className='w-[80%] h-[130px] flex items-start justify-center flex-col mt-[20px] pb-[20px] gap-[10px]'>
            <p className='text-[20px] md:text-[25px] font-semibold'>Upload Images</p>
            <div className='w-[100%] h-[100%] flex items-center justify-start'>
              {imageStates.map(({ val, setter, id }) => (
                <label
                  key={id}
                  htmlFor={id}
                  className='w-[65px] h-[65px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-[#46d1f7]'
                >
                  <img
                    src={!val ? upload : URL.createObjectURL(val)}
                    alt=""
                    className='w-[80%] h-[80%] rounded-lg shadow-2xl border-[2px]'
                  />
                  <input
                    type="file"
                    id={id}
                    hidden
                    required
                    onChange={(e) => setter(e.target.files[0])}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* NAME */}
          <div className='w-[80%] h-[100px] flex items-start justify-center flex-col gap-[10px]'>
            <p className='text-[20px] md:text-[25px] font-semibold'>Product Name</p>
            <input
              type="text"
              placeholder='Type here'
              className='w-[600px] max-w-[98%] h-[40px] rounded-lg hover:border-[#46d1f7] border-[2px] bg-slate-600 px-[20px] text-[18px] placeholder:text-[#ffffffc2]'
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className='w-[80%] flex items-start justify-center flex-col gap-[10px]'>
            <p className='text-[20px] md:text-[25px] font-semibold'>Product Description</p>
            <textarea
              placeholder='Type here'
              className='w-[600px] max-w-[98%] h-[100px] rounded-lg hover:border-[#46d1f7] border-[2px] bg-slate-600 px-[20px] py-[10px] text-[18px] placeholder:text-[#ffffffc2]'
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
            />
          </div>

          {/* CATEGORY & SUB-CATEGORY */}
          <div className='w-[80%] flex items-center gap-[10px] flex-wrap'>
            <div className='md:w-[30%] w-[100%] flex flex-col gap-[10px]'>
              <p className='text-[20px] md:text-[25px] font-semibold w-[100%]'>Product Category</p>
              <select
                className='bg-slate-600 w-[60%] px-[10px] py-[7px] rounded-lg hover:border-[#46d1f7] border-[2px]'
                onChange={(e) => setCategory(e.target.value)}
                value={category}
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            <div className='md:w-[30%] w-[100%] flex flex-col gap-[10px]'>
              <p className='text-[20px] md:text-[25px] font-semibold w-[100%]'>Sub-Category</p>
              <select
                className='bg-slate-600 w-[60%] px-[10px] py-[7px] rounded-lg hover:border-[#46d1f7] border-[2px]'
                onChange={(e) => setSubCategory(e.target.value)}
                value={subCategory}
              >
                <option value="TopWear">TopWear</option>
                <option value="BottomWear">BottomWear</option>
                <option value="WinterWear">WinterWear</option>
                <option value="FootWear">FootWear</option>
              </select>
            </div>
          </div>

          {/* PRICE */}
          <div className='w-[80%] h-[100px] flex flex-col gap-[10px]'>
            <p className='text-[20px] md:text-[25px] font-semibold'>Product Price</p>
            <input
              type="number"
              placeholder='₹ 2000'
              className='w-[600px] max-w-[98%] h-[40px] rounded-lg hover:border-[#46d1f7] border-[2px] bg-slate-600 px-[20px] text-[18px] placeholder:text-[#ffffffc2]'
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
            />
          </div>

          {/* DYNAMIC SIZES */}
          <div className='w-[80%] flex flex-col gap-[10px] py-[10px]'>
            <p className='text-[20px] md:text-[25px] font-semibold'>Product Size</p>
            <div className='flex items-center gap-[15px] flex-wrap'>
              {subCategory === "FootWear"
                ? [6, 7, 8, 9, 10].map((num) => (
                  <div
                    key={num}
                    className={`px-[20px] py-[7px] rounded-lg text-[18px] border-[2px] cursor-pointer ${
                      sizes.includes(num)
                        ? "bg-green-400 text-black border-[#46d1f7]"
                        : "bg-slate-600 text-white"
                    }`}
                    onClick={() =>
                      setSizes((prev) =>
                        prev.includes(num)
                          ? prev.filter((i) => i !== num)
                          : [...prev, num]
                      )
                    }
                  >
                    {num}
                  </div>
                ))
                : ["S", "M", "L", "XL", "XXL"].map((size) => (
                  <div
                    key={size}
                    className={`px-[20px] py-[7px] rounded-lg text-[18px] border-[2px] cursor-pointer ${
                      sizes.includes(size)
                        ? "bg-green-400 text-black border-[#46d1f7]"
                        : "bg-slate-600 text-white"
                    }`}
                    onClick={() =>
                      setSizes((prev) =>
                        prev.includes(size)
                          ? prev.filter((i) => i !== size)
                          : [...prev, size]
                      )
                    }
                  >
                    {size}
                  </div>
                ))}
            </div>
          </div>

          {/* BESTSELLER CHECKBOX */}
          <div className='w-[80%] flex items-center gap-[10px] mt-[20px]'>
            <input
              type="checkbox"
              id='checkbox'
              className='w-[25px] h-[25px] cursor-pointer'
              checked={bestseller}
              onChange={() => setBestSeller(prev => !prev)}
            />
            <label htmlFor="checkbox" className='text-[18px] md:text-[22px] font-semibold'>
              Add to BestSeller
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <button className='w-[140px] px-[20px] py-[20px] rounded-xl bg-[#65d8f7] flex items-center justify-center gap-[10px] text-black active:bg-slate-700 active:text-white active:border-[2px] border-white'>
            {loading ? <Loading /> : "Add Product"}
          </button>

        </form>
      </div>
    </div>
  )
}

export default Add