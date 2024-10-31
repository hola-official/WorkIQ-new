import React from "react";
import { motion } from "framer-motion";
import { Rocket, Target, Award } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <Rocket size={48} />,
      title: "Innovative Platform",
      description:
        "Leveraging blockchain and traditional payment systems for a seamless experience",
    },
    {
      icon: <Target size={48} />,
      title: "Tailored Solutions",
      description: "Customizable project sections to fit your specific needs",
    },
    {
      icon: <Award size={48} />,
      title: "Recognition System",
      description: "Earn badges and build your professional reputation",
    },
  ];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div id="about" className="mb-16">
      <motion.div
        className="mb-24"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.h2
          className="text-3xl font-bold mb-8 text-center text-blue-600"
          variants={fadeIn}
        >
          About WorkIQ
        </motion.h2>
        <motion.p className="text-lg mb-6" variants={fadeIn}>
          WorkIQ is a cutting-edge freelancing platform that combines
          traditional payment methods with blockchain technology. We offer
          seamless integration with Stripe for conventional payments and support
          USDC transactions on the Celo network, providing our users with
          flexible, secure, and efficient payment options.
        </motion.p>
        <motion.p className="text-lg mb-6" variants={fadeIn}>
          Our mission is to empower freelancers and clients alike by providing a
          robust, transparent, and user-friendly platform that caters to diverse
          payment preferences and ensures prompt, secure transactions.
        </motion.p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-gray-100 p-6 rounded-lg text-center"
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="text-blue-600 mb-4 flex justify-center">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p>{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default About;
