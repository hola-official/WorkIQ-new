import { createContext, useContext, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import useAuth from "@/hooks/useAuth";

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

const Context = createContext(null);

export function useStreamChat() {
    return useContext(Context);
}



export function StreamChatProvider({ children }) {
    const [streamChat, setStreamChat] = useState(null);
    const { _id, username, fullName, image, streamToken } = useAuth();

    console.log(streamToken)
    console.log(streamChat)


    useEffect(() => {
        if (streamToken === null || _id === null) return;

        // Check if StreamChat is already initialized and connected
        if (streamChat && streamChat.userID === _id && streamChat.tokenManager.token === streamToken) {
			console.log('returning now........')
            return; // No need to reconnect
        }

        const chat = new StreamChat(apiKey);

        // Connect to StreamChat
        chat.connectUser(
            {
                id: _id,
                name: username,
                fullName,
                image,
            },
            streamToken
        ).then(() => {
            setStreamChat(chat);
        });

        return () => {
            // Disconnect from StreamChat when component unmounts
            if (streamChat) {
                streamChat.disconnectUser();
                setStreamChat(null);
            }
        };
    }, [streamToken, _id, username, fullName, image]);
console.log(streamChat)

    return (
        <Context.Provider value={{ streamChat }}>
            {children}
        </Context.Provider>
    );
}