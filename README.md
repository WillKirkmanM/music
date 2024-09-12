<p align="center">
  <img src="https://avatars.githubusercontent.com/u/138057124?s=200&v=4" />
</p>
<h1 align="center">ParsonLabs Music</h1>

<p align="center">
  <img src="https://www.pwa-shields.com/1.0.0/series/certified/purple.svg" alt="PWA Shields" height="20">
</p>

<h4 align="center">
  <a href="#get-started">Install</a>
  ·
  <a href="https://docs.parsonlabs.com/">Documentation</a>
  ·
  <a href="https://github.com/WillKirkmanM/music/releases">Releases</a>
</h4>

<p align="center">ParsonLabs Music is the Self Hosted Audio streaming alternative to YouTube Music, Spotify & Apple Music, providing Unrestricted Access to your library in Uncompressed, Lossless Quality</p>

![genres-showcase](https://github.com/user-attachments/assets/9c85421f-a96a-42ae-9747-7efc23c6bd16)
![music-video-home](https://github.com/user-attachments/assets/398a49fd-a569-480f-89b5-0c57f73b526f)
![plm-complete](https://github.com/user-attachments/assets/b5b012e3-7e91-4a33-b932-a04d68d14aee)
![genre-selection](https://github.com/user-attachments/assets/e00e86f8-1bf5-4070-a2ab-f2fa79d0fcec)
![home-plm](https://github.com/user-attachments/assets/996d0285-cf17-4e07-98fc-f6bf482308f1)
![music-album-md](https://github.com/user-attachments/assets/7c19b7db-f427-4864-899a-0cb42aa3ea82)
![pfp-showcase](https://github.com/user-attachments/assets/a72c56f3-a5fa-4c07-9f99-045c9648a46a)
![music-video](https://github.com/user-attachments/assets/3471f42f-e476-4069-ac9c-0b150332b950)
![updated-lyrics](https://github.com/user-attachments/assets/ecbecfc3-4f97-4cfc-9127-f8479d235ab8)
![updated-artist](https://github.com/user-attachments/assets/b84e3dfe-5fe3-412c-b151-4c027ee23782)
![ArtistAlbumSearch](https://github.com/user-attachments/assets/87dfe43e-c5c3-4058-a6e7-4dbb2ab8f8c6)
![profile](https://github.com/user-attachments/assets/71a8a3c0-4069-4617-b2fc-518fb095a05c)
![search](https://github.com/user-attachments/assets/0fa243ad-da6a-4e46-a561-71636ad7a712)
![showcase-home](https://github.com/user-attachments/assets/9adbd8df-2020-4fb3-8757-1d45f27c0159)
![lyrics-showcase](https://github.com/WillKirkmanM/music/assets/98240335/7aa78513-03c9-4ee0-912c-f5dfc816247b)
![music-artist-showcase](https://github.com/WillKirkmanM/music/assets/98240335/76d1c540-d5cd-4ab0-9ecf-7986e0d84e31)
![music-in-your-library](https://github.com/WillKirkmanM/music/assets/98240335/3b99a0c6-640e-4f38-918f-956a3ad0fd25)
![music-album-search](https://github.com/WillKirkmanM/music/assets/98240335/21b01fba-3705-4ad7-b610-5e549fa06b08)
![music-artist-search](https://github.com/WillKirkmanM/music/assets/98240335/b6566927-11d0-47c3-a5bf-df6abbb2e451)
![music-search-did-you-mean](https://github.com/WillKirkmanM/music/assets/98240335/318f543d-e540-4825-89e5-6a5cda96dbb2)
![music-context-menu](https://github.com/WillKirkmanM/music/assets/98240335/27da74b6-4d30-4f0e-be5a-7cba667d02e7)
![music-playlist](https://github.com/WillKirkmanM/music/assets/98240335/ee6319a1-1b7d-4896-86b6-5a886234e2b5)

## Get Started

### Docker

#### Docker Run
```sh
docker run -d \
  --name parsonlabs-music \
  -p 1993:1993 \
  -p 7700:7700 \
  -v "/path/to/config:/ParsonLabsMusic" \
  -v "/path/to/music:/music" \
  -e JWT_SECRET=your_auth_secret_here \
  --restart unless-stopped \
  ghcr.io/willkirkmanm/music
```

#### Docker Compose
```yaml
services:
  music-server:
    image: ghcr.io/willkirkmanm/music
    container_name: parsonlabs-music
    ports:
      - "1993:1993"
      - "7700:7700"
    volumes:
      - "/path/to/config:/ParsonLabsMusic"
      - "/path/to/music:/music"
    environment:
      - JWT_SECRET=your_auth_secret_here
    restart: unless-stopped
```

### Download Precompiled Binaries

You can download the precompiled binaries from the [releases page](https://github.com/WillKirkmanM/music/releases).

- [Windows (x86_64)](https://github.com/WillKirkmanM/music/releases/download/v1.3.0-alpha/music-server-x86_64-pc-windows-gnu.zip)
- [Linux (x86_64)](https://github.com/WillKirkmanM/music/releases/download/v1.3.0-alpha/music-server-x86_64-unknown-linux-gnu.tar.gz)
- [Linux (x86_64 MUSL)](https://github.com/WillKirkmanM/music/releases/download/v1.3.0-alpha/music-server-x86_64-unknown-linux-musl.tar.gz)
- [Linux (ARMv7 gnueabihf)](https://github.com/WillKirkmanM/music/releases/download/v1.3.0-alpha/music-server-armv7-unknown-linux-gnueabihf.tar.gz)
- [Linux (ARMv7 MUSL)](https://github.com/WillKirkmanM/music/releases/download/v1.2.0-alpha/music-server-armv7-unknown-linux-musleabihf.tar.gz)
- [Linux (ARM gnueabihf)](https://github.com/WillKirkmanM/music/releases/download/v1.3.0-alpha/music-server-arm-unknown-linux-gnueabihf.tar.gz)
- [Linux (ARM MUSL)](https://github.com/WillKirkmanM/music/releases/download/v1.3.0-alpha/music-server-arm-unknown-linux-musleabihf.tar.gz)
- [Linux (ARM64)](https://github.com/WillKirkmanM/music/releases/download/v1.3.0-alpha/music-server-aarch64-unknown-linux-gnu.tar.gz)
- [Linux (ARM64 MUSL)](https://github.com/WillKirkmanM/music/releases/download/v1.3.0-alpha/music-server-aarch64-unknown-linux-musl.tar.gz)

### Compile From Source

### One Liner
```
git clone https://github.com/WillKirkmanM/music && cd music && OS=$(uname -s) && if [ "$OS" = "Linux" ]; then if [ -f /etc/debian_version ]; then sudo apt-get update && sudo apt-get install -y --no-install-recommends sqlite3 libsqlite3-dev wget make build-essential pkg-config libssl-dev unzip && wget https://www.nasm.us/pub/nasm/releasebuilds/2.16/nasm-2.16.tar.gz && tar xzf nasm-2.16.tar.gz && cd nasm-2.16 && ./configure && make && sudo make install && cd .. && rm -rf nasm-2.16 nasm-2.16.tar.gz && sudo apt-get install -y libssl1.1 && rm -rf /var/lib/apt/lists/* && curl -fsSL https://bun.sh/install | bash && export BUN_INSTALL="$HOME/.bun" && export PATH="$BUN_INSTALL/bin:$PATH" && bun install --global yarn; elif [ -f /etc/arch-release ]; then sudo pacman -Syu --noconfirm sqlite wget make base-devel pkgconf openssl nasm unzip && curl -fsSL https://bun.sh/install | bash && export BUN_INSTALL="$HOME/.bun" && export PATH="$BUN_INSTALL/bin:$PATH" && bun install --global yarn; elif [ -f /etc/fedora-release ]; then sudo dnf install -y sqlite sqlite-devel wget make gcc gcc-c++ kernel-devel pkgconf-pkg-config openssl-devel nasm unzip && curl -fsSL https://bun.sh/install | bash && export BUN_INSTALL="$HOME/.bun" && export PATH="$BUN_INSTALL/bin:$PATH" && bun install --global yarn; elif [ -f /etc/gentoo-release ]; then sudo emerge --sync && sudo emerge --ask sqlite wget make gcc pkgconfig openssl nasm unzip && curl -fsSL https://bun.sh/install | bash && export BUN_INSTALL="$HOME/.bun" && export PATH="$BUN_INSTALL/bin:$PATH" && bun install --global yarn; else echo "Unsupported Linux distribution" && exit 1; fi; else echo "Unsupported OS" && exit 1; fi && bun run build --filter music && cargo build --package music-server --release && cargo run --package music-server --release
```

### Clone the Repository
```
git clone https://github.com/WillKirkmanM/music
```

### Install Dependencies
#### Ubuntu
```
sudo apt-get update && apt-get install -y --no-install-recommends sqlite3 libsqlite3-dev wget make build-essential pkg-config libssl-dev unzip && wget https://www.nasm.us/pub/nasm/releasebuilds/2.16/nasm-2.16.tar.gz && tar xzf nasm-2.16.tar.gz && cd nasm-2.16 && ./configure && make && make install && cd .. && rm -rf nasm-2.16 nasm-2.16.tar.gz && apt-get install -y libssl1.1 && rm -rf /var/lib/apt/lists/* && curl -fsSL https://bun.sh/install | bash && export BUN_INSTALL="$HOME/.bun" && export PATH="$BUN_INSTALL/bin:$PATH" && bun install --global yarn
```
#### Arch Linux
```
sudo pacman -Syu --noconfirm sqlite wget make base-devel pkgconf openssl nasm unzip && curl -fsSL https://bun.sh/install | bash && export BUN_INSTALL="$HOME/.bun" && export PATH="$BUN_INSTALL/bin:$PATH" && bun install --global yarn
```
#### Fedora
```
sudo dnf install -y sqlite sqlite-devel wget make gcc gcc-c++ kernel-devel pkgconf-pkg-config openssl-devel nasm unzip && curl -fsSL https://bun.sh/install | bash && export BUN_INSTALL="$HOME/.bun" && export PATH="$BUN_INSTALL/bin:$PATH" && bun install --global yarn
```

#### Gentoo
```
sudo emerge --sync && sudo emerge --ask sqlite wget make gcc pkgconfig openssl nasm unzip && curl -fsSL https://bun.sh/install | bash && export BUN_INSTALL="$HOME/.bun" && export PATH="$BUN_INSTALL/bin:$PATH" && bun install --global yarn
```

### Build the Website
```
bun run build --filter music 
```
### Run the Server
```
cargo run --package music-server --release -- -p 1993
```

> [!TIP]
> The authentication is handled by [JWT Tokens](https://jwt.io/)), they require a special `JWT_SECRET` in order to safely protect your accounts against third parties.
> It is reccommended to `cp .env.example .env` and edit the `JWT_SECRET=` value to something secret, alternatively, you can use openssl to generate a random secret: `openssl rand -base64 48`.

> [!NOTE]  
> **Done! 🥳**.
> Head to [http://localhost:1993/](http://localhost:1993/) and setup your music library.

## Documentation
<p align="center">
  Any additional troubleshooting information can be found in the Documentation https://docs.parsonlabs.com.
</p>

![documentation](https://github.com/user-attachments/assets/94dd3cda-0a4b-4536-82b9-9d341360b8e1)
