import React, { useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Box } from '@mui/material'
import MyChats from '../Components/Chats/MyChats'
import ChatBox from '../Components/Chats/ChatBox'
import SideDrawer from '../Components/Chats/SideDrawer'
function ChatPage() {
  console.log("In ChatPage");
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);
  //ChatBox is the component where changes happen (like sending a new message, creating a chat)
  //MyChats is the component that should refresh when there’s a change
  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box display="flex" justifyContent='space-between' width="100%" height="90vh" p={2} gap={2}>
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
      </Box>


    </div>
  )
}

export default ChatPage