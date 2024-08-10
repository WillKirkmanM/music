"use client"

import getBaseURL from "@/lib/Server/getBaseURL";;

import React, { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area";
import FileBrowser from "@/components/FileBrowser/FileBrowser";

export default function SetupLibrary() {
  const [messageHistory, setMessageHistory] = useState<MessageEvent<any>[]>([]);
  
  const baseUrl = getBaseURL()?.replace(/^https?:\/\//, '');
  const socketUrl = `ws://${baseUrl}/ws`;
  const { lastMessage } = useWebSocket(socketUrl);
  
  useEffect(() => {
    if (lastMessage !== null && typeof lastMessage.data === 'string') {
      const newMessage = new MessageEvent("message", { data: lastMessage.data });
      setMessageHistory((prev) => prev.concat(newMessage));
    } else {
      console.error("Unsupported message data type:", typeof lastMessage?.data);
    }
  }, [lastMessage]);

  return (
    <> 
      <p className="text-white text-center text-4xl py-14">Link your Music Library</p>

      <div className="flex justify-between text-white">
        <div className="w-1/2">
          <FileBrowser />
        </div>

        <div className="w-1/2 bg-gray-800 p-4 rounded-md">
          <h2 className="text-2xl flex justify-center pb-4">Logs</h2>
          <div className="flex justify-center items-center">
            <ScrollArea className="h-72 w-full rounded-md border bg-gray-700 p-4">
              <ul className="py-2">
                {messageHistory.map((message) => (
                  <p key={message.data} className="text-white">{message.data}</p>
                ))}
              </ul>
              <ScrollBar />
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );
}
