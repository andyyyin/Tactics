
export const wait = (time) => {
	return new Promise(resolve => {
		setTimeout(resolve, time)
	})
}

export const isNum = (value) => {
	return typeof value === 'number'
}