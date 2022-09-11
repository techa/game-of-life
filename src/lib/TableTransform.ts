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
			const table: Cell[][] = []
			;[this.rows, this.columns] = [this.columns, this.rows]
			for (let y = 0; y < this.rows; y++) {
				if (!table[y]) table[y] = []
				for (let x = 0; x < this.columns; x++) {
					table[y][x] = this.table[this.columns - x - 1][y]
				}
			}
			this.table = table
			this.emit(LifeEvent.TABLE_UPDATE)
		}

		/**
		 * DEATH <--> LIVE
		 * TOMB <--> UNDEAD
		 */
		reverse(): void {
			for (let y = 0; y < this.rows; y++) {
				for (let x = 0; x < this.columns; x++) {
					const cell = this.table[y][x]
					this.table[y][x] =
						cell === Cell.DEATH
							? Cell.LIVE
							: cell === Cell.LIVE
							? Cell.DEATH
							: cell === Cell.UNDEAD
							? Cell.TOMB
							: cell === Cell.TOMB
							? Cell.UNDEAD
							: cell // age
				}
			}
			this.update()
		}
	}
}
