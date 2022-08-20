
function swap (arr: any[], a: number, b: number) {
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
