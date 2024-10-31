import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
// import { cn } from 'tailwind-merge';

const CustomConnectButton = ({ className }) => {
  return (
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
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type="button" className={cn(
                    `px-4 py-2 rounded bg-blue-500 text-white font-semibold transition-all  hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`,

                  )}>
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button" className={cn(
                    "px-4 py-2 rounded-full bg-red-500 text-white font-semibold transition-all hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                    className
                  )}>
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex bg-blue-100 items-center gap-3">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className={cn(
                      "px-2 py-2 flex items-center text-sm rounded-lg bg-gray-200 text-gray-700 font-semibold transition-all hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
                      className
                    )}
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 14, height: 14 }}
                          />
                        )}
                      </div>
                    )}
                    <div className='flex'>

                      {chain.name} <ChevronDown size={20} />
                    </div>
                  </button>

                  <button onClick={openAccountModal} type="button" className={cn(
                    "px-2 py-2 rounded-lg bg-blue-500 text-sm text-white font-semibold transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    className
                  )}>
                    {account.displayName}
                    {/* {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''} */}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default CustomConnectButton;