export interface BaseControls {
  enable(): void
  disable(): void
  update(time?: number): void
}

/**
 * Event: Fired when attempting to go the the next/previous point of interest, but none exists
 * Fired on `StoryPointsControls` and `PathPointsControls`. `controls.addEventListener('ExitPOIs', ...)`
 * */
export interface ExitPOIsEvent {
  type: 'ExitPOIs'
  exitFrom: 'start' | 'end'
}

/**
 * Event: Fired when transitioning between points of interest. Fired on `StoryPointsControls` and `PathPointsControls`. `controls.addEventListener('update', ...)`
 * */
export interface UpdatePOIsEvent {
  type: 'update'
  currentIndex: number
  upcomingIndex: number
  progress: number
}
