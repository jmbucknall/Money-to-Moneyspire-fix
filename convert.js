/*jslint es6:true node:true white */
"use strict";

var fs = require('fs');
var readLine = require('readline');

var processQif = function(fileName) {
   
  var createEOFProcess = function (writer) {
    return function () {
      console.log('***EOF***');
      writer.end();
    };
  };

  var writeLine = function(writer, line) {
    writer.write(line + '\r\n');
  };

  var writeCompleteRecord = function (record, writer) {
    var canWriteRecord = false;
    if (record.isFirstRecord) {
      canWriteRecord = true;
    }
    else if (!record.isTransfer) {
      canWriteRecord = true;
    }
    else if (record.isNegativeValue) {
      canWriteRecord = true;
    }

    if (canWriteRecord) {
      record.lines.forEach((line) => writeLine(writer, line));
      writeLine(writer, '^');
    }
  };

  var createNewRecord = function () {
    return { 
      isFirstRecord: false,
      isTransfer: false,
      isNegativeValue: false,
      lines: [] 
    };
  }

  var createLineReader = function (record, writer) {
    return function(line) {
      if (line === '') { return; }

      if (line[0] === '^') {
        writeCompleteRecord(record, writer);
        record = createNewRecord();
      }
      else {
        var lineType = line[0];
        if (lineType === '!') {
          record.isFirstRecord = true;
        }
        else if ((lineType === 'L') && (line[1]) === '[') {
          record.isTransfer = true;
        }
        else if ((lineType === 'T') && (line[1] === '-')) {
          record.isNegativeValue = true;
        }
        record.lines.push(line);
      }
    };
  };

  var record = createNewRecord();
  
  var writer = fs.createWriteStream('Fixed-' + fileName, { encoding: 'utf8' });

  readLine.createInterface({
    input: fs.createReadStream(fileName)
  })
    .on('line', createLineReader(record, writer))
    .on('close', createEOFProcess(writer));
};

var processAllQifFiles = function(fileList) {
  fileList.forEach(processQif);
};

fs.readdir('.', function(err, files) {
  if (err) {
    console.log(err.message);
  }
  else {
    var qifFiles = files.filter((name) => name.indexOf('.qif') > -1);
    processAllQifFiles(qifFiles);
  }
});
