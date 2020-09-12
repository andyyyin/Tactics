
const c: any = {}

c.default = (unit, point, [length]) => ({cover: [point]})

c['横扫'] = (unit, point, [length], blockDisable = true) => {
	let Map = unit.Map
	let stand = unit.curPos
	length = length || 1
	let cover = [point]
	let isSameRow = Map.isSameRow(stand, point)
	let isSameCol = Map.isSameCol(stand, point)
	let disabled = []
	for (let i = 0; i < length; i++) {
		if (isSameCol) {
			cover.unshift(Map.toLeft(cover[0]))
			cover.push(Map.toRight(cover[cover.length - 1]))
		} else if (isSameRow) {
			cover.unshift(Map.toUp(cover[0]))
			cover.push(Map.toDown(cover[cover.length - 1]))
		}
		if (Map.isBlocked(cover[0])) {
			let bp = cover.shift()
			if (blockDisable) disabled.push(bp)
		}
		if (Map.isBlocked(cover[cover.length - 1])) {
			let bp = cover.pop()
			if (blockDisable) disabled.push(bp)
		}
	}
	if (disabled.length) cover = null
	return {cover, disabled}
}
c['横排灵活'] = (unit, point, [length]) => {
	return c['横扫'](unit, point, [length], false)
}

c['三角'] = (unit, point) => {
	let Map = unit.Map
	let stand = unit.curPos
	let cover = [point]
	let {x: rx, y: ry} = Map.relativeTo(stand, point)
	if (rx > 0) cover.push(Map.toLeft(point))
	if (rx < 0) cover.push(Map.toRight(point))
	if (ry < 0) cover.push(Map.toDown(point))
	if (ry > 0) cover.push(Map.toUp(point))

	let disabled = cover.filter(ip => Map.isBlocked(ip))
	if (disabled.length) {
		cover = null
	}
	return {cover, disabled}
}

c['直线畅通'] = (unit, point, [length]) => {
	let Map = unit.Map
	let stand = unit.curPos
	if (Map.isBlocked(point)) return {disabled: [point]}
	let cover = [point]
	let {x: rx, y: ry} = Map.relativeTo(stand, point)
	for (let i = 1; i <= length; i++) {
		let next
		if (rx > 0) next = Map.toRight(cover[cover.length - 1])
		if (rx < 0) next = Map.toLeft(cover[cover.length - 1])
		if (ry < 0) next = Map.toUp(cover[cover.length - 1])
		if (ry > 0) next = Map.toDown(cover[cover.length - 1])
		if (Map.isBlocked(next) || Map.isOutOfMap(next)) break
		cover.push(next)
	}
	let animPos = cover[cover.length - 1]
	return {cover, animPos}
}

/* ---------------------- end ---------------------- */

// let cKeys = Object.keys(c)
// let cEnum: any = {}
// cKeys.map((k, i) => {
// 	cEnum[k] = i
// })
//
// export const getCoverFun = (n) => {
// 	return c[cKeys[n]]
// }
//
// export const CoverFun = cc.Enum(cEnum)

export default c