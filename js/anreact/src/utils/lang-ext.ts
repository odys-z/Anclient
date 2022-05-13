// if (!Array.swap) {
// 	/**Usage: arr.swap(a, b);
// 	 * @deprecated
// 	 * see https://stackoverflow.com/a/4011851/7362888
// 	 */
// 	Array.prototype.swap = function(a, b){
// 	    this[a] = this.splice(b, 1, this[a])[0];
// 	    return this;
// 	}


// 	/**
// 	 * https://stackoverflow.com/a/563442/7362888
// 	 */
// 	Date.prototype.addDays = function(days) {
// 	    let date = new Date(this.valueOf());
// 	    date.setDate(date.getDate() + days);
// 	    return date;
// 	};

// 	/**
// 	 * @return {string} e.g. '2021-09-11'
// 	 */
// 	Date.prototype.toISOStr = function() {
// 		return this.toISOString().substring(0, 10);
// 	};
// }

function swap (arr, a, b) {
	if (Array.isArray(arr)) {
		arr[a] = arr.splice(b, 1, arr[a])[0];
		return arr;
	}
	else return arr;
}

/**
 * reference: https://stackoverflow.com/a/563442/7362888
 */
function addDays (date: Date | undefined, days: number) {
	if (!date)
		date = new Date();
	date.setDate(date.getDate() + days);
	return date;
};

export {swap, addDays}
