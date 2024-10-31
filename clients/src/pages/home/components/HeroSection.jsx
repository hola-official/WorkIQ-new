// import React from "react";
// import { motion } from "framer-motion";
// import { ArrowRight } from "lucide-react";

// const Hero = () => {
//   return (
//     <div className="text-center mb-16 pt-24">
//       <motion.h1
//         className="text-5xl md:text-6xl font-bold mb-6 text-blue-600"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, delay: 0.2 }}
//       >
//         Revolutionize Your Freelancing
//       </motion.h1>
//       <motion.p
//         className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, delay: 0.4 }}
//       >
//         Connect, collaborate, and earn with cutting-edge payment solutions. Take
//         control of your freelancing career with WorkIQ.
//       </motion.p>
//       <motion.button
//         className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full inline-flex items-center transition-colors duration-300"
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95 }}
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, delay: 0.6 }}
//       >
//         Get Started <ArrowRight className="ml-2" />
//       </motion.button>
//     </div>
//   );
// };

// export default Hero;

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroIllustration = () => (
  <div className="w-full h-auto max-w-md mx-auto mb-8 lg:mb-0 bg-gray-200 rounded-lg flex items-center justify-center">
    <img src="/assets/images/Herojpeg.jpeg" alt="" />
  </div>
);

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto px-4 mb-16 pt-24">
      <div className="flex flex-col lg:flex-row items-center justify-between">
        <div className="lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-blue-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Empower Your Freelance Journey
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Connect, collaborate, and thrive with WorkIQ's innovative
            freelancing ecosystem. Seamless payments, smart matching, and
            powerful tools at your fingertips.
          </motion.p>
          <motion.button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full inline-flex items-center transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            onClick={() => navigate('/auth')}
          >
            Get Started <ArrowRight className="ml-2" />
          </motion.button>
        </div>
        <motion.div
          className="lg:w-1/2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <HeroIllustration />
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
