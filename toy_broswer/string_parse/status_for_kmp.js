function match(str, pattern) {
    let i = 0, j = 0,
        arr = PMT(pattern);
    while (i < str.length) {
        if (j === -1 || str[i] === str[j]) {
            if (j === arr.length - 1) return 'success';
            i++;
            j++;
        } else {
            j = arr[j];
        }
    }
    return 'failed';
}
// compute the next number when unmatched
// abababc
// 0012340
function PMT(p) {
    let arr = [-1];
    let i = 0, j = -1;
    while (i < p.length) {
        if (j === -1 || p[i] === p[j]) {
            ++i;
            ++j;
            arr[i] = j;
        } else {
            j = arr[j];
        }
    }
    return arr;
}
console.log(match('abababbabababaaaac', 'aac'));