import React from "react";
import { motion } from "framer-motion";

const Pricing = () => {
  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <motion.div
      id="pricing"
      className="mb-24 text-center"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      <motion.h2
        className="text-3xl font-bold mb-6 text-blue-600"
        variants={fadeIn}
      >
        Flexible Pricing for Everyone
      </motion.h2>
      <motion.p className="text-xl mb-8" variants={fadeIn}>
        Choose the payment method that works best for you.
      </motion.p>
      <motion.div className="grid md:grid-cols-2 gap-8" variants={fadeIn}>
        {[
          {
            title: "Traditional Payments",
            description: "Secure and familiar payment processing with Stripe",
            features: [
              "Credit/Debit Cards",
              "Bank Transfers",
              "Low transaction fees",
            ],
          },
          {
            title: "Crypto Payments",
            description: "Fast and borderless transactions with USDC on Celo",
            features: [
              "USDC stablecoin",
              "Low gas fees on Celo",
              "Instant settlements",
            ],
          },
        ].map((plan, index) => (
          <motion.div
            key={index}
            className="bg-gray-100 p-8 rounded-lg"
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 className="text-2xl font-bold mb-4">{plan.title}</h3>
            <p className="mb-4">{plan.description}</p>
            <ul className="text-left mb-6">
              {plan.features.map((feature, i) => (
                <li key={i}>✓ {feature}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Pricing;
