"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import bgImage from "../assets/bg-cart.png";

export default function HomePage() {
  return (
    <div className="w-screen overflow-hidden text-white m-0 p-0">
      {/* Hero Section */}
      <section className="relative w-full h-screen">
        <div className="absolute inset-0">
          <Image
            src={bgImage}
            alt="RetailIQ Background"
            fill
            priority
            className="object-cover brightness-110 contrast-105 saturate-125"
          />
          <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
        </div>

        <div className="relative z-10 flex flex-col items-start justify-center h-full px-10 md:px-24">
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-orange-400 mb-4 drop-shadow-[0_5px_15px_rgba(255,140,0,0.5)]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Welcome to RetailIQ
          </motion.h1>

          <motion.p
            className="text-lg md:text-2xl text-gray-100 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            The smart solution for shopkeepers to digitize their store and grow faster.
          </motion.p>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="relative bg-[#070203] py-20 px-8 md:px-24 text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-orange-400 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Let’s Register Your Shop
        </motion.h2>

        <motion.p
          className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Getting started with RetailIQ is simple — create your account, register your shop, and 
          manage your inventory digitally. Track your growth in real-time with our easy-to-use 
          dashboard.
        </motion.p>

        
      </section>

      {/* Our Services Section */}
      <section className="relative bg-[#070203] py-20 px-8 md:px-24 text-center ">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-orange-400 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Our Services
        </motion.h2>

        <motion.p
          className="text-lg md:text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          We provide a complete digital solution for retail management — 
          from inventory tracking and analytics to secure cloud storage of your sales data. 
          RetailIQ empowers shopkeepers to compete in the digital era.
        </motion.p>
      </section>
    </div>
  );
}
