// Copyright (c) Microsoft Corporation and others. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import readline from 'readline'
import request from 'requestretry'
import { HttpClient } from 'typed-rest-client/HttpClient'
import zlib from 'zlib'
import { DebianSourceControlParser } from '.'

export class DebianSourceFetcher {
  constructor(private distribution = 'stable', private archive = 'main') {}
  async getSources() {
    const url = await this.resolveSourcesUrl()
    if (!url) throw new Error('unable to resolve sources url')
    const reader = readline.createInterface({
      input: request({
        url,
        gzip: true
      }).pipe(zlib.createGunzip()),
      crlfDelay: Infinity
    })
    return new DebianSourceControlParser({ input: reader })
  }

  getDsc(record: any) {
    const dsc = `http://deb.debian.org/debian/${record.Directory}/${record.Package}_${record.Version}.dsc`
    request.get(dsc, async (err, response, body) => {
      // TODO: Do some validation of the signature?
      // const decoded = await armor.decode(body)
      // console.log(decoded.data.toString())
    })
  }

  private async resolveSourcesUrl() {
    const client = new HttpClient('dpkg-parser')
    let url = `https://deb.debian.org/debian/dists/${this.distribution}/${this.archive}/source/Sources.gz`
    let response = await client.head(url)
    if (response && response.message.statusCode === 200) return url
    url = `http://archive.debian.org/debian-archive/debian/dists/${this.distribution}/${this.archive}/source/Sources.gz`
    response = await client.head(url)
    if (response && response.message.statusCode === 200) return url
    return null
  }
}

interface parameters {
  distribution?: string
  archive?: string
}
