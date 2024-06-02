"use server"

import os from 'os';

export default async function getServerIpAddress() {
  const networkInterfaces = os.networkInterfaces();

  if (networkInterfaces['Wi-Fi']) {
    for (const net of networkInterfaces['Wi-Fi']) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  return '';
}