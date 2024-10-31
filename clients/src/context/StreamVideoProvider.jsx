'use client';
import { useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
// import { useUser } from '@clerk/nextjs';
// import { tokenProvider } from '@/actions/stream.actions';
import Loader from '@/pages/classroom/components/Loader';
import useAuth from '@/hooks/useAuth';
const apiKey = import.meta.env.VITE_STREAM_API_KEY;

const StreamVideoProvider = ({ children }) => {
    const [videoClient, setVideoClient] = useState();
    // const { user, isLoaded } = useUser();
    const { _id, username, fullName, image, streamToken } = useAuth();
    // console.log(streamToken)

    useEffect(() => {
        if (!_id || !streamToken || !apiKey)
            return;
    
        const client = new StreamVideoClient({
            apiKey: apiKey,
            user: {
                id: _id,
                name: username,
                fullName,
                image,
            },
            tokenProvider: streamToken,
        });
        setVideoClient(client);

        return () => {
            client.disconnectUser();
            setVideoClient(null);
        };
    }, [_id, username, apiKey]);
    
    if (!videoClient)
        return <Loader />;
    return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};
export default StreamVideoProvider;
