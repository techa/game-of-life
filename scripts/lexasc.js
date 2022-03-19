import { readFile, writeFile } from 'fs/promises';
readFile('./lex_asc/lexicon.txt', 'utf-8').then(function (txt) {
    var arr = [];
    txt.replace(/(\t[.*]+\n)+/gm, function (cap) {
        arr.push(cap
            .replace(/[^.*\n]/g, '')
            .split('\n')
            .filter(function (str) { return str; })
            .map(function (str) { return str.split('').map(function (v) { return (v === '*' ? 1 : 0); }); }));
        return '';
    });
    var arr2 = arr.filter(function (cells) { return cells.length + cells[0].length >= 60; });
    writeFile('./src/resource/lexicon.json', JSON.stringify(arr2, null, 4));
});
