const fs = require('fs');
const p = 'apps/home/src/styles/index.css';
let s = fs.readFileSync(p, 'utf8');
const oldLine = "@import '../../../../styles/base.css';";
const newLine = '@import "../../../../styles/base.css";';
if (s.includes(oldLine)) {
  s = s.replace(oldLine, newLine);
  fs.writeFileSync(p, s);
  console.log('replaced');
} else if (s.includes(newLine)) {
  console.log('already');
} else {
  console.log('no-match');
}
