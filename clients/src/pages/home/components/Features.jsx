import React from "react";
import { motion } from "framer-motion";
import { User, Briefcase, DollarSign, Shield } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <User />,
      text: "Verified freelancers with ID and selfie submission",
    },
    { icon: <Briefcase />, text: "Divide tasks into manageable sections" },
    {
      icon: <DollarSign />,
      text: "Flexible payments with Stripe and USDC on Celo",
    },
    {
      icon: <Shield />,
      text: "Earn badges based on completed orders and points",
    },
  ];

  return (
    <div
      id="features"
      className="grid md:grid-cols-2 gap-12 items-center mb-24"
    >
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img
          src="/assets/images/FreelancerIllustra.png"
          alt="WorkIQ Platform"
          className="rounded-lg "
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-blue-600">
          Why Choose WorkIQ?
        </h2>
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-blue-600 text-xl">{feature.icon}</span>
              <span>{feature.text}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default Features;
