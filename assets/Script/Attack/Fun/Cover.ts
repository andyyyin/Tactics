
const c: any = {}

c.default = (unit, point, [length]) => [point]

c.sweep = (unit, point, [length]) => {
	let Map = unit.Map
	let stand = unit.tempPos || unit.iPos
	length = length || 1
	let result = [point]
	let isSameRow = Map.isSameRow(stand, point)
	let isSameCol = Map.isSameCol(stand, point)
	for (let i = 0; i < length; i++) {
		if (isSameCol) {
			result.unshift(Map.toLeft(result[0]))
			result.push(Map.toRight(result[result.length - 1]))
		} else if (isSameRow) {
			result.unshift(Map.toUp(result[0]))
			result.push(Map.toDown(result[result.length - 1]))
		}
	}
	return result
}

/* ---------------------- end ----------------------*/

let cKeys = Object.keys(c)
let cEnum: any = {}
cKeys.map((k, i) => {
	cEnum[k] = i
})

export const getCoverFun = (n) => {
	return c[cKeys[n]]
}

export const CoverFun = cc.Enum(cEnum)