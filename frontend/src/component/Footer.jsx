import React from "react";
import { Link } from "react-router-dom";
import {
  FaPhone,
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaYoutube,
  FaInstagram,
  FaMapMarkerAlt,
} from "react-icons/fa";

import logo from "../assets/logo.png"; // your logo

function Footer() {
  return (
    <footer className="w-full bg-gradient-to-l from-[#0b1a1d] to-[#091015] text-white border-t border-white/10 ">
      
      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-4 gap-14">
        
        {/* LOGO + ABOUT ONECART */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <img
              src={logo}
              alt="OneCart Logo"
              className="md:w-[40px] md:h-[40px] w-[30px] h-[30px]"
            />

            <div>
              <h2 className="text-2xl font-bold tracking-wide flex items-center gap-1">
                <span className="text-white">ONE</span>
                <span className="text-[#46d1f7]">CART</span>
              </h2>
              <div className="h-[3px] w-[80px] mt-1 bg-[#46d1f7]" />
            </div>
          </div>

          <p className="mt-3 text-gray-300 text-sm leading-relaxed ml-11">
            Premium e-commerce platform delivering smooth and secure shopping experiences across India.
          </p>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-lg font-bold tracking-wide">
            Contact <span className="text-[#46d1f7]">Us</span>
          </h3>
          <div className="mt-2 h-[2px] w-[60px] bg-[#46d1f7]" />
          <p className="flex items-center gap-2 mt-4 text-gray-300 text-sm">
            <FaPhone /> +91 9798786431
          </p>
          <p className="flex items-center gap-2 mt-2 text-gray-300 text-sm">
            <FaEnvelope /> ayushdvlpr460@gmail.com
          </p>
          <p className="flex items-start gap-2 mt-2 text-gray-300 text-sm">
            <FaMapMarkerAlt className="mt-[2px]" />
            Neerukonda Village, SRM University AP, Mangalagiri, Andhra Pradesh 522502
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-lg font-bold tracking-wide">
            Quick <span className="text-[#46d1f7]">Links</span>
          </h3>
          <div className="mt-2 h-[2px] w-[60px] bg-[#46d1f7]" />

          <ul className="space-y-2 mt-4 text-sm">
            {[
              { name: "Home", to: "/" },
              { name: "Shop", to: "/collections" },
              { name: "About", to: "/about" },
              { name: "Contact", to: "/contact" },
            ].map((link, i) => (
              <li key={i}>
                <Link
                  to={link.to}
                  className="text-gray-300 hover:text-[#46d1f7] transition"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* SUPPORT */}
        <div>
          <h3 className="text-lg font-bold tracking-wide">
            Customer <span className="text-[#46d1f7]">Support</span>
          </h3>
          <div className="mt-2 h-[2px] w-[60px] bg-[#46d1f7]" />

          <ul className="space-y-2 mt-4 text-sm">
            {[
              "Shipping & Delivery",
              "Returns & Refunds",
              "Privacy Policy",
              "Terms & Conditions",
            ].map((item, i) => (
              <li key={i} className="text-gray-300 hover:text-[#46d1f7] transition">
                {item}
              </li>
            ))}
          </ul>

          {/* SOCIAL ICONS */}
          <div className="flex gap-4 mt-6 text-lg">
            {[
              { icon: <FaGithub />, link: "#" },
              { icon: <FaLinkedin />, link: "#" },
              { icon: <FaYoutube />, link: "#" },
              { icon: <FaInstagram />, link: "#" },
            ].map((item, i) => (
              <a key={i} href={item.link} className="hover:text-[#46d1f7] transition">
                {item.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM STRIP */}
      <div className="border-t border-white/10 py-5 text-center">
        <p className="text-gray-400 text-sm">
          © 2024 OneCart. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
