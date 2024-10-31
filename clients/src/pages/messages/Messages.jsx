import { useNavigate } from "react-router-dom";
import {
  LoadingIndicator,
  Chat,
  useChatContext,
  ChannelList,
  Channel,
  Window,
  MessageInput,
  MessageList,
  ChannelHeader,
  Thread,
  Avatar,
} from "stream-chat-react";
// import { useChatContext } from "stream-chat-react/dist/context";
import "stream-chat-react/dist/css/index.css";
// import "@/styles/messagesStyles.css";
import useAuth from "@/hooks/useAuth";
import { useStreamChat } from "@/context/StreamChatContext";
import "@/styles/streamChatStyles.css";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import Spinner from "@/components/Spinner";
// import { EmojiPicker } from 'stream-chat-react/emojis';

export function Messages() {
  const { _id } = useAuth();
  const { streamChat } = useStreamChat();
  // console.log(streamChat);
  // console.log(_id);

  // const { user, streamChat } = useLoggedInAuth();
  if (streamChat == null) return <Spinner />;
  return (
    <div>
      <Chat client={streamChat}>
        <ChannelList
          List={Channels}
          sendChannelsToList
          filters={{ members: { $in: [_id] } }}
        />
        <Channel
          // EmojiPicker={EmojiPicker}
          PinIndicator={CustomPinIndicator}
        >
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
}
function Channels({ loadedChannels }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applicant = searchParams.get("applicant");
  // const { logout } = useLoggedInAuth();
  const { setActiveChannel, channel: activeChannel, client } = useChatContext();

  useEffect(() => {
    if (applicant) {
      // const { client } = useChatContext();
      // Create or watch the channel
      const channel = client.channel("messaging", {
        members: [client.user.id, applicant],
      });
      channel.create().then(() => {
        channel.watch().then(() => {
          setActiveChannel(channel);
        });
      });
    }
  }, [applicant, setActiveChannel]);
  // console.log(activeChannel);
  let members;
  // if (activeChannel)
  //   members = Object.values(channel.state.members).filter(
  //     ({ user }) => user.id !== client.userID
  //   );

  // console.log(members);

  return (
    <div className="w-60 flex flex-col gap-4 m-3 flex-grow">
      <h3 className={"text-xl font-bold"}>Messages</h3>
      <hr className="border-gray-500" />
      {loadedChannels != null && loadedChannels.length > 0
        ? loadedChannels.map((channel) => {
          const isActive = channel === activeChannel;
          const extraClasses = isActive
            ? "bg-blue-500 text-white"
            : "hover:bg-blue-100 bg-gray-100";

          // Assuming channel.members contains the list of members and channel.user is the logged-in user
          const secondMember = Object.values(channel.state.members).filter(
            ({ user }) => user.id !== client.userID
          )[0];
          // channel._data.members.find(
          //   (member) => member.id !== channel.user.id
          // );

          return (
            <button
              onClick={() => setActiveChannel(channel)}
              disabled={isActive}
              className={`p-4 rounded-lg flex gap-3 items-center ${extraClasses}`}
              key={channel.id}
            >
              {/* {secondMember && secondMember?.user?.image && (
                  <img
                    src={secondMember?.user?.image}
                    className="w-10 h-10 rounded-full object-center object-cover"
                  />
                )} */}
              <div className=" flex items-center text-ellipsis overflow-hidden whitespace-nowrap">
                {secondMember && secondMember?.user?.image && (
                  <Avatar
                    src={secondMember?.user?.image}
                    className="w-10 h-10 rounded-full object-center object-cover"
                  />
                )}
                {secondMember ? secondMember?.user?.name : channel.id}
              </div>
            </button>
          );
        })
        : "No Conversations"}
      {/* <hr className="border-gray-500 mt-auto" />
    <Button>Logout</Button> */}
    </div>
  );
}

export const CustomPinIndicator = () => {
  return (
    <div>
      <div className="italic text-gray-800">pinned</div>
    </div>
  );
};
