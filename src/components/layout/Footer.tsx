import React from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBagIcon,
  HeartIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    "Quick Links": [
      { name: "Home", path: "/" },
      { name: "Products", path: "/products" },
      { name: "About Us", path: "/about" },
      { name: "Contact", path: "/contact" },
    ],
    Support: [
      { name: "FAQ", path: "/faq" },
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Returns Policy", path: "/returns" },
    ],
    "For Affiliates": [
      { name: "Become an Affiliate", path: "/affiliate-signup" },
      { name: "Affiliate Dashboard", path: "/dashboard" },
      { name: "Commission Rates", path: "/commissions" },
      { name: "Resources", path: "/resources" },
    ],
  };

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <ShoppingBagIcon className="h-8 w-8 text-emerald-400" />
              <span className="text-2xl font-bold text-white">
                Affiliate<span className="text-emerald-400">Sarthi</span>
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Your trusted partner in affiliate marketing. Discover the best
              products and earn commissions.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="#"
                className="text-gray-400 hover:text-emerald-400 transition-colors"
              ></a>
              <a
                href="#"
                className="text-gray-400 hover:text-emerald-400 transition-colors"
              ></a>
              <a
                href="#"
                className="text-gray-400 hover:text-emerald-400 transition-colors"
              ></a>
              <a
                href="#"
                className="text-gray-400 hover:text-emerald-400 transition-colors"
              ></a>
            </div>
          </div>

          {/* Quick Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 text-sm">
              <EnvelopeIcon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span>support@affiliatesarthi.com</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <PhoneIcon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <MapPinIcon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span>Mumbai, India</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-400">
              &copy; {currentYear} AffiliateSarthi. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-gray-400 mt-2 md:mt-0">
              <span>Made with</span>
              <HeartIcon className="h-4 w-4 text-red-500" />
              <span>by Team AffiliateSarthi</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
