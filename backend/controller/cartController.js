import User from "../model/userModel.js";

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const { itemId, size } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let cartData = user.cartData || {};

    // If product exists
    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
    }

    await User.findByIdAndUpdate(req.userId, { cartData });

    return res.status(201).json({ message: "Item added to cart" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "addToCart error" });
  }
};


// UPDATE CART QUANTITY
export const updateCart = async (req, res) => {
  try {
    const { itemId, size, quantity } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let cartData = user.cartData || {};

    // Check item & size exist
    if (!cartData[itemId] || !cartData[itemId][size]) {
      return res.status(400).json({ message: "Item not in cart" });
    }

    // Update or delete if quantity becomes zero
    if (quantity <= 0) {
      delete cartData[itemId][size];

      // If size object becomes empty, delete product
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }

    } else {
      cartData[itemId][size] = quantity;
    }

    await User.findByIdAndUpdate(req.userId, { cartData });

    return res.status(200).json({ message: "Cart updated" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "updateCart error" });
  }
};


// DELETE CART ITEM COMPLETELY
export const deleteCartItem = async (req, res) => {
  try {
    const { itemId } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let cartData = user.cartData || {};

    if (!cartData[itemId]) {
      return res.status(400).json({ message: "Item not found in cart" });
    }

    delete cartData[itemId];

    await User.findByIdAndUpdate(req.userId, { cartData });

    return res.status(200).json({ message: "Item removed from cart" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "deleteCartItem error" });
  }
};


// GET CART
export const getUserCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const cartData = user.cartData || {};

    return res.status(200).json(cartData);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "getUserCart error" });
  }
};
