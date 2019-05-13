// Copyright (c) Microsoft Corporation and others. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { DebianSourceControlParser, DebianSourceFetcher } from '../'
import readline from 'readline'
import { Readable } from 'stream'

test('general parse', async () => {
  let input = `Package: 0ad
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

Package: 0ad-data
Binary: 0ad-data, 0ad-data-common
Version: 0.0.21-1
Maintainer: Debian Games Team <pkg-games-devel@lists.alioth.debian.org>
Uploaders: Vincent Cheng <vcheng@debian.org>
Build-Depends: debhelper (>= 9), dpkg-dev (>= 1.15.5)
Architecture: all
Standards-Version: 3.9.8
Format: 3.0 (quilt)
Files:
  2b53eeec3658849777538f94d6da3bc4 1985 0ad-data_0.0.21-1.dsc
  d42b04e1f65d45b5a4bbf8fcea6076f8 587025496 0ad-data_0.0.21.orig.tar.xz
  a6159a4f40fc92a1f48e9926df29c867 12708 0ad-data_0.0.21-1.debian.tar.xz
Vcs-Browser: https://anonscm.debian.org/viewvc/pkg-games/packages/trunk/0ad-data/
Vcs-Svn: svn://anonscm.debian.org/pkg-games/packages/trunk/0ad-data/
Checksums-Sha256:
  b3558359ba0f2204b3a7d17156e8bcece7888a1b3f2399514a93bc92644601da 1985 0ad-data_0.0.21-1.dsc
  f3ab3c58ffd3bd647a9baba93ea009d5945d2b5bc7db7053a547e07db36faa97 587025496 0ad-data_0.0.21.orig.tar.xz
  bff62891b554a46b3cda65c6bab82fdd4ae890ce95dd702473409f8cc85692e8 12708 0ad-data_0.0.21-1.debian.tar.xz
Homepage: http://play0ad.com/
Package-List:
  0ad-data deb games optional arch=all
  0ad-data-common deb games optional arch=all
Directory: pool/main/0/0ad-data
Priority: source
Section: games

`
  const stream = new Readable({ objectMode: true })
  stream.push(input)
  stream.push(null)
  const reader = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  })
  const parser = new DebianSourceControlParser({ input: reader })

  for await (let record of parser) {
    expect(record.Package).toBe('0ad')
    expect(record.Version).toBe('0.0.21-2')
    expect(record.Files).toBe(`5f2af935f4537ede6169db8946d18d81 2363 0ad_0.0.21-2.dsc
095eade8c9b3deaf25d0d7fa423ff860 29196476 0ad_0.0.21.orig.tar.xz
01d28e643619455fef8d40f1d1e7da7d 71420 0ad_0.0.21-2.debian.tar.xz`)
  }
})

test('get sources', async () => {
  const fetcher = new DebianSourceFetcher('sarge')
  const parser = await fetcher.getSources()
  for await (let record of parser) {
    expect(record.Package).toBe('3dchess')
    expect(record.Version).toBe('0.8.1-11')
    expect(record.Files).toBe(`ee24555acce059e14a8756cd5635593a 580 3dchess_0.8.1-11.dsc
5390c60953446e541d9455d9c4e38ca1 46371 3dchess_0.8.1.orig.tar.gz
9eac46d2c1664dd09b1e0c9d5e7a72ae 4747 3dchess_0.8.1-11.diff.gz`)
  }
})
