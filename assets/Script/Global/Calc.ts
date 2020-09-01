
export const calcHitChance = (accuracy, dodge) => {
	return (accuracy - dodge + 50) / 100
}