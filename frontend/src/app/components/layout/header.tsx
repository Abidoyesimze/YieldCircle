"use client";

import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Users, Search, Calendar, Settings } from "lucide-react";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  const navigationItems = [
    { name: "Discover Circles", href: "/discover-circle", icon: Search },
    { name: "My Circles", href: "/user", icon: Users },
    { name: "My Created Circles", href: "/admin", icon: Settings },
    { name: "Calendar", href: "/calendar", icon: Calendar },
  ];

  return (
    <header className="flex items-center justify-between px-6 py-4 md:px-12 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
      {/* Logo */}
      <Link href="/" className="text-xl font-semibold text-white hover:text-teal-400 transition-colors">
        Yield Circle
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-8">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-2 text-gray-300 hover:text-teal-400 transition-colors duration-200"
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-300 hover:text-teal-400 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Connect Wallet Button - Desktop */}
      <div className="hidden md:block">
        <button
          onClick={() => open()}
          type="button"
          className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-black bg-transparent rounded-md border px-4 py-2 text-sm font-medium transition-colors"
        >
          {isConnected && address 
            ? `${address.slice(0, 6)}...${address.slice(-4)}` 
            : "Connect Wallet"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 md:hidden z-50">
          <nav className="px-6 py-4 space-y-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 text-gray-300 hover:text-teal-400 transition-colors duration-200 py-2"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  open();
                  setIsMobileMenuOpen(false);
                }}
                type="button"
                className="w-full border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-black bg-transparent rounded-md border px-4 py-2 text-sm font-medium transition-colors"
              >
                {isConnected && address 
                  ? `${address.slice(0, 6)}...${address.slice(-4)}` 
                  : "Connect Wallet"}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}