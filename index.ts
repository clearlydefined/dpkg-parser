// https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-controlsyntax
// https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-debiansourcecontrolfiles
// https://wiki.debian.org/DebianRepository/Format#A.22Sources.22_Indices

// Client considerations:
// Empty field values are only permitted in source package control files (debian/control). Such fields are ignored.
// Whitespace must not appear inside names (of packages, architectures, files or anything else) or version numbers, or between the characters of multi-character version relationships.
// The presence and purpose of a field, and the syntax of its value may differ between types of control files.
// Field values are case-sensitive unless the description of the field says otherwise.
// All control files must be encoded in UTF-8.
//
// Unimplemented:
// Paragraph separators (empty lines), and lines consisting only of U+0020 SPACE and U+0009 TAB, are not allowed within field values or between fields. Empty lines in field values are usually escaped by representing them by a U+0020 SPACE followed by a U+002E (.).

import request from 'requestretry'
import zlib from 'zlib'
import readline from 'readline'
// @ts-ignore
import openpgp, {armor} from 'openpgp'

export class DebianSourceControlParser implements AsyncIterable<any> {
  private iterator: DebianSourceControlIterator
  constructor(options: {input: readline.Interface}) {
    this.iterator = new DebianSourceControlIterator(options.input)
  }

  [Symbol.asyncIterator]() {
    return this.iterator
  }
}

class DebianSourceControlIterator {
  constructor(private input: readline.Interface) {}

  private currentLine = 0
  async next(): Promise<any> {
    const currentRecord: any = {}
    let lastField: string | undefined = undefined
    for await (const line of this.input) {
      this.currentLine++

      // Lines starting with U+0023 (#), without any preceding whitespace, are comment lines that are only permitted in source package control files (debian/control).
      // These comment lines are ignored, even between two continuation lines. They do not end logical lines.
      if (line.match(/^#/)) {
        continue
      }
      // The paragraphs are separated by empty lines. Parsers may accept lines consisting solely of spaces and tabs as paragraph separators
      if (line.match(/^[ \t]*$/)) {
        return {value: this.collapseObject(currentRecord), done: false}
      }

      // The field name is composed of US-ASCII characters excluding control characters, space, and colon (i.e., characters in the ranges U+0021 (!) through U+0039 (9), and U+003B (;) through U+007E (~), inclusive). Field names must not begin with the comment character (U+0023 #), nor with the hyphen character (U+002D -).
      // The field ends at the end of the line or at the end of the last continuation line (see below). Horizontal whitespace (spaces and tabs) may occur immediately before or after the value and is ignored there; it is conventional to put a single space after the colon. For example, a field might be:
      // Package: libc6
      // the field name is Package and the field value libc6.
      // simple
      // The field, including its value, must be a single line. Folding of the field is not permitted. This is the default field type if the definition of the field does not specify a different type.
      let match = line.match(
        /^(?<fieldName>[^-][!-9;-~]*):[ \t]*(?<fieldValue>.*?)[ \t]*$/
      )
      if (match && match.groups) {
        const fieldName = match.groups.fieldName
        // Field names are not case-sensitive, but it is usual to capitalize the field names using mixed case as shown below.
        const normalizedFieldName = (lastField = fieldName.toUpperCase())
        const fieldValue = match.groups.fieldValue
        // A paragraph must not contain more than one instance of a particular field name.
        if (Object.keys(currentRecord).includes(normalizedFieldName)) {
          throw new Error(
            `Duplicate field '${fieldName}' on line ${this.currentLine}`
          )
        }
        currentRecord[normalizedFieldName] = {fieldName, fieldValue}
        continue
      }

      // TODO: The difference between folded and multiline has not been implemented
      // folded
      // The value of a folded field is a logical line that may span several lines. The lines after the first are called continuation lines and must start with a space or a tab. Whitespace, including any newlines, is not significant in the field values of folded fields. [3]
      // multiline
      // The value of a multiline field may comprise multiple continuation lines. The first line of the value, the part on the same line as the field name, often has special significance or may have to be empty. Other lines are added following the same syntax as the continuation lines of the folded fields. Whitespace, including newlines, is significant in the values of multiline fields.
      match = line.match(/^[ \t]+(?<fieldValue>.*?)[ \t]*$/)
      if (match && match.groups) {
        if (lastField) {
          const currentValue = currentRecord[lastField]
          currentValue.fieldValue +=
            (currentValue.fieldValue !== '' ? '\n' : '') +
            match.groups.fieldValue
        } else {
          // TODO: Syntax error
        }
      }
      // TODO: This is a syntax error unless it's a continuation line
    }
    return {done: true}
  }

  private collapseObject(input: any): any {
    const output: any = {}
    Object.entries(input).forEach(entry => {
      output[(entry[1] as any).fieldName] = (entry[1] as any).fieldValue
    })
    return output
  }
}

// ;(async () => {
//   const reader = readline.createInterface({
//     input: request({
//       url:
//         'https://deb.debian.org/debian/dists/unstable/main/source/Sources.gz',
//       gzip: true
//     }).pipe(zlib.createGunzip()),
//     crlfDelay: Infinity
//   })
//   const parser = new DebianSourceControlParser({input: reader})
//   for await (let record of parser) {
//     console.log(JSON.stringify(record, null, 2))
//     const directory = record.Directory
//     const dsc = `http://deb.debian.org/debian/${directory}/${record.Package}_${
//       record.Version
//     }.dsc`
//     request.get(dsc, async (err, response, body) => {
//       // TODO: Do some validation of the signature?
//       const decoded = await armor.decode(body)
//       console.log(decoded.data.toString())
//     })
//   }
// })()
