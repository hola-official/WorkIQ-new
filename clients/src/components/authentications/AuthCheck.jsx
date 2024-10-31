// AuthCheck.js
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import useAuth from "@/hooks/useAuth";

export function AuthCheck() {
    const [walletAuthStatus, setWalletAuthStatus] = useState("unauthenticated");
    const { _id: userId, connectedWallets = [] } = useAuth(); // Provide a default empty array
    const { isConnected, address } = useAccount();

    useEffect(() => {
        // Check if connectedWallets is defined and is an array
        if (!Array.isArray(connectedWallets)) {
            console.log("connectedWallets is not an array:", connectedWallets);
            return; // Exit early if connectedWallets is not an array
        }

        if (
            walletAuthStatus === "authenticated" &&
            address &&
            !connectedWallets.includes(address)
        ) {
            setWalletAuthStatus("unauthenticated");
        } else if (userId && address && connectedWallets.includes(address)) {
            setWalletAuthStatus("authenticated");
        }
    }, [connectedWallets, isConnected, address, userId, walletAuthStatus]);

    return null; // This component doesn't render anything
}