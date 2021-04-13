const axios = require('axios').default
const xlsx = require('node-xlsx')
const fs = require('fs')

axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
axios.defaults.headers.common.Referer = 'https://zjczs.scu.edu.cn/aoadmin/'

async function getMsgsByYear(year) {
  const url = `https://zjczs.scu.edu.cn/admission-admin/scu/enrollscore/list?page=1&limit=3000&year=${year}&province=&major=&category=`
  const req = await axios.get(url)
  const res = await req.data
  console.log(`${year} doneload done`)
  return res.page.records
}

async function download() {
  const table = []
  const header = ['年份', '省份', '科目', '专业', '录取批次', '类别', '最高分', '最低分', '平均分']
  table.push(header)

  const years = ['2020', '2019', '2018', '2017']
  const dataPromises = years.map(async v => {
    return await getMsgsByYear(v)
  })
  await Promise.all(dataPromises)
  console.log('all download done')

  for (const promise of dataPromises) {
    const lists = await promise
    lists.forEach(({
      year,
      provinceName,
      subjectName,
      majorName,
      enrollBatchName,
      categoryName,
      maxScore,
      minScore,
      avgScore
    }) => {
      table.push([
        year,
        provinceName,
        subjectName,
        majorName,
        enrollBatchName,
        categoryName,
        `${maxScore}`,
        `${minScore}`,
        `${avgScore}`
      ])
    })
  }
  const output = xlsx.build([{
    name: 'sheet1',
    data: table
  }])
  if (fs.promises) {
    await fs.promises.writeFile('luqu.xlsx', output, 'binary')
  } else {
    return new Promise(resolve => {
      fs.writeFile('luqu.xlsx', output, {
        encoding: 'binary'
      }, err => {
        if (!err) resolve()
      })
    })
  }
  console.log('全部完成')
}

;(async() => {
  await download()
})()
