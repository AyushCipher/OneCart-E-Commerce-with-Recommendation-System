import React, { useContext, useState } from 'react'
import { shopDataContext } from '../context/ShopContext'
import Title from './Title'

function CartTotal() {
  const {
    currency,
    delivery_fee,
    getCartAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getFinalAmount
  } = useContext(shopDataContext)

  const [couponInput, setCouponInput] = useState('')

  return (
    <div className='w-full lg:ml-[30px]'>
        <div className='text-xl py-[10px]'>
        <Title text1={'CART'} text2={'TOTALS'}/>
      </div>
      <div className='flex flex-col gap-2 mt-2 text-sm p-[30px] border-[2px] border-[#4d8890]'>
       <div className='flex justify-between text-white text-[18px] p-[10px]'>
          <p>Subtotal</p>
          <p>{currency} {getCartAmount()}.00</p>
        </div>
        <hr/>
         <div className='flex justify-between text-white text-[18px] p-[10px]'>
          <p>Shipping Fee</p>
          <p>{currency} {delivery_fee}</p>
        </div>
        <hr/>

        <div className='p-[10px]'>
          {appliedCoupon ? (
            <div className='flex justify-between items-center text-white text-[16px] bg-[#1f4d3d] rounded-md px-[15px] py-[10px]'>
              <span>Coupon "{appliedCoupon.code}" applied (-{currency}{appliedCoupon.discount})</span>
              <button type='button' onClick={removeCoupon} className='text-red-400 hover:text-red-300 text-[14px] ml-[10px]'>Remove</button>
            </div>
          ) : (
            <div className='flex gap-[10px]'>
              <input
                type='text'
                placeholder='Coupon code'
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className='flex-1 h-[45px] rounded-md bg-slate-700 placeholder:text-white text-white text-[16px] px-[15px] shadow-sm shadow-[#343434]'
              />
              <button
                type='button'
                onClick={() => applyCoupon(couponInput)}
                className='px-[20px] rounded-md bg-[#3bcee848] text-white text-[15px] border-[1px] border-[#80808049]'
              >
                Apply
              </button>
            </div>
          )}
        </div>
        <hr/>

        {appliedCoupon && (
          <div className='flex justify-between text-green-400 text-[16px] p-[10px]'>
            <p>Discount</p>
            <p>- {currency} {appliedCoupon.discount}</p>
          </div>
        )}

        <div className='flex justify-between text-white text-[18px] p-[10px]'>
          <b>Total</b>
          <b>{currency} {getFinalAmount()}</b>
        </div>
      </div>

    </div>
  )
}

export default CartTotal
