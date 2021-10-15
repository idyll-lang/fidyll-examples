
const MATH = require('mathjs');

const { matrix, mean, index, row, column, subset, eigs } = MATH;

const inputData = require('../data/member-votes-clean-116.json');

const memberVoteData = inputData.reduce((memo, rollcall) => {
  if (!memo[rollcall.icpsr]) {
    memo[rollcall.icpsr] = {};
  }

  memo[rollcall.icpsr][rollcall.rollnumber] = rollcall.cast_code;

  return memo;
}, {});

const memberIds = Object.keys(memberVoteData);//.filter((d, i) => i < 11);
memberIds.sort();

const yeaCodes = [1, 2, 3];
const nayCodes = [4, 5, 6];

const agreement = memberIds.map((rowMember) => {
  const numerators = memberIds.map((columnMember) => {
    return Object.keys(memberVoteData[columnMember]).reduce((memo, rollnumber) => {
      if (yeaCodes.includes(memberVoteData[columnMember][rollnumber]) && yeaCodes.includes(memberVoteData[rowMember][rollnumber])) {
        return memo + 1;
      } else if (nayCodes.includes(memberVoteData[columnMember][rollnumber]) && nayCodes.includes(memberVoteData[rowMember][rollnumber])) {
        return memo + 1;
      }
      return memo;
    }, 0);
  });

  const denominators = memberIds.map((columnMember) => {
    return Object.keys(memberVoteData[columnMember]).reduce((memo, rollnumber) => {
      const colVoted = yeaCodes.includes(memberVoteData[columnMember][rollnumber]) || nayCodes.includes(memberVoteData[columnMember][rollnumber]);
      const rowVoted = yeaCodes.includes(memberVoteData[rowMember][rollnumber]) || nayCodes.includes(memberVoteData[rowMember][rollnumber]);
      if (colVoted && rowVoted) {
        return memo + 1;
      }
      return memo;
    }, 0);
  });

  return numerators.map((n, i) => {
    return n / denominators[i] || 0;
  });
});

const squaredDistances = agreement.map((rows) => {
  return rows.map((column) => {
    return Math.pow(1 - column, 2);
  });
});



console.log(squaredDistances);
const _rowMeans = squaredDistances.map((_, i) => {
  return mean(row(squaredDistances, i));
});
const _colMeans = squaredDistances.map((_, i) => {
  return mean(column(squaredDistances, i));
});
const matrixMean = mean(matrix(squaredDistances));

// console.log(squaredDistances)
squaredDistances.forEach((_row, rowIndex) => {
  _row.forEach((val, colIndex) => {
    squaredDistances[rowIndex][colIndex] = (val - _rowMeans[rowIndex] - _colMeans[colIndex] + matrixMean) / -2;
  });
});
// console.log(squaredDistances);

// TODO - do we also need to sort the columns of the eigenvectors?
const { values: eigenvalues, vectors: eigenvectors } = eigs(matrix(squaredDistances));
const eigenvalsSorted = MATH.diag(MATH.sort(eigenvalues, 'desc'));
console.log(eigenvalues);

const N_DIMS = 2;
for (var _i = 0; _i < MATH.size(eigenvalues).subset(index(0)); _i++) {
  if (_i < N_DIMS) {
    eigenvalsSorted._data[_i][_i] = Math.sqrt(eigenvalsSorted._data[_i][_i]);
  } else {
    eigenvalsSorted._data[_i][_i] = 0.0;
  }
}

const startingPositions = MATH.multiply(matrix(eigenvectors), matrix(eigenvalsSorted));

for (var _i = 0; _i < MATH.size(eigenvalues).subset(index(0)); _i++) {
  console.log(subset(startingPositions, index(_i, [0, 1]))._data);
}

