// pred: element => bool
const find = (iter, pred) => iter.length === 0 ? None() : (pred(iter[0]) ? Some(iter[0]) : this.find(iter.slice(1), pred));