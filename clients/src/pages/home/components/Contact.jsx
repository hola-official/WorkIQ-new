import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const navigate = useNavigate();
  return (
    <div id="contact" className="text-center">
      <h2 className="text-3xl font-bold mb-6 text-blue-600">
        Ready to elevate your freelancing?
      </h2>
      <p className="text-xl mb-8">
        Join thousands of freelancers and clients already benefiting from
        WorkIQ.
      </p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* <input
          type="email"
          placeholder="Enter your email"
          className="bg-gray-100 text-gray-800 px-6 py-3 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-600"
        /> */}
        <motion.button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/auth")}
        >
          Join Now
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Contact;
