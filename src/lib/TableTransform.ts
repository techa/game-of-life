import { Cell, LifeEvent, type LifeGame } from './LifeGame.js'

export interface TableTransform {
	rotate(): void
	reverse(): void
}
// eslint-disable-next-line @typescript-eslint/no-redeclare
export function TableTransform<T extends { new (...args: any[]): LifeGame }>(
	target: T,
) {
	return class extends target implements TableTransform {
		rotate(): void {
			if (this.cells.isEmpty()) {
				return
			}
			this.cells.rotate()
			this.emit(LifeEvent.TABLE_UPDATE)
		}

		/**
		 * DEATH <--> LIVE
		 * TOMB <--> UNDEAD
		 */
		reverse(): void {
			this.cells.each((cell) => {
				return cell === Cell.DEATH
					? Cell.LIVE
					: cell === Cell.UNDEAD
					? Cell.TOMB
					: cell === Cell.TOMB
					? Cell.UNDEAD
					: Cell.DEATH // Cell.LIVE & age
			})
			this.update()
		}
	}
}
