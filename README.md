# dpkg-parser

A JavaScript library to consume Debian package (DPKG) metadata.

```
npm install @clearlydefined/dpkg-parser
```

## Fetch sources

defaults to stable/main

```js
import { DebianSourceFetcher } from '@clearlydefined/dpkg-parser'

const fetcher = new DebianSourceFetcher()
const parser = await fetcher.getSources()
for await (let record of parser) {
  console.log(record.Package)
}

```

specify distribution as 'jessie'

```js
import { DebianSourceFetcher } from '@clearlydefined/dpkg-parser'

const fetcher = new DebianSourceFetcher('jessie')
const parser = await fetcher.getSources()
for await (let record of parser) {
  console.log(record.Package)
}

```

specify jessie archive as 'contrib'

```js
import { DebianSourceFetcher } from '@clearlydefined/dpkg-parser'

const fetcher = new DebianSourceFetcher('jessie', 'contrib')
const parser = await fetcher.getSources()
for await (let record of parser) {
  console.log(record.Package)
}

```

## Access parser directly without fetching sources

(the stream should be a Readable containing the raw record data)

```js
import { DebianSourceControlParser } from '@clearlydefined/dpkg-parser'

const stream = new Readable(...)
const reader = readline.createInterface({
  input: stream,
  crlfDelay: Infinity
})
const parser = new DebianSourceControlParser({ input: reader })
for await (let record of parser) {
  console.log(record.Package)
}
```

## Record structure

raw:

```
Package: 0ad
Binary: 0ad
Version: 0.0.21-2
Maintainer: Debian Games Team <pkg-games-devel@lists.alioth.debian.org>
Uploaders: Vincent Cheng <vcheng@debian.org>
Build-Depends: autoconf, debhelper (>= 9), dpkg-dev (>= 1.15.5), libboost-dev, libboost-filesystem-dev, libcurl4-gnutls-dev | libcurl4-dev, libenet-dev (>= 1.3), libgloox-dev (>= 1.0.9), libicu-dev, libminiupnpc-dev (>= 1.6), libnspr4-dev, libnvtt-dev (>= 2.0.8-1+dfsg-4~), libogg-dev, libopenal-dev, libpng-dev, libsdl2-dev (>= 2.0.2), libvorbis-dev, libwxgtk3.0-dev | libwxgtk2.8-dev, libxcursor-dev, libxml2-dev, pkg-config, python, python3, zlib1g-dev
Architecture: amd64 arm64 armhf i386 kfreebsd-amd64 kfreebsd-i386
Standards-Version: 3.9.8
Format: 3.0 (quilt)
Files:
  5f2af935f4537ede6169db8946d18d81 2363 0ad_0.0.21-2.dsc
  095eade8c9b3deaf25d0d7fa423ff860 29196476 0ad_0.0.21.orig.tar.xz
  01d28e643619455fef8d40f1d1e7da7d 71420 0ad_0.0.21-2.debian.tar.xz
Vcs-Browser: https://anonscm.debian.org/viewvc/pkg-games/packages/trunk/0ad/
Vcs-Svn: svn://anonscm.debian.org/pkg-games/packages/trunk/0ad/
Checksums-Sha256:
  ee98572de81be0ffbf039951111fdef3a431d81892481a959363fbb93cfb780e 2363 0ad_0.0.21-2.dsc
  96be23e4284a3931ef9536f988f2517040bde1f8700ee048bff18c932d8683cf 29196476 0ad_0.0.21.orig.tar.xz
  2f6e5b751872932971c4dbf618c32ddef1021f195d0457f57030b814cb1749c7 71420 0ad_0.0.21-2.debian.tar.xz
Homepage: http://play0ad.com/
Package-List:
  0ad deb games optional arch=amd64,arm64,armhf,i386,kfreebsd-amd64,kfreebsd-i386
Directory: pool/main/0/0ad
Priority: source
Section: games
```

parsed:

```json
{
  "Package": "0ad",
  "Binary": "0ad",
  "Version": "0.0.21-2",
  "Maintainer": "Debian Games Team <pkg-games-devel@lists.alioth.debian.org>",
  "Uploaders": "Vincent Cheng <vcheng@debian.org>",
  "Build-Depends": "autoconf, debhelper (>= 9), dpkg-dev (>= 1.15.5), libboost-dev, libboost-filesystem-dev, libcurl4-gnutls-dev | libcurl4-dev, libenet-dev (>= 1.3), libgloox-dev (>= 1.0.9), libicu-dev, libminiupnpc-dev (>= 1.6), libnspr4-dev, libnvtt-dev (>= 2.0.8-1+dfsg-4~), libogg-dev, libopenal-dev, libpng-dev, libsdl2-dev (>= 2.0.2), libvorbis-dev, libwxgtk3.0-dev | libwxgtk2.8-dev, libxcursor-dev, libxml2-dev, pkg-config, python, python3, zlib1g-dev",
  "Architecture": "amd64 arm64 armhf i386 kfreebsd-amd64 kfreebsd-i386",
  "Standards-Version": "3.9.8",
  "Format": "3.0 (quilt)",
  "Files": "5f2af935f4537ede6169db8946d18d81 2363 0ad_0.0.21-2.dsc\n095eade8c9b3deaf25d0d7fa423ff860 29196476 0ad_0.0.21.orig.tar.xz\n01d28e643619455fef8d40f1d1e7da7d 71420 0ad_0.0.21-2.debian.tar.xz",
  "Vcs-Browser": "https://anonscm.debian.org/viewvc/pkg-games/packages/trunk/0ad/",
  "Vcs-Svn": "svn://anonscm.debian.org/pkg-games/packages/trunk/0ad/",
  "Checksums-Sha256": "ee98572de81be0ffbf039951111fdef3a431d81892481a959363fbb93cfb780e 2363 0ad_0.0.21-2.dsc\n96be23e4284a3931ef9536f988f2517040bde1f8700ee048bff18c932d8683cf 29196476 0ad_0.0.21.orig.tar.xz\n2f6e5b751872932971c4dbf618c32ddef1021f195d0457f57030b814cb1749c7 71420 0ad_0.0.21-2.debian.tar.xz",
  "Homepage": "http://play0ad.com/",
  "Package-List": "0ad deb games optional arch=amd64,arm64,armhf,i386,kfreebsd-amd64,kfreebsd-i386",
  "Directory": "pool/main/0/0ad",
  "Priority": "source",
  "Section": "games"
}
```
