import React, { useEffect, useState, useContext } from 'react';
import Nav from '../component/Nav';
import Sidebar from '../component/Sidebar';
import upload from '../assets/upload image.jpg';
import { useParams, useNavigate } from 'react-router-dom';
import { authDataContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../component/Loading';

function Edit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Men");
  const [price, setPrice] = useState("");
  const [subCategory, setSubCategory] = useState("TopWear");
  const [bestseller, setBestSeller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { serverUrl } = useContext(authDataContext);

  // FIX 1: Reset sizes when subCategory changes (matches Add.jsx behavior)
  useEffect(() => {
    setSizes([]);
  }, [subCategory]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const result = await axios.get(`${serverUrl}/api/product/${id}`);
        const product = result.data;
        setName(product.name);
        setDescription(product.description);
        setCategory(product.category);
        setPrice(product.price);
        setSubCategory(product.subCategory);
        setBestSeller(product.bestseller);
        setSizes(product.sizes || []);
        setImage1(product.image1);
        setImage2(product.image2);
        setImage3(product.image3);
        setImage4(product.image4);
      } catch (error) {
        toast.error("Failed to fetch product");
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id, serverUrl]);

  const handleEditProduct = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      let formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
      if (image1 && typeof image1 !== 'string') formData.append("image1", image1);
      if (image2 && typeof image2 !== 'string') formData.append("image2", image2);
      if (image3 && typeof image3 !== 'string') formData.append("image3", image3);
      if (image4 && typeof image4 !== 'string') formData.append("image4", image4);

      let result = await axios.post(`${serverUrl}/api/product/edit/${id}`, formData, { withCredentials: true });
      toast.success("Product updated successfully");
      setLoading(false);
      navigate('/lists');
    } catch (error) {
      setLoading(false);
      toast.error("Edit Product Failed");
    }
  };

  // FIX 2: Helper to get image src without eval()
  const getImageSrc = (img) => {
    if (!img) return upload;
    if (typeof img === 'string') return img;
    return URL.createObjectURL(img);
  };

  const imageStates = [
    { val: image1, setter: setImage1, id: 'image1' },
    { val: image2, setter: setImage2, id: 'image2' },
    { val: image3, setter: setImage3, id: 'image3' },
    { val: image4, setter: setImage4, id: 'image4' },
  ];

  return (
    <div className='w-[100vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] text-[white] overflow-x-hidden relative'>
      <Nav />
      <Sidebar />

      <div className='w-[82%] h-[100%] flex items-center justify-start overflow-x-hidden absolute right-0 bottom-[5%]'>
        {loading ? <Loading /> : (
          <form onSubmit={handleEditProduct} className='w-[100%] md:w-[90%] h-[100%] mt-[70px] flex flex-col gap-[30px] py-[90px] px-[30px] md:px-[60px]'>

            <div className='w-[300px] h-[50px] text-[25px] md:text-[40px] text-white'>Edit Product Page</div>

            {/* FIX 3: Image upload section with pb-[20px] to prevent clipping */}
            <div className='w-[80%] h-[130px] flex items-start justify-center flex-col mt-[20px] pb-[20px] gap-[10px]'>
              <p className='text-[20px] md:text-[25px] font-semibold'>Upload Images</p>
              <div className='w-[100%] h-[100%] flex items-center justify-start'>
                {imageStates.map(({ val, setter, id }) => (
                  <label key={id} htmlFor={id} className='w-[65px] h-[65px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-[#46d1f7]'>
                    <img
                      src={getImageSrc(val)}
                      alt=''
                      className='w-[80%] h-[80%] rounded-lg shadow-2xl hover:border-[#1d1d1d] border-[2px]'
                    />
                    <input
                      type="file"
                      id={id}
                      hidden
                      onChange={(e) => setter(e.target.files[0])}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* FIX 4: Styled Product Name input matching Add.jsx */}
            <div className='w-[80%] h-[100px] flex items-start justify-center flex-col gap-[10px]'>
              <p className='text-[20px] md:text-[25px] font-semibold'>Product Name</p>
              <input
                type='text'
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='Type here'
                className='w-[600px] max-w-[98%] h-[40px] rounded-lg hover:border-[#46d1f7] border-[2px] cursor-pointer bg-slate-600 px-[20px] text-[18px] placeholder:text-[#ffffffc2]'
                required
              />
            </div>

            {/* FIX 4: Styled Description textarea matching Add.jsx */}
            <div className='w-[80%] flex items-start justify-center flex-col gap-[10px]'>
              <p className='text-[20px] md:text-[25px] font-semibold'>Product Description</p>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='Type here'
                className='w-[600px] max-w-[98%] h-[100px] rounded-lg hover:border-[#46d1f7] border-[2px] cursor-pointer bg-slate-600 px-[20px] py-[10px] text-[18px] placeholder:text-[#ffffffc2]'
                required
              />
            </div>

            {/* FIX 5: Styled Category & SubCategory selects matching Add.jsx */}
            <div className='w-[80%] flex items-center gap-[10px] flex-wrap'>
              <div className='md:w-[30%] w-[100%] flex items-start sm:justify-center flex-col gap-[10px]'>
                <p className='text-[20px] md:text-[25px] font-semibold w-[100%]'>Product Category</p>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className='bg-slate-600 w-[60%] px-[10px] py-[7px] rounded-lg hover:border-[#46d1f7] border-[2px]'
                >
                  <option value='Men'>Men</option>
                  <option value='Women'>Women</option>
                  <option value='Kids'>Kids</option>
                </select>
              </div>

              <div className='md:w-[30%] w-[100%] flex items-start sm:justify-center flex-col gap-[10px]'>
                <p className='text-[20px] md:text-[25px] font-semibold w-[100%]'>Sub-Category</p>
                <select
                  value={subCategory}
                  onChange={e => setSubCategory(e.target.value)}
                  className='bg-slate-600 w-[60%] px-[10px] py-[7px] rounded-lg hover:border-[#46d1f7] border-[2px]'
                >
                  <option value='TopWear'>TopWear</option>
                  <option value='BottomWear'>BottomWear</option>
                  <option value='WinterWear'>WinterWear</option>
                  <option value='FootWear'>FootWear</option>
                </select>
              </div>
            </div>

            {/* FIX 4: Styled Price input matching Add.jsx */}
            <div className='w-[80%] h-[100px] flex items-start justify-center flex-col gap-[10px]'>
              <p className='text-[20px] md:text-[25px] font-semibold'>Product Price</p>
              <input
                type='number'
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder='₹ 2000'
                className='w-[600px] max-w-[98%] h-[40px] rounded-lg hover:border-[#46d1f7] border-[2px] cursor-pointer bg-slate-600 px-[20px] text-[18px] placeholder:text-[#ffffffc2]'
                required
              />
            </div>

            {/* FIX 6: Toggle button size selector + FIX 7: Dynamic FootWear numeric sizes */}
            <div className='w-[80%] flex flex-col gap-[10px] py-[10px]'>
              <p className='text-[20px] md:text-[25px] font-semibold'>Product Size</p>
              <div className='flex items-center justify-start gap-[15px] flex-wrap'>
                {subCategory === "FootWear"
                  ? [6, 7, 8, 9, 10].map((num) => (
                    <div
                      key={num}
                      className={`px-[20px] py-[7px] rounded-lg text-[18px] hover:border-[#46d1f7] border-[2px] cursor-pointer ${
                        sizes.includes(num)
                          ? "bg-green-400 text-black border-[#46d1f7]"
                          : "bg-slate-600 text-white"
                      }`}
                      onClick={() =>
                        setSizes(prev =>
                          prev.includes(num)
                            ? prev.filter(i => i !== num)
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
                      className={`px-[20px] py-[7px] rounded-lg text-[18px] hover:border-[#46d1f7] border-[2px] cursor-pointer ${
                        sizes.includes(size)
                          ? "bg-green-400 text-black border-[#46d1f7]"
                          : "bg-slate-600 text-white"
                      }`}
                      onClick={() =>
                        setSizes(prev =>
                          prev.includes(size)
                            ? prev.filter(i => i !== size)
                            : [...prev, size]
                        )
                      }
                    >
                      {size}
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Bestseller checkbox */}
            <div className='w-[80%] flex items-center gap-[10px] mt-[20px]'>
              <input
                type='checkbox'
                id='checkbox'
                checked={bestseller}
                onChange={e => setBestSeller(e.target.checked)}
                className='w-[25px] h-[25px] cursor-pointer'
              />
              <label htmlFor='checkbox' className='text-[18px] md:text-[22px] font-semibold'>
                Add to BestSeller
              </label>
            </div>

            {/* FIX 8: Styled submit button matching Add.jsx */}
            <button
              type='submit'
              className='w-[180px] px-[20px] py-[20px] rounded-xl bg-[#65d8f7] flex items-center justify-center gap-[10px] text-black active:bg-slate-700 active:text-white active:border-[2px] border-white'
            >
              {loading ? <Loading /> : "Update Product"}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}

export default Edit;