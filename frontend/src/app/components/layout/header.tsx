"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Users, Search, User, Calendar, Settings } from "lucide-react";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

      {/* Connect Wallet Button */}
      <div className="hidden md:block">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== "loading";
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus || authenticationStatus === "authenticated");

            return (
              <div
                {...(!ready && {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-black bg-transparent rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white bg-transparent rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                      >
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-black bg-transparent rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                      >
                        {chain.hasIcon && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 24,
                              height: 24,
                              borderRadius: 999,
                              overflow: "hidden",
                              marginRight: 4,
                            }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? "Chain icon"}
                                src={chain.iconUrl}
                                style={{ width: 24, height: 24 }}
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </button>
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-black bg-transparent rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                      >
                        {account.displayName}
                        {account.displayBalance ? ` (${account.displayBalance})` : ""}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
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
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== "loading";
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus || authenticationStatus === "authenticated");

                  return (
                    <div
                      {...(!ready && {
                        "aria-hidden": true,
                        style: {
                          opacity: 0,
                          pointerEvents: "none",
                          userSelect: "none",
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <button
                              onClick={openConnectModal}
                              type="button"
                              className="w-full border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-black bg-transparent rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                            >
                              Connect Wallet
                            </button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <button
                              onClick={openChainModal}
                              type="button"
                              className="w-full border-red-400 text-red-400 hover:bg-red-400 hover:text-white bg-transparent rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                            >
                              Wrong network
                            </button>
                          );
                        }

                        return (
                          <div className="space-y-2">
                            <button
                              onClick={openChainModal}
                              type="button"
                              className="w-full border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-black bg-transparent rounded-md border px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                            >
                              {chain.hasIcon && (
                                <div
                                  style={{
                                    background: chain.iconBackground,
                                    width: 20,
                                    height: 20,
                                    borderRadius: 999,
                                    overflow: "hidden",
                                  }}
                                >
                                  {chain.iconUrl && (
                                    <img
                                      alt={chain.name ?? "Chain icon"}
                                      src={chain.iconUrl}
                                      style={{ width: 20, height: 20 }}
                                    />
                                  )}
                                </div>
                              )}
                              <span>{chain.name}</span>
                            </button>
                            <button
                              onClick={openAccountModal}
                              type="button"
                              className="w-full border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-black bg-transparent rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                            >
                              {account.displayName}
                              {account.displayBalance ? ` (${account.displayBalance})` : ""}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}