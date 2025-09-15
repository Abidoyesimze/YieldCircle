"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 md:px-12">
      <div className="text-xl font-semibold">Yield Cycle</div>
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
                      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black bg-transparent rounded-md border px-4 py-2 text-sm font-medium transition-colors"
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
                      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black bg-transparent rounded-md border px-4 py-2 text-sm font-medium transition-colors"
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
                      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black bg-transparent rounded-md border px-4 py-2 text-sm font-medium transition-colors"
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
                      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black bg-transparent rounded-md border px-4 py-2 text-sm font-medium transition-colors"
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
    </header>
  );
}