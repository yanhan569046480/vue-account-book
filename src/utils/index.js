export function F (d, pattern) {
  if (!d) return ''
  if (/.*[\u4e00-\u9fa5]+.*$/.test(d)) return d
  if (typeof d !== 'object') d = new Date(d)
  pattern = pattern || 'YYYY-MM-dd'
  var y = d.getFullYear().toString(),
    o = {
      M: d.getMonth() + 1,
      d: d.getDate(),
      h: d.getHours(),
      m: d.getMinutes(),
      s: d.getSeconds()
    }
  pattern = pattern.replace(/(y+)/ig, function (a, b) {
    return y.substr(4 - Math.min(4, b.length))
  })
  for (var i in o) {
    pattern = pattern.replace(new RegExp('(' + i + '+)', 'g'), function (a, b) {
      return (o[i] < 10 && b.length > 1) ? '0' + o[i] : o[i]
    })
  }
  return pattern
}

export function dateFormat (d, pattern) {
  if (!d) return ''
  if (/.*[\u4e00-\u9fa5]+.*$/.test(d)) return d
  if (typeof d !== 'object') d = new Date(d)
  pattern = pattern || 'YYYY-MM-dd'
  var y = d.getFullYear().toString(),
    o = {
      M: d.getMonth() + 1,
      d: d.getDate(),
      h: d.getHours(),
      m: d.getMinutes(),
      s: d.getSeconds()
    }
  pattern = pattern.replace(/(y+)/ig, function (a, b) {
    return y.substr(4 - Math.min(4, b.length))
  })
  for (var i in o) {
    pattern = pattern.replace(new RegExp('(' + i + '+)', 'g'), function (a, b) {
      return (o[i] < 10 && b.length > 1) ? '0' + o[i] : o[i]
    })
  }
  return pattern
}

export function UUID (s) {
  if (!s) return ''
  let uid = s
  let date = new Date()
  let mon = date.getMonth() + 1
  let month = mon < 10 ? '0' + mon : mon
  uid = uid + date.getFullYear() + month + date.getDate()
  uid = uid + '-00' + Math.random().toString().slice(-3)
  return uid
}
