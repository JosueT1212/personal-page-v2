function phaseOf(date, table) {
  var p = {};
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City', hourCycle: 'h23',
    year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
  }).formatToParts(date).forEach(function (x) { p[x.type] = +x.value; });
  var m = p.hour * 60 + p.minute + p.second / 60;
  var doy = Math.min(365, Math.round((Date.UTC(p.year, p.month - 1, p.day) - Date.UTC(p.year, 0, 1)) / 864e5));
  var rise = table[doy][0], set = table[doy][1];
  var bounds = [[rise, 'night', 'dawn'], [570, 'dawn', 'midday'], [900, 'midday', 'afternoon'], [set, 'afternoon', 'night']];
  for (var i = 0; i < 4; i++) {
    var d = m - bounds[i][0];
    if (d > -30 && d < 30) return { from: bounds[i][1], to: bounds[i][2], t: Math.round((d + 30) / 60 * 1e4) / 1e4 };
  }
  var ph = m >= set || m < rise ? 'night' : m < 570 ? 'dawn' : m < 900 ? 'midday' : 'afternoon';
  return { from: ph, to: ph, t: 0 };
}
