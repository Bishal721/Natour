const asyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.SECRET_STRIPE_KEY);

const checkout = asyncHandler(async (req, res) => {
  const { products } = req.body;
  const lineItems = products.map((product) => ({
    price_data: {
      currency: "NPR",
      product_data: {
        name: product.name,
      },
      unit_amount: product.price * 100,
    },
    quantity: 1 || product?.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/success?paymentStatus=success`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel?paymentStatus=canceled`,
  });

  res.json({ id: session.id });
});
module.exports = {
  checkout,
};
