import { Projection } from 'mongo-eventstore'

import { ProductEvent } from './events'

export type AvailabilityProjection = Projection & {
  type: 'Availability'
  quantity: number
}

export function projectAvailabilty(
  currentState: Partial<AvailabilityProjection>,
  event: ProductEvent
): Partial<AvailabilityProjection> {
  switch (event.type) {
    case 'ProductAdjusted': {
      const projection: AvailabilityProjection = {
        id: event.streamId,
        type: 'Availability',
        quantity: event.data.quantity
      }
      return projection
    }
    case 'ProductReceived': {
      return {
        ...currentState,
        quantity: currentState.quantity + event.data.quantity
      }
    }
    case 'ProductShipped': {
      return {
        ...currentState,
        quantity: currentState.quantity - event.data.quantity
      }
    }
    default:
      return currentState
  }
}
