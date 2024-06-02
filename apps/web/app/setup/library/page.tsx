"use client";

import React, { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area";
import FileBrowser from "@/components/FileBrowser/FileBrowser";
import getServerIpAddress from "@/actions/System/GetIpAddress";

export default function SetupLibrary() {
  const [messageHistory, setMessageHistory] = useState<MessageEvent<any>[]>([]);
  const [serverIP, setServerIP] = useState("");

  useEffect(() => {
    async function getServerIP() {
      const ip = await getServerIpAddress();
      setServerIP(ip);
    }

    getServerIP();
  });

  const socketUrl = serverIP ? `ws://${serverIP}:3002/ws` : null;
  const { lastMessage } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      const reader = new FileReader();
      reader.onload = function () {
        const newMessage = new MessageEvent("message", { data: reader.result });
        setMessageHistory((prev) => prev.concat(newMessage));
      };

      reader.readAsText(lastMessage.data);
    }
  }, [lastMessage]);

return (
  <> 
    <p className="text text-center text-4xl py-14">Link your Music Library</p>

    <div className="flex justify-between">
      <div className="w-1/2">
        <FileBrowser />
      </div>

      <div className="w-1/2">
        <h2 className="text-2xl flex justify-center pb-4">Logs</h2>
        <div className="flex justify-center items-center">
          <ScrollArea className="h-72 w-full rounded-md border">
            <ul className="py-2">
              {messageHistory.map((message) => (
                <p key={message.data}>{message.data}</p>
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