"use client";

import { motion } from "framer-motion";
import { Github, Twitter, Linkedin } from "lucide-react";


const footerLinks = {
  Product: ["Features", "Pricing", "Integrations", "Changelog"],
  Resources: ["Documentation", "Tutorials", "Blog", "Support"],
  Company: ["About", "Careers", "Contact", "Press"],
  Legal: ["Privacy", "Terms", "Security", "Cookies"],
};

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/[0.08] py-16 px-6">

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {/* <TrikonLogo />
              <span className="text-xl font-semibold bg-gradient-to-r from-teal-400 to-violet-400 bg-clip-text text-transparent">
                Trikon
              </span> */}
            
            </div>
            <p className="text-white/40 text-sm mb-6 max-w-xs">
              Build extraordinary applications with AI-powered development tools.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-medium mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/40 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} Trikon. All rights reserved.
          </p>
         
        </div>
      </div>
    </footer>
  );
}