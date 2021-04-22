// pred: element => bool
const find = (iter, pred) => iter.length === 0 
	? None() 
	: (pred(iter[0]) ? Some(iter[0]) : this.find(iter.slice(1), pred));

const makeArray = (size, makeItemFromIdxFn) => [...Array(size).keys()].map(idx => makeItemFromIdxFn(idx));