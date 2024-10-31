import React, { useState } from "react";
import { motion } from "framer-motion";

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState("freelancers");

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const steps = {
    freelancers: [
      {
        title: "Create Profile",
        description: "Submit your selfie holding your ID for verification",
      },
      {
        title: "Find Projects",
        description: "Browse and apply for suitable jobs",
      },
      {
        title: "Submit proposal",
        description: "Submit proposal to section of task match your skill",
      },
    ],
    clients: [
      {
        title: "Post a Task",
        description: "post tasks with multiple sections",
      },
      {
        title: "Choose Freelancer",
        description: "Review proposals and select the best fit",
      },
      {
        title: "Payment",
        description: "Pay using Stripe or USDC on Celo",
      },
    ],
  };

  return (
    <motion.div
      id="how-it-works"
      className="mb-24"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      <motion.h2
        className="text-3xl font-bold mb-8 text-center text-blue-600"
        variants={fadeIn}
      >
        How It Works
      </motion.h2>
      <div className="flex justify-center mb-8">
        <motion.button
          className={`px-6 py-2 rounded-l-full ${
            activeTab === "freelancers"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveTab("freelancers")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          For Freelancers
        </motion.button>
        <motion.button
          className={`px-6 py-2 rounded-r-full ${
            activeTab === "clients"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveTab("clients")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          For Clients
        </motion.button>
      </div>
      <motion.div className="grid md:grid-cols-3 gap-8" variants={stagger}>
        {steps[activeTab].map((step, index) => (
          <motion.div
            key={index}
            className="bg-gray-100 p-6 rounded-lg"
            variants={fadeIn}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="text-4xl font-bold text-blue-600 mb-4">
              {index + 1}
            </div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p>{step.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default HowItWorks;
