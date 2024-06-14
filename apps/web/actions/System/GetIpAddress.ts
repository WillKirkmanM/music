"use server"

import os from 'os';

export default async function getServerIpAddress() {
  if (process.env.HOST_IP) {
    return process.env.HOST_IP;
  }

  const networkInterfaces = os.networkInterfaces();

  if (networkInterfaces['Wi-Fi']) {
    for (const net of networkInterfaces['Wi-Fi']) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  for (const interfaceName in networkInterfaces) {
    if (interfaceName === 'Wi-Fi') continue;

    const netInterface = networkInterfaces[interfaceName] as os.NetworkInterfaceInfo[];
    for (const net of netInterface) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  return '';
}