// Copyright (c) Microsoft Corporation and others. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import readline from 'readline'
import {DebianSourceControlIterator} from './DebianSourceControlIterator'

export class DebianSourceControlParser implements AsyncIterable<any> {
  private iterator: DebianSourceControlIterator
  constructor(options: {input: readline.Interface}) {
    this.iterator = new DebianSourceControlIterator(options.input)
  }
  [Symbol.asyncIterator]() {
    return this.iterator
  }
}
