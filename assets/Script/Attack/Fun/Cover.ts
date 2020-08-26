
const c: any = {}

c.default = (unit, point, [length]) => [point]

c['横扫'] = (unit, point, [length]) => {
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

c['三角'] = (unit, point) => {
	let Map = unit.Map
	let stand = unit.tempPos || unit.iPos
	let result = [point]
	let {x: rx, y: ry} = Map.relativeTo(stand, point)
	if (rx > 0) result.push(Map.toLeft(point))
	if (rx < 0) result.push(Map.toRight(point))
	if (ry < 0) result.push(Map.toDown(point))
	if (ry > 0) result.push(Map.toUp(point))
	return result
}

c['直线畅通'] = (unit, point, [length]) => {
	let Map = unit.Map
	let stand = unit.tempPos || unit.iPos
	let result = [point]
	let {x: rx, y: ry} = Map.relativeTo(stand, point)
	for (let i = 1; i <= length; i++) {
		let next
		if (rx > 0) next = Map.toRight(result[result.length - 1])
		if (rx < 0) next = Map.toLeft(result[result.length - 1])
		if (ry < 0) next = Map.toUp(result[result.length - 1])
		if (ry > 0) next = Map.toDown(result[result.length - 1])
		if (Map.isBlocked(next) || Map.isOutOfMap(next)) break
		result.push(next)
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