const path = require('path')
const fs = require('fs/promises')
const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

class Converter {
  constructor(input, output) {
    this.input = input
    this.output = output
  }

  async convert() {
    const file = String(await fs.readFile(this.input))
    const [header, ...rows] = file.split('\r\r\n')
    const convertedHeader = this.convertedHeader()
    const convertedRows = this.convertedRows(rows)
    const newFile = convertedHeader + convertedRows
    return fs.writeFile(this.output, newFile)
  }

  convertedHeader() {
    return 'name,email,sexo,birthday\r\r\n'
  }

  convertedRows(rows) {
    return rows.reduce((converted, row) => {
      const person = row.split(',')
      if (this.isAbove18(person)) {
        converted += this.convertedRow(person)
      }
      return converted
    }, new String(''))
  }

  isAbove18(person) {
    const birthDate = dayjs(person[6], 'DD/MM/YYYY')
    const todayDate = dayjs()
    const years = todayDate.diff(birthDate, 'years')
    return years >= 18
  }
   
  convertedRow(person) {
    const isoDate = dayjs(person[6], 'DD/MM/YYYY').format('YYYY-MM-DD')
    return `${person[1]} ${person[2]},${person[3]},${person[4]},${isoDate}\r\r\n`
  }
}

const input = path.resolve('test_data.csv')
const output = path.resolve('converted.csv')
const converter = new Converter(input, output)
converter.convert()
