"use client";

import React, { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { ScrollArea, ScrollBar } from "@music/ui/components/scroll-area";
import FileBrowser from "@/components/FileBrowser/FileBrowser";
import getServerIpAddress from "@/actions/System/GetIpAddress";
import GetPort from "@/actions/System/GetPort";

export default function SetupLibrary() {
  const [messageHistory, setMessageHistory] = useState<MessageEvent<any>[]>([]);
  const [serverIP, setServerIP] = useState("");
  const [port, setPort] = useState(0)

  useEffect(() => {
    async function getServerInformation() {
      const ip = await getServerIpAddress();
      setServerIP(ip);

      const port = await GetPort()
      setPort(port)
    }

    getServerInformation();
  });

  const socketUrl = serverIP && port ? `ws://${serverIP}:${port}/websocket/` : null;
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